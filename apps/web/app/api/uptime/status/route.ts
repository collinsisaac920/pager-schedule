import prisma from "@calcom/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = Math.min(parseInt(searchParams.get("days") ?? "90", 10), 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const logs = await prisma.uptimeLog.findMany({
    where: { checkedAt: { gte: since } },
    select: { status: true, responseMs: true, checkedAt: true },
    orderBy: { checkedAt: "desc" },
    take: 1000,
  });

  const incidents = await prisma.incident.findMany({
    where: { startedAt: { gte: since } },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      service: true,
      startedAt: true,
      resolvedAt: true,
    },
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  const total = logs.length;
  const upCount = logs.filter((l) => l.status === "up").length;
  const uptimePct = total > 0 ? (upCount / total) * 100 : 100;
  const avgLatency =
    logs.length > 0
      ? Math.round(logs.reduce((s, l) => s + l.responseMs, 0) / logs.length)
      : 0;

  // Group by day
  const dailyMap: Record<string, { up: number; total: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    dailyMap[d.toISOString().slice(0, 10)] = { up: 0, total: 0 };
  }
  for (const l of logs) {
    const key = l.checkedAt.toISOString().slice(0, 10);
    if (key in dailyMap) {
      dailyMap[key].total++;
      if (l.status === "up") dailyMap[key].up++;
    }
  }
  const dailySeries = Object.entries(dailyMap).map(([date, d]) => ({
    date,
    uptime: d.total > 0 ? Math.round((d.up / d.total) * 100) : 100,
    checks: d.total,
  }));

  const sla = uptimePct >= 99.9 ? "99.9%" : uptimePct >= 99.5 ? "99.5%" : uptimePct >= 99 ? "99%" : "<99%";
  const isUp = logs.length === 0 || logs[0].status === "up";

  // Map incidents for the status page (use startedAt as createdAt for display)
  const incidentsMapped = incidents.map((inc) => ({
    ...inc,
    severity: inc.status === "investigating" ? "HIGH" : "MEDIUM",
    createdAt: inc.startedAt,
  }));

  return NextResponse.json({
    isUp,
    uptimePct: Math.round(uptimePct * 100) / 100,
    sla,
    avgLatency,
    total,
    dailySeries,
    incidents: incidentsMapped,
    lastChecked: logs[0]?.checkedAt ?? null,
  });
}
