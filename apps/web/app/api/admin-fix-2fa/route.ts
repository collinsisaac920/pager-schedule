import { NextResponse } from "next/server";
import prisma from "@calcom/prisma";

const FIX_TOKEN = "ps-fix-2fa-9q3r5w";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("token") !== FIX_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findFirst({
    where: { email: "collins.isaac92@yahoo.com" },
    select: { id: true, email: true, twoFactorEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
    },
  });

  // Clean up any stale OTP tokens
  await prisma.verificationToken.deleteMany({
    where: { identifier: `2fa-otp:${user.id}` },
  });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    email: user.email,
    message: "2FA disabled. You can now log in without a 2FA code.",
  });
}
