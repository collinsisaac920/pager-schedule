import crypto from "node:crypto";

import { prisma } from "@calcom/prisma";

const OTP_EXPIRY_MINUTES = 10;

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function generateAndStoreOTP(userId: number): Promise<string> {
  const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const identifier = `2fa-otp:${userId}`;
  const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Remove any existing OTP for this user first
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: hashOtp(otp),
      expires,
    },
  });

  return otp;
}

export async function verifyAndConsumeOTP(userId: number, otp: string): Promise<boolean> {
  const identifier = `2fa-otp:${userId}`;
  const record = await prisma.verificationToken.findFirst({ where: { identifier } });

  if (!record) return false;
  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
    return false;
  }

  const isValid = record.token === hashOtp(otp);
  if (isValid) {
    await prisma.verificationToken.deleteMany({ where: { identifier } });
  }

  return isValid;
}
