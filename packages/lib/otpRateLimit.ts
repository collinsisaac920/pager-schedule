import { checkRateLimitAndThrowError } from "./checkRateLimitAndThrowError";
import logger from "./logger";
import { piiHasher } from "./server/PiiHasher";

const log = logger.getSubLogger({ prefix: ["OtpRateLimit"] });

export type OtpChannel = "email" | "sms";

export interface OtpSendRateLimitOptions {
  userId: number;
  email: string;
  /**
   * Real client IP extracted from request headers.
   * Pass "127.0.0.1" when the IP is unavailable (e.g. in tests) — it will
   * still enforce per-user limits; only the IP-keyed check is weakened.
   */
  ip: string;
  channel: OtpChannel;
}

/**
 * Enforces three independent rate limits on every OTP send operation.
 *
 * Checks run in this order (fail-fast — later checks are skipped on early failure):
 *
 *  1. **IP hourly** (`otpIpHourly`, 10/hr per IP per channel)
 *     Stops one IP from hammering multiple accounts in a credential-stuffing
 *     or account-takeover campaign.  Checked first because it requires no DB
 *     state and catches the broadest abuse pattern early.
 *
 *  2. **Per-user cooldown** (`otpCooldown`, 3/10 min per user per channel)
 *     Prevents OTP inbox flooding on a single account.  A legitimate user
 *     rarely needs more than 1–2 resends in a 10-minute window.
 *
 *  3. **Per-user hourly hard lock** (`otpHourly`, 10/hr per user per channel)
 *     After burning through multiple cooldown windows the account is soft-locked
 *     for OTP sends for the rest of the hour, blocking sustained brute-force
 *     that would cycle through OTP codes (each valid for 10 minutes).
 *
 * All three limits are backed by Unkey when UNKEY_ROOT_KEY is set (distributed,
 * Redis-backed, consistent across Vercel serverless instances) and fall back to
 * per-process in-memory sliding windows in development / single-node deployments.
 *
 * PII handling: email and IP are hashed before logging. User IDs are safe to log.
 *
 * @throws {HttpError} status 429 with a generic "Rate limit exceeded" message.
 */
export async function checkOtpSendRateLimit({
  userId,
  email,
  ip,
  channel,
}: OtpSendRateLimitOptions): Promise<void> {
  const emailHash = piiHasher.hash(email);
  const ipHash = piiHasher.hash(ip);

  // ── 1. IP-level hourly limit ───────────────────────────────────────────────
  // Keyed by hashed IP + channel so email and SMS count separately.
  // Using hashed IP ensures the raw client address never appears in Unkey keys.
  try {
    await checkRateLimitAndThrowError({
      rateLimitingType: "otpIpHourly",
      identifier: `otp-ip:${channel}:${ipHash}`,
    });
  } catch (err) {
    log.warn("OTP send blocked: IP hourly limit exceeded", {
      channel,
      ipHash,
      limitType: "ip-hourly",
    });
    throw err;
  }

  // ── 2. Per-user cooldown (3 per 10 min) ───────────────────────────────────
  // Keyed by userId (not email) so the limit is stable even if the email
  // changes, and user IDs are safe to embed in rate-limit keys.
  try {
    await checkRateLimitAndThrowError({
      rateLimitingType: "otpCooldown",
      identifier: `otp-cooldown:${channel}:${userId}`,
    });
  } catch (err) {
    log.warn("OTP send blocked: per-user cooldown window", {
      channel,
      userId,
      emailHash,
      limitType: "user-cooldown",
    });
    throw err;
  }

  // ── 3. Per-user hourly hard lock (10 per hour) ────────────────────────────
  // Separate namespace from cooldown so an attacker who waits out the 10-min
  // windows still hits the hourly ceiling after 10 total sends.
  try {
    await checkRateLimitAndThrowError({
      rateLimitingType: "otpHourly",
      identifier: `otp-hourly:${channel}:${userId}`,
    });
  } catch (err) {
    log.warn("OTP send blocked: per-user hourly hard lock", {
      channel,
      userId,
      emailHash,
      limitType: "user-hourly",
    });
    throw err;
  }
}
