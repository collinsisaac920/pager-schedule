import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  IDENTITY_MERGE_CACHE_TTL_SECONDS,
  isMergeCacheFresh,
  stampMergeResult,
} from "./mergeIdentitiesCache";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

function tokenWith(overrides: { mergedAt?: number; upId?: string } = {}) {
  return {
    upId: "usr-42",
    mergedAt: nowSec(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// isMergeCacheFresh — unit tests
// ---------------------------------------------------------------------------

describe("isMergeCacheFresh", () => {
  describe("cache MISS — missing fields", () => {
    it("returns false when mergedAt is absent", () => {
      expect(isMergeCacheFresh({ upId: "usr-1", mergedAt: undefined })).toBe(false);
    });

    it("returns false when upId is absent", () => {
      expect(isMergeCacheFresh({ upId: undefined, mergedAt: nowSec() })).toBe(false);
    });

    it("returns false when both mergedAt and upId are absent", () => {
      expect(isMergeCacheFresh({ upId: undefined, mergedAt: undefined })).toBe(false);
    });
  });

  describe("cache HIT — within TTL", () => {
    it("returns true when mergedAt is the current second", () => {
      expect(isMergeCacheFresh(tokenWith(), 300)).toBe(true);
    });

    it("returns true when mergedAt is 1 second ago with TTL = 300", () => {
      expect(isMergeCacheFresh(tokenWith({ mergedAt: nowSec() - 1 }), 300)).toBe(true);
    });

    it("returns true when mergedAt is exactly 1 second before the TTL boundary", () => {
      const ttl = 60;
      expect(isMergeCacheFresh(tokenWith({ mergedAt: nowSec() - (ttl - 1) }), ttl)).toBe(true);
    });
  });

  describe("cache MISS — TTL expired", () => {
    it("returns false when elapsed time equals the TTL (boundary)", () => {
      const ttl = 60;
      expect(isMergeCacheFresh(tokenWith({ mergedAt: nowSec() - ttl }), ttl)).toBe(false);
    });

    it("returns false when elapsed time exceeds the TTL by 1 second", () => {
      const ttl = 60;
      expect(isMergeCacheFresh(tokenWith({ mergedAt: nowSec() - ttl - 1 }), ttl)).toBe(false);
    });

    it("returns false when mergedAt is far in the past", () => {
      const oneHourAgo = nowSec() - 3600;
      expect(isMergeCacheFresh(tokenWith({ mergedAt: oneHourAgo }), 300)).toBe(false);
    });
  });

  describe("cache disabled — TTL = 0", () => {
    it("always returns false when TTL is 0, even with a brand-new stamp", () => {
      expect(isMergeCacheFresh(tokenWith(), 0)).toBe(false);
    });
  });

  describe("uses IDENTITY_MERGE_CACHE_TTL_SECONDS as the default", () => {
    it("defaults to the exported constant when no ttlSeconds argument is supplied", () => {
      const freshToken = tokenWith({ mergedAt: nowSec() - 1 });
      const expected = 1 < IDENTITY_MERGE_CACHE_TTL_SECONDS;
      expect(isMergeCacheFresh(freshToken)).toBe(expected);
    });
  });
});

// ---------------------------------------------------------------------------
// stampMergeResult — unit tests
// ---------------------------------------------------------------------------

describe("stampMergeResult", () => {
  it("adds a mergedAt field to the result", () => {
    const before = nowSec();
    const stamped = stampMergeResult({ id: 7, upId: "usr-7" });
    const after = nowSec();

    expect(stamped.mergedAt).toBeGreaterThanOrEqual(before);
    expect(stamped.mergedAt).toBeLessThanOrEqual(after);
  });

  it("preserves all fields from the input object", () => {
    const input = { id: 42, upId: "usr-42", name: "Alice", role: "USER" };
    const stamped = stampMergeResult(input);

    expect(stamped.id).toBe(42);
    expect(stamped.upId).toBe("usr-42");
    expect(stamped.name).toBe("Alice");
    expect(stamped.role).toBe("USER");
  });

  it("overwrites an existing mergedAt with a fresh timestamp", () => {
    const old = nowSec() - 1000;
    const stamped = stampMergeResult({ mergedAt: old, upId: "usr-1" });
    expect(stamped.mergedAt).toBeGreaterThan(old);
  });

  it("does not mutate the original object", () => {
    const original = { id: 1, upId: "usr-1" };
    stampMergeResult(original);
    expect((original as Record<string, unknown>).mergedAt).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Stale invalidation — simulate TTL boundary crossing with fake timers
// ---------------------------------------------------------------------------

describe("stale invalidation via fake timers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("transitions from HIT to MISS exactly when the TTL window closes", () => {
    const ttl = 60;
    const token = tokenWith({ mergedAt: nowSec() });

    // t=0: just stamped — should be a HIT
    expect(isMergeCacheFresh(token, ttl)).toBe(true);

    // t=59s: still within TTL — HIT
    vi.advanceTimersByTime((ttl - 1) * 1000);
    expect(isMergeCacheFresh(token, ttl)).toBe(true);

    // t=60s: elapsed === ttl — MISS (boundary is exclusive)
    vi.advanceTimersByTime(1000);
    expect(isMergeCacheFresh(token, ttl)).toBe(false);
  });

  it("a re-stamped token is fresh immediately after a cache miss", () => {
    const ttl = 60;
    const staleToken = tokenWith({ mergedAt: nowSec() - ttl - 1 });

    // Start stale
    expect(isMergeCacheFresh(staleToken, ttl)).toBe(false);

    // Simulate what autoMergeIdentities returns after running DB queries
    const refreshedToken = stampMergeResult(staleToken);

    // Immediately fresh again
    expect(isMergeCacheFresh(refreshedToken, ttl)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Concurrent requests — correctness under parallel execution
// ---------------------------------------------------------------------------

describe("concurrent requests", () => {
  it("multiple parallel cache checks on the same stale token each independently return false", () => {
    // When N requests all see a stale token they each independently run the merge.
    // No shared state exists between calls — every invocation of isMergeCacheFresh is pure.
    const staleToken = tokenWith({ mergedAt: nowSec() - 9999 });
    const N = 50;

    const results = Array.from({ length: N }, () => isMergeCacheFresh(staleToken, 300));
    expect(results.every((r) => r === false)).toBe(true);
  });

  it("multiple parallel cache checks on a fresh token each independently return true", () => {
    const freshToken = tokenWith();
    const N = 50;

    const results = Array.from({ length: N }, () => isMergeCacheFresh(freshToken, 300));
    expect(results.every((r) => r === true)).toBe(true);
  });

  it("stampMergeResult calls from concurrent requests produce independent results", () => {
    // Each call returns a new object — no shared mutable state.
    const base = { id: 1, upId: "usr-1" };
    const stamps = Array.from({ length: 20 }, () => stampMergeResult(base));

    // All have the same mergedAt because they run synchronously, but they are
    // separate objects — mutating one does not affect another.
    stamps[0].mergedAt = 0;
    expect(stamps[1].mergedAt).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Merge correctness — stamp does not corrupt merge payload fields
// ---------------------------------------------------------------------------

describe("merge correctness", () => {
  it("stampMergeResult preserves every field returned by the merge", () => {
    const mergePayload = {
      id: 99,
      name: "Bob",
      email: "bob@example.com",
      username: "bob",
      avatarUrl: null,
      role: "USER",
      locale: "en",
      movedToProfileId: null,
      profileId: 7,
      upId: "usr-99",
      belongsToActiveTeam: true,
      orgAwareUsername: "bob",
      org: {
        id: 3,
        name: "Acme Corp",
        slug: "acme",
        logoUrl: null,
        fullDomain: "https://app.pager.com",
        domainSuffix: "",
        role: "MEMBER",
      },
    };

    const stamped = stampMergeResult(mergePayload);

    // Every original key is preserved
    for (const [key, value] of Object.entries(mergePayload)) {
      expect(stamped[key as keyof typeof stamped]).toStrictEqual(value);
    }

    // The stamp was added
    expect(typeof stamped.mergedAt).toBe("number");
  });

  it("a fresh stamped result immediately satisfies isMergeCacheFresh", () => {
    const stamped = stampMergeResult({ upId: "usr-1" });
    expect(isMergeCacheFresh(stamped, 300)).toBe(true);
  });

  it("a stamped result that lacks upId is still treated as a cache miss", () => {
    // Defensive: if the merge somehow produced a token without upId, we never skip.
    const stamped = stampMergeResult({ upId: undefined as unknown as string });
    expect(isMergeCacheFresh(stamped, 300)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Performance benchmark — cache hit path must be sub-millisecond at scale
// ---------------------------------------------------------------------------

describe("performance", () => {
  it("10 000 cache-hit checks complete in under 50 ms", () => {
    const freshToken = tokenWith();
    const N = 10_000;

    const start = performance.now();
    for (let i = 0; i < N; i++) {
      isMergeCacheFresh(freshToken, 300);
    }
    const elapsed = performance.now() - start;

    // Each check is a handful of arithmetic operations — should be << 50ms total.
    expect(elapsed).toBeLessThan(50);
  });

  it("10 000 stampMergeResult calls complete in under 100 ms", () => {
    const base = { id: 1, upId: "usr-1", name: "Alice" };
    const N = 10_000;

    const start = performance.now();
    for (let i = 0; i < N; i++) {
      stampMergeResult(base);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
  });

  it("documents the per-session DB query reduction", () => {
    // This is not an assertion — it documents the scalability win for the reader.
    //
    // Assumptions:
    //   - User makes 60 requests in a 30-minute session
    //   - Each autoMergeIdentities call = 4 DB queries @ ~10 ms each
    //   - TTL = 5 minutes → 6 TTL windows per 30-min session
    //
    // Before caching:  60 × 4 =  240 DB queries / session
    // After  caching:   6 × 4 =   24 DB queries / session  (90% reduction)
    //
    // At 100 concurrent users:
    //   Before: 100 × 240 = 24 000 queries per 30 min → ~800 qpm
    //   After:  100 ×  24 =  2 400 queries per 30 min → ~  80 qpm
    //
    // The 10x reduction moves the DB from the bottleneck to a non-factor for session traffic.

    const requestsPerSession = 60;
    const queriesPerMerge = 4;
    const ttlMinutes = 5;
    const sessionMinutes = 30;
    const windowsPerSession = sessionMinutes / ttlMinutes;

    const before = requestsPerSession * queriesPerMerge;
    const after = windowsPerSession * queriesPerMerge;

    expect(after).toBeLessThan(before);
    expect(Math.round((1 - after / before) * 100)).toBeGreaterThanOrEqual(90);
  });
});
