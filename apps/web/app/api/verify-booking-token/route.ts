import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { HttpError } from "@calcom/lib/http-error";
import getIP from "@calcom/lib/getIP";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import { distributedTracing } from "@calcom/lib/tracing/factory";
import prisma from "@calcom/prisma";
import { confirmHandler } from "@calcom/trpc/server/routers/viewer/bookings/confirm.handler";
import { TRPCError } from "@trpc/server";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

enum DirectAction {
  ACCEPT = "accept",
  REJECT = "reject",
}

// Booking UIDs are cuid2 slugs (alphanumeric + underscores, 10–36 chars).
// Constraining the format prevents open-redirect payloads in error redirects.
const BOOKING_UID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

const querySchema = z.object({
  action: z.nativeEnum(DirectAction),
  // Tokens are short-lived one-time passwords; cap length to prevent abuse.
  token: z.string().max(512),
  bookingUid: z.string().regex(BOOKING_UID_RE, "Invalid booking UID format"),
  // userId must be a positive integer supplied as a string by the redirect link.
  userId: z.string().regex(/^\d{1,15}$/, "Invalid user ID format"),
});

async function getHandler(request: NextRequest) {
  const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  // Safe fallback for error redirects — validated uid, or empty string (redirects to /booking/).
  const safeBookingUid = BOOKING_UID_RE.test(queryParams.bookingUid ?? "") ? queryParams.bookingUid : "";

  try {
    const ip = getIP(request);
    // Prevent brute-forcing one-time booking tokens — core limit (10 req/min per IP).
    await checkRateLimitAndThrowError({
      rateLimitingType: "core",
      identifier: `api:verify-booking-token:${piiHasher.hash(ip)}`,
    });

    const { action, token, bookingUid, userId } = querySchema.parse(queryParams);

    if (action === DirectAction.REJECT) {
      // Rejections should use POST method
      return NextResponse.redirect(
        new URL(
          `/booking/${bookingUid}?error=${encodeURIComponent("Rejection requires POST method")}`,
          WEBAPP_URL
        )
      );
    }

    return await handleBookingAction(action, token, bookingUid, userId, request, undefined);
  } catch (e) {
    // Rate limit errors surface as HttpError 429.
    if (e instanceof HttpError && e.statusCode === 429) {
      return NextResponse.json({ message: e.message }, { status: 429 });
    }
    return NextResponse.redirect(
      new URL(`/booking/${safeBookingUid}?error=${encodeURIComponent("Error confirming booking")}`, WEBAPP_URL)
    );
  }
}

async function postHandler(request: NextRequest) {
  const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const safeBookingUid = BOOKING_UID_RE.test(queryParams.bookingUid ?? "") ? queryParams.bookingUid : "";

  try {
    const ip = getIP(request);
    await checkRateLimitAndThrowError({
      rateLimitingType: "core",
      identifier: `api:verify-booking-token:${piiHasher.hash(ip)}`,
    });

    const { action, token, bookingUid, userId } = querySchema.parse(queryParams);
    const body = await parseRequestData(request).catch(() => ({}));
    const { reason } = z.object({ reason: z.string().optional() }).parse(body || {});

    return await handleBookingAction(action, token, bookingUid, userId, request, reason);
  } catch (e) {
    if (e instanceof HttpError && e.statusCode === 429) {
      return NextResponse.json({ message: e.message }, { status: 429 });
    }
    return NextResponse.redirect(
      new URL(`/booking/${safeBookingUid}?error=${encodeURIComponent("Error confirming booking")}`, WEBAPP_URL),
      { status: 303 }
    );
  }
}

async function handleBookingAction(
  action: DirectAction,
  token: string,
  bookingUid: string,
  userId: string,
  _request: NextRequest,
  reason?: string
) {
  const booking = await prisma.booking.findUnique({
    where: { oneTimePassword: token },
  });

  if (!booking) {
    return NextResponse.redirect(
      new URL(`/booking/${bookingUid}?error=${encodeURIComponent("Error confirming booking")}`, WEBAPP_URL),
      { status: 303 }
    );
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: Number(userId) },
    select: {
      id: true,
      uuid: true,
      email: true,
      username: true,
      role: true,
      destinationCalendar: true,
    },
  });

  try {
    await confirmHandler({
      ctx: {
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          username: user.username ?? "",
          role: user.role,
          destinationCalendar: user.destinationCalendar ?? null,
        },
        traceContext: distributedTracing.createTrace("confirm_booking_verify_token"),
      },
      input: {
        bookingId: booking.id,
        recurringEventId: booking.recurringEventId || undefined,
        confirmed: action === DirectAction.ACCEPT,
        /** Ignored reason input unless we're rejecting */
        reason: action === DirectAction.REJECT ? reason : undefined,
        emailsEnabled: true,
      },
    });
  } catch (e) {
    let message = "Error confirming booking";
    if (e instanceof TRPCError) message = (e as TRPCError).message;
    return NextResponse.redirect(
      new URL(`/booking/${booking.uid}?error=${encodeURIComponent(message)}`, WEBAPP_URL),
      { status: 303 }
    );
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { oneTimePassword: null },
  });

  return NextResponse.redirect(new URL(`/booking/${booking.uid}`, WEBAPP_URL), { status: 303 });
}

export const GET = defaultResponderForAppDir(getHandler);
export const POST = defaultResponderForAppDir(postHandler);
