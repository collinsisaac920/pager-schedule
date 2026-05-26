import process from "node:process";
import type { JWT } from "next-auth/jwt";

/**
 * How long (in seconds) the identity-merge result embedded in the JWT is considered fresh.
 *
 * Background: autoMergeIdentities() runs 4 DB round-trips on every request that calls
 * getServerSession() (the !user path in the JWT callback). The JWT token already carries
 * the merged state (profileId, upId, org, belongsToActiveTeam, …) from the previous call,
 * so re-querying is wasted work as long as the data hasn't changed.
 *
 * This TTL bounds the staleness window. 5 minutes is conservative:
 *   - Profile/org metadata (name, slug, logo) changes very rarely.
 *   - Org role changes should be followed by force-signing-out the affected user,
 *     not relied on TTL propagation.
 *   - Active-team billing status can lag up to TTL seconds after a plan change.
 *
 * Override via IDENTITY_MERGE_CACHE_TTL_SECONDS env var for ops-level tuning without
 * a code deployment. Set to 0 to disable caching entirely (e.g. in integration tests
 * that need real DB state on every call).
 */
export const IDENTITY_MERGE_CACHE_TTL_SECONDS: number = (() => {
  const raw = Number(process.env.IDENTITY_MERGE_CACHE_TTL_SECONDS);
  // A valid positive number wins; 0 disables; missing/NaN falls back to 300.
  if (Number.isFinite(raw) && raw >= 0) return raw;
  return 300;
})();

/**
 * Returns true when the JWT token carries a fresh identity-merge stamp and the 4 DB
 * queries inside autoMergeIdentities() can be skipped safely.
 *
 * A cache HIT requires ALL of the following to be true:
 *   1. token.mergedAt is set  — at least one merge has already run this session
 *   2. token.upId is set      — we have a resolved profile identity (not a partial token)
 *   3. elapsed < ttlSeconds   — the stamp has not expired yet
 *   4. ttlSeconds > 0         — caching is enabled (TTL = 0 disables the cache)
 *
 * The function is intentionally pure (no side-effects, no imports from Prisma) so it
 * can be tested exhaustively without a running database.
 */
export function isMergeCacheFresh(
  token: Pick<JWT, "mergedAt" | "upId">,
  ttlSeconds = IDENTITY_MERGE_CACHE_TTL_SECONDS
): boolean {
  if (ttlSeconds <= 0) return false;
  if (!token.mergedAt || !token.upId) return false;
  const elapsedSeconds = Math.floor(Date.now() / 1000) - token.mergedAt;
  return elapsedSeconds < ttlSeconds;
}

/**
 * Stamps the current Unix second onto the merge result so the next JWT callback can
 * determine when the data was last refreshed.
 *
 * Only called by autoMergeIdentities() when it actually runs DB queries (cache miss).
 * This keeps the mergedAt field truthful — it always reflects the last real DB fetch.
 */
export function stampMergeResult<T extends object>(result: T): T & { mergedAt: number } {
  return { ...result, mergedAt: Math.floor(Date.now() / 1000) };
}
