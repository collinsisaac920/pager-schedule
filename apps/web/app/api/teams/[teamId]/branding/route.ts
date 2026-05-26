import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function assertAdmin(teamId: number, userId: number) {
  const m = await prisma.membership.findFirst({
    where: { teamId, userId, accepted: true },
    select: { role: true },
  });
  return m && ["OWNER", "ADMIN"].includes(m.role);
}

export async function GET(_req: NextRequest, { params }: { params: { teamId: string } }) {
  const teamId = parseInt(params.teamId, 10);
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { brandLogo: true, brandColor: true, brandName: true, hidePagerScheduleBranding: true },
  });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(team);
}

export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);
  if (!(await assertAdmin(teamId, session.user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  await prisma.team.update({
    where: { id: teamId },
    data: {
      brandLogo: body.brandLogo ?? null,
      brandColor: body.brandColor ?? null,
      brandName: body.brandName ?? null,
      hidePagerScheduleBranding: Boolean(body.hidePagerScheduleBranding),
    },
  });

  return NextResponse.json({ ok: true });
}
