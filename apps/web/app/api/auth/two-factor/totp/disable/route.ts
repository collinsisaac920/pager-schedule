import { findBackupCode, parseBackupCodeStorage } from "@calcom/features/auth/lib/backupCodeVerifier";
import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { verifyPassword } from "@calcom/features/auth/lib/verifyPassword";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { symmetricDecrypt } from "@calcom/lib/crypto";
import { getEncryptionKey } from "@calcom/lib/getEncryptionKey";
import { totpAuthenticatorCheck } from "@calcom/lib/totp";
import prisma from "@calcom/prisma";
import { IdentityProvider } from "@calcom/prisma/enums";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { parseRequestData } from "app/api/parseRequestData";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function handler(req: NextRequest) {
  const body = await parseRequestData(req);
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (!session.user?.id) {
    console.error("Session is missing a user id.");
    return NextResponse.json({ error: ErrorCode.InternalServerError }, { status: 500 });
  }

  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: `api:totp-disable:${session.user.id}`,
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      identityProvider: true,
      twoFactorEnabled: true,
      twoFactorSecret: true,
      backupCodes: true,
      password: { select: { hash: true } },
    },
  });

  if (!user) {
    console.error(`Session references user that no longer exists.`);
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  if (!user.password?.hash && user.identityProvider === IdentityProvider.CAL) {
    return NextResponse.json({ error: ErrorCode.UserMissingPassword }, { status: 400 });
  }

  if (!user.twoFactorEnabled) {
    return NextResponse.json({ message: "Two factor disabled" });
  }

  if (user.password?.hash && user.identityProvider === IdentityProvider.CAL) {
    const isCorrectPassword = await verifyPassword(body.password, user.password.hash);
    if (!isCorrectPassword) {
      return NextResponse.json({ error: ErrorCode.IncorrectPassword }, { status: 400 });
    }
  }

  // If user has 2FA and is using a backup code
  if (user.twoFactorEnabled && body.backupCode) {
    if (!user.backupCodes) {
      return NextResponse.json({ error: ErrorCode.MissingBackupCodes }, { status: 400 });
    }

    const encKey = getEncryptionKey();
    const storage = parseBackupCodeStorage(symmetricDecrypt(user.backupCodes, encKey));

    const matchIndex = findBackupCode(storage, body.backupCode as string);
    if (matchIndex === -1) {
      return NextResponse.json({ error: ErrorCode.IncorrectBackupCode }, { status: 400 });
    }

    // Backup codes are wiped entirely when 2FA is disabled below — no need to null this entry.
  } else if (user.twoFactorEnabled) {
    if (!body.code) {
      return NextResponse.json({ error: ErrorCode.SecondFactorRequired }, { status: 400 });
    }

    if (!user.twoFactorSecret) {
      console.error(`Two factor is enabled for user ${session.user.id} but they have no secret`);
      throw new Error(ErrorCode.InternalServerError);
    }

    const secret = symmetricDecrypt(user.twoFactorSecret, getEncryptionKey());
    if (secret.length !== 32) {
      console.error(
        `Two factor secret decryption failed. Expected key with length 32 but got ${secret.length}`
      );
      throw new Error(ErrorCode.InternalServerError);
    }

    const isValidToken = totpAuthenticatorCheck(body.code, secret);
    if (!isValidToken) {
      return NextResponse.json({ error: ErrorCode.IncorrectTwoFactorCode }, { status: 400 });
    }
  }

  // Disable 2FA
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      backupCodes: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  return NextResponse.json({ message: "Two factor disabled" });
}

export const POST = defaultResponderForAppDir(handler);
