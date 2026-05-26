import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { sendTeamInviteEmail } from "@calcom/emails";
import prisma from "@calcom/prisma";
import { MembershipRole } from "@calcom/prisma/enums";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface InviteEntry {
  email: string;
  role?: string;
}

export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);
  const body = await req.json();
  const invites: InviteEntry[] = body.invites ?? [];

  if (!Array.isArray(invites) || invites.length === 0)
    return NextResponse.json({ error: "No invites provided" }, { status: 400 });

  if (invites.length > 100)
    return NextResponse.json({ error: "Maximum 100 invites per batch" }, { status: 400 });

  const membership = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { name: true } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const results: { email: string; status: "invited" | "already_member" | "error"; message?: string }[] = [];

  for (const invite of invites) {
    const email = invite.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      results.push({ email: email ?? "", status: "error", message: "Invalid email" });
      continue;
    }

    const role: MembershipRole = Object.values(MembershipRole).includes(invite.role as MembershipRole)
      ? (invite.role as MembershipRole)
      : MembershipRole.MEMBER;

    try {
      const existingUser = await prisma.user.findFirst({ where: { email }, select: { id: true } });

      if (existingUser) {
        const existing = await prisma.membership.findFirst({
          where: { teamId, userId: existingUser.id },
        });
        if (existing) {
          results.push({ email, status: "already_member" });
          continue;
        }
        await prisma.membership.create({
          data: { teamId, userId: existingUser.id, role, accepted: false },
        });
      }

      try {
        await sendTeamInviteEmail({
          language: "en",
          from: session.user.name ?? "PagerSchedule",
          to: email,
          teamName: team.name,
          joinLink: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/teams`,
          isCalcomMember: Boolean(existingUser),
          isOrg: false,
          parentTeamName: undefined,
          isAutoJoin: false,
          isOrganizationInvite: false,
          inviterName: session.user.name ?? "",
        });
      } catch {
        // non-fatal
      }

      results.push({ email, status: "invited" });
    } catch {
      results.push({ email, status: "error", message: "Failed to process" });
    }
  }

  const invited = results.filter((r) => r.status === "invited").length;
  const skipped = results.filter((r) => r.status === "already_member").length;
  const errors = results.filter((r) => r.status === "error").length;

  return NextResponse.json({ results, summary: { invited, skipped, errors } });
}
