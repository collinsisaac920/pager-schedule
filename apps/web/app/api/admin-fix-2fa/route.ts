import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import prisma from "@calcom/prisma";

// One-time fix endpoint — DELETE after use
const FIX_TOKEN = "ps-fix-2fa-7x9k2m";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== FIX_TOKEN) {
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
      data: { twoFactorEnabled: false, phoneForTwoFactor: null },
    });
    await prisma.verificationToken.deleteMany({
      where: { identifier: `2fa-otp:${admin.id}` },
    });
    fixed.push(admin.email);
  }

  return NextResponse.json({ fixed, message: "2FA disabled. DELETE this endpoint now." });
}
