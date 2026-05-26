import crypto from "node:crypto";
import { prisma } from "@calcom/prisma";

/** OTPs expire after 10 minutes. */
export const OTP_EXPIRY_MINUTES = 10;

const OTP_IDENTIFIER_PREFIX = "2fa-otp";

function identifierFor(userId: number) {
  return `${OTP_IDENTIFIER_PREFIX}:${userId}`;
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Generates a 6-digit OTP, stores a SHA-256 hash in VerificationToken, and
 * returns the plaintext OTP to send to the user.
 * Any previously issued OTP for this user is invalidated atomically so two
 * concurrent requests cannot both issue valid tokens (Serializable isolation).
 */
export async function generateAndStoreOTP(userId: number): Promise<string> {
  const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const identifier = identifierFor(userId);

  await prisma.$transaction(
    async (tx) => {
      await tx.verificationToken.deleteMany({ where: { identifier } });
      await tx.verificationToken.create({
        data: {
          identifier,
          token: hashOtp(otp),
          expires: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
        },
      });
    },
    { isolationLevel: "Serializable" }
  );

  return otp;
}

/**
 * Verifies a plaintext OTP against the stored hash and atomically consumes it.
 * Uses deleteMany so two concurrent verifications cannot both succeed —
 * only the first delete touches a row; the second deletes zero rows.
 * Returns true only when exactly one token was deleted.
 */
export async function verifyAndConsumeOTP(userId: number, otp: string): Promise<boolean> {
  const identifier = identifierFor(userId);
  const hash = hashOtp(otp.trim());

  const result = await prisma.verificationToken.deleteMany({
    where: {
      identifier,
      token: hash,
      expires: { gt: new Date() },
    },
  });

  return result.count === 1;
}
