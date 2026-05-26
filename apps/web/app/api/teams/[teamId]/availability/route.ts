import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);

  const membership = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { timeZone: true, weekStart: true },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // Derive the most-used scheduling type from team event types
  const eventTypes = await prisma.eventType.findMany({
    where: { teamId },
    select: { schedulingType: true },
  });
  const typeCounts: Record<string, number> = {};
  for (const et of eventTypes) {
    if (et.schedulingType) typeCounts[et.schedulingType] = (typeCounts[et.schedulingType] ?? 0) + 1;
  }
  const schedulingType =
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "ROUND_ROBIN";

  return NextResponse.json({
    schedulingType,
    timeZone: team.timeZone,
    weekStart: team.weekStart,
    bufferBefore: 0,
    bufferAfter: 0,
  });
}

export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);
  const body = await req.json();

  const membership = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const update: Record<string, unknown> = {};
  if (body.timeZone && typeof body.timeZone === "string") update.timeZone = body.timeZone;
  if (body.weekStart && typeof body.weekStart === "string") update.weekStart = body.weekStart;

  if (Object.keys(update).length > 0) {
    await prisma.team.update({ where: { id: teamId }, data: update });
  }

  return NextResponse.json({ ok: true });
}
