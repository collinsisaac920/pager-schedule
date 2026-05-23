import crypto from "node:crypto";

import { prisma } from "@calcom/prisma";

const OTP_EXPIRY_MINUTES = 10;

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@pagerschedule.com";
  const fromName = process.env.EMAIL_FROM_NAME ?? "Pager Schedule";
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Pager Schedule";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName} <${from}>`,
      to: [to],
      subject: `Your ${appName} login code`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 0;">
          <h2 style="margin:0 0 8px;font-size:20px;color:#111;">${appName} login verification</h2>
          <p style="margin:0 0 24px;color:#555;font-size:14px;">
            Use the code below to complete your sign-in. It expires in ${OTP_EXPIRY_MINUTES} minutes.
          </p>
          <div style="text-align:center;letter-spacing:12px;font-size:36px;font-weight:700;
                      color:#111;background:#f4f4f5;border-radius:8px;padding:20px 0;
                      margin:0 0 24px;">${otp}</div>
          <p style="margin:0;color:#888;font-size:12px;">
            If you didn't try to sign in, you can ignore this email safely.
          </p>
        </div>`,
      text: `Your ${appName} login code: ${otp}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you didn't try to sign in, ignore this email.`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to send OTP email via Resend: ${res.status} ${body}`);
  }
}

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
