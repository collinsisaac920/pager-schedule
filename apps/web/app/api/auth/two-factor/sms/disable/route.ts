import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { verifyPassword } from "@calcom/features/auth/lib/verifyPassword";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import prisma from "@calcom/prisma";
import { IdentityProvider } from "@calcom/prisma/enums";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

async function postHandler(req: NextRequest) {
  const body = await parseRequestData(req);
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (!session.user?.id) return NextResponse.json({ error: ErrorCode.InternalServerError }, { status: 500 });

  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `api:sms-2fa-disable:${session.user.id}`,
  });

  const { password } = body as { password?: string };
  if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      identityProvider: true,
      twoFactorEnabled: true,
      password: { select: { hash: true } },
    },
  });

  if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (!user.twoFactorEnabled) return NextResponse.json({ message: "Two factor disabled" });

  if (user.password?.hash && user.identityProvider === IdentityProvider.CAL) {
    const isCorrectPassword = await verifyPassword(password, user.password.hash);
    if (!isCorrectPassword) return NextResponse.json({ error: ErrorCode.IncorrectPassword }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null, backupCodes: null, phoneForTwoFactor: null },
  });

  return NextResponse.json({ message: "SMS 2FA disabled" });
}

export const POST = defaultResponderForAppDir(postHandler);
