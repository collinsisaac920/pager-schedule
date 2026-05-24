import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { verifyPassword } from "@calcom/features/auth/lib/verifyPassword";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { generateAndStoreOTP } from "@calcom/lib/generateLoginOTP";
import { isTwilioConfigured, sendSmsOtp } from "@calcom/lib/twilioSms";
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
    identifier: `api:sms-2fa-send-otp:${session.user.id}`,
  });

  const { password, phone } = body as { password?: string; phone?: string };
  if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: { select: { hash: true } } },
  });

  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (!user.password?.hash) return NextResponse.json({ error: ErrorCode.UserMissingPassword }, { status: 400 });

  const isCorrectPassword = await verifyPassword(password, user.password.hash);
  if (!isCorrectPassword) return NextResponse.json({ error: ErrorCode.IncorrectPassword }, { status: 403 });

  const otp = await generateAndStoreOTP(user.id);
  await sendSmsOtp(phone, otp);

  return NextResponse.json({ message: "OTP sent" });
}

export const POST = defaultResponderForAppDir(postHandler);
