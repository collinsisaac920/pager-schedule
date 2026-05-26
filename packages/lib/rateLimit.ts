import process from "node:process";
import { type LimitOptions, Ratelimit, type RatelimitResponse } from "@unkey/ratelimit";
import { isIpInBanListString } from "./getIP";
import logger from "./logger";

const log = logger.getSubLogger({ prefix: ["RateLimit"] });

export type { RatelimitResponse };

export type RateLimitHelper = {
  rateLimitingType?:
    | "core"
    | "forcedSlowMode"
    | "common"
    | "api"
    | "ai"
    | "sms"
    | "smsMonth"
    | "instantMeeting"
    // OTP send limits — see packages/lib/otpRateLimit.ts for usage
    | "otpCooldown" // 3 sends per 10 min, per-user per-channel
    | "otpHourly" // 10 sends per 1 hr, per-user per-channel (hard lock)
    | "otpIpHourly"; // 10 sends per 1 hr, per-IP per-channel
  identifier: string;
  opts?: LimitOptions;
  /**
   * Using a callback instead of a regular return to provide headers even
   * when the rate limit is reached and an error is thrown.
   **/
  onRateLimiterResponse?: (response: RatelimitResponse) => void;
};

export const API_KEY_RATE_LIMIT = 30;

// ---------------------------------------------------------------------------
// Local in-memory sliding-window rate limiter (fallback when Unkey is absent)
// ---------------------------------------------------------------------------
// Each entry maps an identifier to the list of request timestamps (ms) within
// the current window. Old entries are cleaned up lazily on each check.
// NOTE: This is per-process only — multi-instance deployments must use Unkey.
const localStore = new Map<string, number[]>();
const CLEANUP_INTERVAL_MS = 60_000;

/** Remove all timestamps older than windowMs from every tracked identifier. */
function purgeExpiredEntries(windowMs: number) {
  const threshold = Date.now() - windowMs;
  for (const [key, timestamps] of Array.from(localStore.entries())) {
    const fresh = timestamps.filter((t: number) => t > threshold);
    if (fresh.length === 0) {
      localStore.delete(key);
    } else {
      localStore.set(key, fresh);
    }
  }
}

// Periodic cleanup so the map doesn't grow unboundedly in long-running processes.
if (typeof setInterval !== "undefined") {
  setInterval(() => purgeExpiredEntries(300_000), CLEANUP_INTERVAL_MS).unref?.();
}

function localLimit(identifier: string, limit: number, windowMs: number): RatelimitResponse {
  const now = Date.now();
  const threshold = now - windowMs;
  const timestamps = (localStore.get(identifier) ?? []).filter((t) => t > threshold);

  if (timestamps.length >= limit) {
    const oldestInWindow = timestamps[0];
    const reset = oldestInWindow + windowMs;
    return { success: false, limit, remaining: 0, reset };
  }

  timestamps.push(now);
  localStore.set(identifier, timestamps);
  return { success: true, limit, remaining: limit - timestamps.length, reset: now + windowMs };
}

// Config mirrors the Unkey namespaces (limit / window in ms).
const LOCAL_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  core: { limit: 10, windowMs: 60_000 },
  instantMeeting: { limit: 1, windowMs: 600_000 },
  common: { limit: 200, windowMs: 60_000 },
  forcedSlowMode: { limit: 1, windowMs: 30_000 },
  api: { limit: 30, windowMs: 60_000 },
  ai: { limit: 20, windowMs: 86_400_000 },
  sms: { limit: 50, windowMs: 300_000 },
  smsMonth: { limit: 250, windowMs: 2_592_000_000 },
  // OTP send rate limits (see packages/lib/otpRateLimit.ts)
  otpCooldown: { limit: 3, windowMs: 600_000 }, // 3 per 10 min
  otpHourly: { limit: 10, windowMs: 3_600_000 }, // 10 per 1 hr
  otpIpHourly: { limit: 10, windowMs: 3_600_000 }, // 10 per 1 hr (IP-keyed)
};

let warned = false;

export function rateLimiter() {
  const { UNKEY_ROOT_KEY } = process.env;

  if (!UNKEY_ROOT_KEY) {
    if (!warned) {
      log.warn(
        "UNKEY_ROOT_KEY not set — using local in-memory rate limiter. " +
          "This is per-process only; configure UNKEY_ROOT_KEY for distributed deployments."
      );
      warned = true;
    }

    // Return a function that enforces limits locally instead of always succeeding.
    return async ({ rateLimitingType = "core", identifier }: RateLimitHelper) => {
      if (isIpInBanListString(identifier)) {
        return localLimit(
          identifier,
          LOCAL_LIMITS.forcedSlowMode.limit,
          LOCAL_LIMITS.forcedSlowMode.windowMs
        );
      }
      const cfg = LOCAL_LIMITS[rateLimitingType] ?? LOCAL_LIMITS.core;
      return localLimit(identifier, cfg.limit, cfg.windowMs);
    };
  }
  const timeout = {
    fallback: { success: true, limit: 10, remaining: 999, reset: 0 },
    ms: 5000,
  };

  const onError = (err: Error, identifier: string) => {
    log.error("Unkey rate limiter encountered unknown error", {
      error: err.message,
      stack: err.stack,
      identifier,
      timestamp: new Date().toISOString(),
    });
    return { success: true, limit: 10, remaining: 999, reset: 0 };
  };

  const limiter = {
    core: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "core",
      limit: 10,
      duration: "60s",
      timeout,
      onError,
    }),
    instantMeeting: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "instantMeeting",
      limit: 1,
      duration: "10m",
      timeout,
      onError,
    }),
    common: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "common",
      limit: 200,
      duration: "60s",
      timeout,
      onError,
    }),
    forcedSlowMode: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "forcedSlowMode",
      limit: 1,
      duration: "30s",
      timeout,
      onError,
    }),
    api: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "api",
      limit: API_KEY_RATE_LIMIT,
      duration: "60s",
      timeout,
      onError,
    }),
    ai: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "ai",
      limit: 20,
      duration: "1d",
      timeout,
      onError,
    }),
    sms: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "sms",
      limit: 50,
      duration: "5m",
      timeout,
      onError,
    }),
    smsMonth: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "smsMonth",
      limit: 250,
      duration: "30d",
      timeout,
      onError,
    }),
    // OTP send limits — enforced by checkOtpSendRateLimit in packages/lib/otpRateLimit.ts
    otpCooldown: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "otpCooldown",
      limit: 3,
      duration: "10m",
      timeout,
      onError,
    }),
    otpHourly: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "otpHourly",
      limit: 10,
      duration: "1h",
      timeout,
      onError,
    }),
    otpIpHourly: new Ratelimit({
      rootKey: UNKEY_ROOT_KEY,
      namespace: "otpIpHourly",
      limit: 10,
      duration: "1h",
      timeout,
      onError,
    }),
  };

  async function rateLimit({ rateLimitingType = "core", identifier, opts }: RateLimitHelper) {
    if (isIpInBanListString(identifier)) {
      return await limiter.forcedSlowMode.limit(identifier, opts);
    }

    return await limiter[rateLimitingType].limit(identifier, opts);
  }

  return rateLimit;
}
