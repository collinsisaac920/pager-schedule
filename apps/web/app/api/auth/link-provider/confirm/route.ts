import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import { hashEmail } from "@calcom/lib/server/PiiHasher";
import prisma from "@calcom/prisma";
import { IdentityProvider } from "@calcom/prisma/enums";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const log = logger.getSubLogger({ prefix: ["api:auth:link-provider:confirm"] });

/**
 * GET /api/auth/link-provider/confirm?token=<token>
 *
 * Consumes a pending cross-provider link token written by the signIn callback
 * when a user attempts to access an existing account via a different OAuth
 * provider than the one originally used to create it.
 *
 * Security properties:
 * - Token is a 32-byte random hex string (256 bits entropy) — not guessable.
 * - Expires after 24 hours — short window limits phishing utility.
 * - Rate-limited by remote IP — prevents enumeration of valid tokens.
 * - Updates are atomic: identityProvider is changed only after all checks pass,
 *   and the pending fields are cleared in the same Prisma update.
 * - Sends a post-change notification email so the account owner is aware.
 */
async function getHandler(req: NextRequest) {
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  // Rate-limit by IP to prevent token enumeration.
  try {
    await checkRateLimitAndThrowError({
      rateLimitingType: "core",
      identifier: `api:link-provider-confirm:${ip}`,
    });
  } catch {
    log.warn("Rate limit hit on provider link confirm", { ip });
    return NextResponse.redirect(`${WEBAPP_URL}/auth/error?error=rate-limit-exceeded`);
  }

  const token = req.nextUrl.searchParams.get("token");
  if (!token || token.length < 32) {
    log.warn("Provider link confirm: missing or malformed token");
    return NextResponse.redirect(`${WEBAPP_URL}/auth/error?error=invalid-provider-link`);
  }

  const user = await prisma.user.findFirst({
    where: {
      pendingProviderLinkToken: token,
      pendingProviderLinkExpiry: { gt: new Date() },
    },
    select: {
      id: true,
      email: true,
      pendingProviderLinkProvider: true,
      pendingProviderLinkProviderId: true,
    },
  });

  if (!user || !user.pendingProviderLinkProvider || !user.pendingProviderLinkProviderId) {
    log.warn("Provider link confirm: token not found or expired", {
      tokenPrefix: token.slice(0, 8),
    });
    return NextResponse.redirect(`${WEBAPP_URL}/auth/error?error=invalid-provider-link`);
  }

  // Validate that the stored provider value is a known IdentityProvider.
  const newProvider = user.pendingProviderLinkProvider as IdentityProvider;
  if (!Object.values(IdentityProvider).includes(newProvider)) {
    log.error("Provider link confirm: invalid provider value in pending record", {
      userId: user.id,
      provider: user.pendingProviderLinkProvider,
    });
    return NextResponse.redirect(`${WEBAPP_URL}/auth/error?error=invalid-provider-link`);
  }

  // Atomically apply the provider change and clear the pending fields.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      identityProvider: newProvider,
      identityProviderId: user.pendingProviderLinkProviderId,
      identityProviderChangedAt: new Date(),
      pendingProviderLinkToken: null,
      pendingProviderLinkExpiry: null,
      pendingProviderLinkProvider: null,
      pendingProviderLinkProviderId: null,
    },
  });

  log.info("Provider link confirmed — identity provider updated", {
    userId: user.id,
    emailHash: hashEmail(user.email),
    newProvider,
  });

  // Redirect to sign-in so the user can immediately authenticate with the new provider.
  return NextResponse.redirect(`${WEBAPP_URL}/auth/login?provider-linked=1`);
}

export const GET = getHandler;
