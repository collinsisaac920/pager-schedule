import prisma from "@calcom/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Called by Vercel cron every 5 minutes
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const start = Date.now();

  let dbUp = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbUp = false;
  }

  const responseMs = Date.now() - start;
  const status = dbUp ? "up" : "down";

  await prisma.uptimeLog.create({
    data: {
      service: "database",
      status,
      responseMs,
      checkedAt: new Date(),
    },
  });

  if (!dbUp) {
    const openIncident = await prisma.incident.findFirst({
      where: { resolvedAt: null, service: "database" },
    });
    if (!openIncident) {
      // createdById is required — use a system sentinel (0 = system) if no user exists
      // In production this cron runs without a session, so we skip incident creation when no admin user found
      const admin = await prisma.user.findFirst({ select: { id: true } });
      if (admin) {
        await prisma.incident.create({
          data: {
            title: "Database connectivity issue",
            description: "Automated health check failed: database unreachable.",
            service: "database",
            status: "investigating",
            createdById: admin.id,
          },
        });
      }
    }
  } else {
    await prisma.incident.updateMany({
      where: { resolvedAt: null, service: "database" },
      data: { resolvedAt: new Date(), status: "resolved" },
    });
  }

  return NextResponse.json({ ok: dbUp, responseMs });
}
