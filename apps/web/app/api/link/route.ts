import process from "node:process";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { symmetricDecrypt } from "@calcom/lib/crypto";
import { getEncryptionKey } from "@calcom/lib/getEncryptionKey";
import { distributedTracing } from "@calcom/lib/tracing/factory";
import prisma from "@calcom/prisma";
import { confirmHandler } from "@calcom/trpc/server/routers/viewer/bookings/confirm.handler";
import { TRPCError } from "@trpc/server";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

enum DirectAction {
  ACCEPT = "accept",
  REJECT = "reject",
}

const querySchema = z.object({
  action: z.nativeEnum(DirectAction),
  // Encrypted token; cap at 4 KB to prevent oversized-payload DoS.
  token: z.string().max(4096),
  // Rejection reason; cap at 1 KB to prevent oversized input.
  reason: z.string().max(1024).optional(),
});

// Booking UIDs are cuid2-style slugs.
const BOOKING_UID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

const decryptedSchema = z.object({
  bookingUid: z.string().regex(BOOKING_UID_RE, "Invalid booking UID in token"),
  userId: z.number().int().positive(),
  platformClientId: z.string().max(256).optional(),
  // Platform URLs come from our own encrypted payload; validate they are safe URLs.
  platformRescheduleUrl: z.string().url().max(2048).optional(),
  platformCancelUrl: z.string().url().max(2048).optional(),
  platformBookingUrl: z.string().url().max(2048).optional(),
});

async function handler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const { action, token, reason } = querySchema.parse(Object.fromEntries(searchParams.entries()));

  const decryptedData = JSON.parse(
    symmetricDecrypt(decodeURIComponent(token), getEncryptionKey())
  );

  const {
    bookingUid,
    userId,
    platformClientId,
    platformRescheduleUrl,
    platformCancelUrl,
    platformBookingUrl,
  } = decryptedSchema.parse(decryptedData);

  const booking = await prisma.booking.findUniqueOrThrow({
    where: { uid: bookingUid },
  });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
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
        traceContext: distributedTracing.createTrace("confirm_booking_magic_link"),
      },
      input: {
        bookingId: booking.id,
        recurringEventId: booking.recurringEventId || undefined,
        confirmed: action === DirectAction.ACCEPT,
        reason,
        emailsEnabled: true,
        platformClientParams: platformClientId
          ? {
              platformClientId,
              platformRescheduleUrl,
              platformCancelUrl,
              platformBookingUrl,
            }
          : undefined,
      },
    });
  } catch (e) {
    let message = "Error confirming booking";
    if (e instanceof TRPCError) message = (e as TRPCError).message;
    return NextResponse.redirect(
      new URL(`/booking/${bookingUid}?error=${encodeURIComponent(message)}`, WEBAPP_URL)
    );
  }

  return NextResponse.redirect(new URL(`/booking/${bookingUid}`, WEBAPP_URL));
}

export const GET = defaultResponderForAppDir(handler);
