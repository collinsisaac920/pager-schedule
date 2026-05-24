import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import prisma from "@calcom/prisma";

// One-time fix endpoint to disable 2FA for locked-out admin
// Protected by a secret token — DELETE THIS FILE AFTER USE
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const secret = process.env.NEXTAUTH_SECRET;

  if (!token || !secret || token !== secret.slice(0, 16)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true, twoFactorEnabled: true },
  });

  const fixed: string[] = [];
  for (const admin of admins) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { twoFactorEnabled: false, twoFactorMethod: null, phoneForTwoFactor: null },
    });
    await prisma.verificationToken.deleteMany({
      where: { identifier: `2fa-otp:${admin.id}` },
    });
    fixed.push(admin.email);
  }

  return NextResponse.json({ fixed, message: "2FA disabled. DELETE this endpoint now." });
}
