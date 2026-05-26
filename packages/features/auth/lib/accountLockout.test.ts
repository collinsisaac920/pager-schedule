import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computeLockData, isSoftLocked, LOCKOUT } from "./accountLockout";

// ---------------------------------------------------------------------------
// computeLockData
// ---------------------------------------------------------------------------

describe("computeLockData — below all thresholds", () => {
  it("returns empty object for 1 failure (no lock)", () => {
    expect(computeLockData(1)).toEqual({});
  });

  it("returns empty object at threshold - 1 (4 failures)", () => {
    expect(computeLockData(LOCKOUT.SOFT_LOCK_THRESHOLD - 1)).toEqual({});
  });
});

describe("computeLockData — soft lock (5–6 failures)", () => {
  const NOW = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets lockUntil 15 min in the future at threshold 5", () => {
    const result = computeLockData(LOCKOUT.SOFT_LOCK_THRESHOLD);
    expect(result.locked).toBeUndefined();
    expect(result.lockUntil).toBeInstanceOf(Date);
    expect(result.lockUntil!.getTime()).toBe(NOW + LOCKOUT.SOFT_LOCK_DURATION_MS);
  });

  it("sets lockUntil 15 min in the future at 6 failures (below med threshold)", () => {
    const result = computeLockData(6);
    expect(result.locked).toBeUndefined();
    expect(result.lockUntil!.getTime()).toBe(NOW + LOCKOUT.SOFT_LOCK_DURATION_MS);
  });
});

describe("computeLockData — medium lock (7–9 failures)", () => {
  const NOW = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets lockUntil 1 hour in the future at threshold 7", () => {
    const result = computeLockData(LOCKOUT.MED_LOCK_THRESHOLD);
    expect(result.locked).toBeUndefined();
    expect(result.lockUntil!.getTime()).toBe(NOW + LOCKOUT.MED_LOCK_DURATION_MS);
  });

  it("sets lockUntil 1 hour in the future at 9 failures", () => {
    const result = computeLockData(9);
    expect(result.lockUntil!.getTime()).toBe(NOW + LOCKOUT.MED_LOCK_DURATION_MS);
  });
});

describe("computeLockData — hard lock (10+ failures)", () => {
  it("sets locked:true and lockUntil:null at threshold 10", () => {
    const result = computeLockData(LOCKOUT.HARD_LOCK_THRESHOLD);
    expect(result.locked).toBe(true);
    expect(result.lockUntil).toBeNull();
  });

  it("sets locked:true for counts well above threshold", () => {
    const result = computeLockData(50);
    expect(result.locked).toBe(true);
    expect(result.lockUntil).toBeNull();
  });
});

describe("computeLockData — threshold boundaries", () => {
  const NOW = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("each threshold produces a strictly longer/harder lockout than the previous", () => {
    const below = computeLockData(LOCKOUT.SOFT_LOCK_THRESHOLD - 1);
    const soft = computeLockData(LOCKOUT.SOFT_LOCK_THRESHOLD);
    const med = computeLockData(LOCKOUT.MED_LOCK_THRESHOLD);
    const hard = computeLockData(LOCKOUT.HARD_LOCK_THRESHOLD);

    // Below → no lock
    expect(below).toEqual({});
    // Soft → 15-min window
    expect(soft.lockUntil!.getTime()).toBeLessThan(med.lockUntil!.getTime());
    // Hard → permanent, clears soft
    expect(hard.locked).toBe(true);
    expect(hard.lockUntil).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isSoftLocked
// ---------------------------------------------------------------------------

describe("isSoftLocked", () => {
  it("returns false for null", () => {
    expect(isSoftLocked(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isSoftLocked(undefined)).toBe(false);
  });

  it("returns false for a date in the past", () => {
    const past = new Date(Date.now() - 1000);
    expect(isSoftLocked(past)).toBe(false);
  });

  it("returns true for a date in the future", () => {
    const future = new Date(Date.now() + 15 * 60 * 1000);
    expect(isSoftLocked(future)).toBe(true);
  });

  it("returns false for a date exactly now (not strictly in future)", () => {
    const now = new Date();
    // Date.now() could be ≥ the date by the time isSoftLocked executes.
    // At worst this is a boundary case; the function uses >, so equality → false.
    // We freeze time to make this deterministic.
    vi.useFakeTimers();
    vi.setSystemTime(now.getTime());
    expect(isSoftLocked(now)).toBe(false);
    vi.useRealTimers();
  });

  it("returns false immediately after TTL expires (fake timers)", () => {
    vi.useFakeTimers();
    const START = 1_700_000_000_000;
    vi.setSystemTime(START);

    const lockUntil = new Date(START + 15 * 60 * 1000);
    expect(isSoftLocked(lockUntil)).toBe(true);

    // Advance past the lock window
    vi.setSystemTime(START + 15 * 60 * 1000 + 1);
    expect(isSoftLocked(lockUntil)).toBe(false);

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// Integration: simulate a full escalation sequence
// ---------------------------------------------------------------------------

describe("escalation sequence integration", () => {
  const NOW = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("simulates escalation from 1 failure to hard lock without early-exiting", () => {
    // Failures 1–4: no lock
    for (let count = 1; count <= 4; count++) {
      const data = computeLockData(count);
      expect(data).toEqual({});
    }

    // Failure 5: first soft lock (15 min)
    const atFive = computeLockData(5);
    expect(atFive.locked).toBeUndefined();
    expect(isSoftLocked(atFive.lockUntil)).toBe(true);

    // Failure 7: medium lock (1 hr)
    const atSeven = computeLockData(7);
    expect(atSeven.locked).toBeUndefined();
    expect(atSeven.lockUntil!.getTime()).toBeGreaterThan(atFive.lockUntil!.getTime());

    // Failure 10: hard lock
    const atTen = computeLockData(10);
    expect(atTen.locked).toBe(true);
    expect(atTen.lockUntil).toBeNull();
  });

  it("soft lock expires and user can retry without admin action", () => {
    const lockData = computeLockData(5);
    expect(isSoftLocked(lockData.lockUntil)).toBe(true);

    // Advance time past 15-min window
    vi.setSystemTime(NOW + LOCKOUT.SOFT_LOCK_DURATION_MS + 1);
    expect(isSoftLocked(lockData.lockUntil)).toBe(false);
  });

  it("medium lock expires and user can retry without admin action", () => {
    const lockData = computeLockData(7);
    expect(isSoftLocked(lockData.lockUntil)).toBe(true);

    // Not yet expired at 59 min
    vi.setSystemTime(NOW + 59 * 60 * 1000);
    expect(isSoftLocked(lockData.lockUntil)).toBe(true);

    // Expired at 60 min + 1 ms
    vi.setSystemTime(NOW + LOCKOUT.MED_LOCK_DURATION_MS + 1);
    expect(isSoftLocked(lockData.lockUntil)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Concurrent / idempotent: same count always produces same lock data
// ---------------------------------------------------------------------------

describe("computeLockData — idempotency under concurrent requests", () => {
  const NOW = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("produces identical lock data when called twice with the same count", () => {
    for (const count of [1, 4, 5, 7, 10]) {
      expect(computeLockData(count)).toEqual(computeLockData(count));
    }
  });
});
