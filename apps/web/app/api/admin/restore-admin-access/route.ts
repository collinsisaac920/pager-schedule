import process from "node:process";
import prisma from "@calcom/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// One-time admin access restorer.
// Requires: Authorization: Bearer <CRON_API_KEY>
// Resets twoFactorEnabled=false and clears sessions for the admin user.

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/, "");
  if (!token || token !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = "collins.isaac92@yahoo.com";

  try {
    const updated = await prisma.user.updateMany({
      where: { email },
      data: {
        twoFactorEnabled: false,
        locked: false,
        failedLoginAttempts: 0,
      },
    });

    const sessions = await prisma.session.deleteMany({
      where: { user: { email } },
    });

    return NextResponse.json({
      ok: true,
      usersUpdated: updated.count,
      sessionsCleared: sessions.count,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
