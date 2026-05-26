/**
 * POST /api/auth/two-factor/sms/send
 *
 * Sends a Twilio Verify OTP to the supplied phone number so the user can
 * confirm ownership before enabling SMS 2FA.
 *
 * Body: { phoneNumber: string }  (E.164 format, e.g. "+14155552671")
 */
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { sendSmsOTP } from "@calcom/lib/twilioVerify";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

// E.164: optional +, then 7–15 digits.
const E164_RE = /^\+?[1-9]\d{6,14}$/;

const bodySchema = z.object({
  phoneNumber: z.string().regex(E164_RE, "Phone number must be in E.164 format (e.g. +14155552671)"),
});

async function postHandler(req: NextRequest) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Tight rate limit: SMS costs money and can be abused for spam.
  await checkRateLimitAndThrowError({
    rateLimitingType: "sms",
    identifier: `api:2fa-sms-send:${session.user.id}`,
  });

  const body = await parseRequestData(req);
  const { phoneNumber } = bodySchema.parse(body);

  await sendSmsOTP(phoneNumber);

  return NextResponse.json({ message: "Verification code sent." });
}

export const POST = defaultResponderForAppDir(postHandler);
