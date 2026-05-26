/**
 * POST /api/auth/two-factor/sms/verify
 *
 * Verifies the OTP sent to the user's phone and, if correct, saves the phone
 * number and switches their 2FA method to SMS.
 *
 * Body: { phoneNumber: string; code: string; password: string }
 */
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { verifyPassword } from "@calcom/features/auth/lib/verifyPassword";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { verifySmsOTP } from "@calcom/lib/twilioVerify";
import prisma from "@calcom/prisma";
import { TwoFactorMethod } from "@calcom/prisma/enums";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

const E164_RE = /^\+?[1-9]\d{6,14}$/;

const bodySchema = z.object({
  phoneNumber: z.string().regex(E164_RE, "Phone number must be in E.164 format"),
  // Twilio Verify codes are 6 digits.
  code: z.string().length(6).regex(/^\d{6}$/),
  password: z.string().min(1).max(256),
});

async function postHandler(req: NextRequest) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `api:2fa-sms-verify:${session.user.id}`,
  });

  const body = await parseRequestData(req);
  const { phoneNumber, code, password } = bodySchema.parse(body);

  // Require password confirmation before persisting a security change.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password?.hash) {
    return NextResponse.json({ error: ErrorCode.UserMissingPassword }, { status: 400 });
  }

  const isCorrectPassword = await verifyPassword(password, user.password.hash);
  if (!isCorrectPassword) {
    return NextResponse.json({ error: ErrorCode.IncorrectPassword }, { status: 403 });
  }

  const isValid = await verifySmsOTP(phoneNumber, code);
  if (!isValid) {
    return NextResponse.json({ error: ErrorCode.IncorrectOtpCode }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorMethod: TwoFactorMethod.SMS,
      phoneForTwoFactor: phoneNumber,
      // Clear TOTP secret — not needed for SMS method.
      twoFactorSecret: null,
      backupCodes: null,
    },
  });

  return NextResponse.json({ message: "SMS two-factor authentication enabled." });
}

export const POST = defaultResponderForAppDir(postHandler);
