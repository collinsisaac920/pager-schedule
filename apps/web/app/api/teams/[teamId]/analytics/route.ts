import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);
  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "30", 10), 90);

  const membership = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Bookings in period
  const bookings = await prisma.booking.findMany({
    where: { eventType: { teamId }, startTime: { gte: since } },
    select: {
      startTime: true,
      status: true,
      eventType: { select: { title: true, length: true } },
      user: { select: { id: true, name: true } },
    },
  });

  // Daily bookings series
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = 0;
  }
  for (const b of bookings) {
    const key = b.startTime.toISOString().slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }
  const dailySeries = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  // Status breakdown
  const statusMap: Record<string, number> = {};
  for (const b of bookings) {
    statusMap[b.status] = (statusMap[b.status] ?? 0) + 1;
  }
  const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // Per event type
  const eventTypeMap: Record<string, { title: string; count: number; totalMin: number }> = {};
  for (const b of bookings) {
    const title = b.eventType?.title ?? "Unknown";
    if (!eventTypeMap[title])
      eventTypeMap[title] = { title, count: 0, totalMin: 0 };
    eventTypeMap[title].count++;
    eventTypeMap[title].totalMin += b.eventType?.length ?? 0;
  }
  const byEventType = Object.values(eventTypeMap).sort((a, b) => b.count - a.count).slice(0, 10);

  // Per member
  const memberMap: Record<number, { id: number; name: string | null; count: number }> = {};
  for (const b of bookings) {
    if (!b.user) continue;
    if (!memberMap[b.user.id])
      memberMap[b.user.id] = { id: b.user.id, name: b.user.name, count: 0 };
    memberMap[b.user.id].count++;
  }
  const byMember = Object.values(memberMap).sort((a, b) => b.count - a.count);

  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "ACCEPTED").length;
  const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;

  return NextResponse.json({
    total,
    confirmed,
    cancelled,
    dailySeries,
    statusBreakdown,
    byEventType,
    byMember,
    days,
  });
}
