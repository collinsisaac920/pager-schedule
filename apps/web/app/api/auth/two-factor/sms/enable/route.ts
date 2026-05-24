import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { verifyAndConsumeOTP } from "@calcom/lib/generateLoginOTP";
import { isTwilioConfigured } from "@calcom/lib/twilioSms";
import prisma from "@calcom/prisma";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

async function postHandler(req: NextRequest) {
  const body = await parseRequestData(req);
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (!session.user?.id) return NextResponse.json({ error: ErrorCode.InternalServerError }, { status: 500 });

  if (!isTwilioConfigured()) {
    return NextResponse.json({ error: "SMS verification is not configured" }, { status: 503 });
  }

  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `api:sms-2fa-enable:${session.user.id}`,
  });

  const { otp, phone } = body as { otp?: string; phone?: string };
  if (!otp) return NextResponse.json({ error: "OTP code is required" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const isValid = await verifyAndConsumeOTP(user.id, otp);
  if (!isValid) return NextResponse.json({ error: ErrorCode.IncorrectOtpCode }, { status: 403 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorMethod: "SMS",
      twoFactorSecret: null,
      backupCodes: null,
      phoneForTwoFactor: phone,
    },
  });

  return NextResponse.json({ message: "SMS 2FA enabled" });
}

export const POST = defaultResponderForAppDir(postHandler);
