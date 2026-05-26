import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { logAuditEvent } from "@calcom/lib/auditLog";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const header = keys.join(",");
  const body = rows.map((r) => keys.map((k) => escape(r[k])).join(",")).join("\n");
  return `${header}\n${body}`;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId") ? parseInt(searchParams.get("teamId")!, 10) : null;
  const format = searchParams.get("format") === "csv" ? "csv" : "json";
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

  if (teamId) {
    const membership = await prisma.membership.findFirst({
      where: { teamId, userId: session.user.id, accepted: true },
      select: { role: true },
    });
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      ...(teamId
        ? { eventType: { teamId } }
        : { userId: session.user.id }),
      ...(from || to
        ? {
            startTime: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    select: {
      uid: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      attendees: { select: { name: true, email: true } },
      user: { select: { name: true, email: true } },
      eventType: { select: { title: true, length: true } },
    },
    orderBy: { startTime: "desc" },
    take: 5000,
  });

  const rows = bookings.map((b) => ({
    uid: b.uid,
    title: b.title,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    status: b.status,
    hostName: b.user?.name ?? "",
    hostEmail: b.user?.email ?? "",
    eventType: b.eventType?.title ?? "",
    durationMin: b.eventType?.length ?? "",
    attendees: b.attendees.map((a) => `${a.name} <${a.email}>`).join("; "),
  }));

  await prisma.exportJob.create({
    data: {
      userId: session.user.id,
      teamId,
      format,
      dataType: "bookings",
      status: "done",
      recordCount: rows.length,
    },
  });

  if (teamId) {
    await logAuditEvent({
      teamId,
      actorId: session.user.id,
      action: "DATA_EXPORTED",
      resource: "bookings",
      metadata: { format, recordCount: rows.length, from: from?.toISOString(), to: to?.toISOString() },
    });
  }

  if (format === "csv") {
    return new NextResponse(toCSV(rows), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bookings-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({ bookings: rows, total: rows.length });
}
