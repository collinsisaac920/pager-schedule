import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { sendTeamInviteEmail } from "@calcom/emails";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { logAuditEvent } from "@calcom/lib/auditLog";
import { MembershipRole } from "@calcom/prisma/enums";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);
  const body = await req.json();
  const email: string = body.email?.trim().toLowerCase();
  const role: MembershipRole = body.role ?? MembershipRole.MEMBER;

  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
  if (!Object.values(MembershipRole).includes(role))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const caller = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });
  if (!caller || !["OWNER", "ADMIN"].includes(caller.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { name: true } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // Find or check if user already a member
  const existingUser = await prisma.user.findFirst({ where: { email }, select: { id: true } });
  if (existingUser) {
    const existing = await prisma.membership.findFirst({ where: { teamId, userId: existingUser.id } });
    if (existing) return NextResponse.json({ error: "User is already a member" }, { status: 409 });

    await prisma.membership.create({
      data: { teamId, userId: existingUser.id, role, accepted: false },
    });
  }

  // Send invitation email (best-effort)
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

  await logAuditEvent({
    teamId,
    actorId: session.user.id,
    action: "MEMBER_INVITED",
    resource: `email:${email}`,
    metadata: { role },
  });

  return NextResponse.json({ ok: true });
}
