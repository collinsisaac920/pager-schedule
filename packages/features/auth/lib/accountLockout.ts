// ---------------------------------------------------------------------------
// Escalating account lockout thresholds
//
// Two-phase model:
//   Soft lock  — temporary; enforced via lockUntil. Expires automatically.
//   Hard lock  — permanent; requires admin action to clear (locked=true).
//
// Phase boundaries and durations are intentionally graduated so a human
// typo (1–2 wrong passwords) causes no lock, but a credential-stuffing
// attempt triggers rapid escalation.
//
// The same failure counter is shared between password failures and backup-code
// failures, so an attacker who already knows the password cannot bypass the
// budget by brute-forcing backup codes.
// ---------------------------------------------------------------------------

export const LOCKOUT = {
  /** First soft lock: 15-minute cooldown. */
  SOFT_LOCK_THRESHOLD: 5,
  SOFT_LOCK_DURATION_MS: 15 * 60 * 1000,

  /** Second soft lock: 60-minute cooldown. */
  MED_LOCK_THRESHOLD: 7,
  MED_LOCK_DURATION_MS: 60 * 60 * 1000,

  /** Hard (permanent) lock — admin must unlock. */
  HARD_LOCK_THRESHOLD: 10,
} as const;

export interface LockData {
  /** Set to true only at hard-lock threshold. Undefined otherwise — avoids overwriting. */
  locked?: true;
  /** New lockUntil value: a future Date for soft locks, null to clear, undefined to leave unchanged. */
  lockUntil?: Date | null;
}

/**
 * Derives the Prisma `data` fragment for a failed-login counter increment.
 *
 * @param newCount - The updated failedLoginAttempts value (after incrementing).
 * @returns An object safe to spread into a `prisma.user.update({ data: ... })` call.
 */
export function computeLockData(newCount: number): LockData {
  if (newCount >= LOCKOUT.HARD_LOCK_THRESHOLD) {
    // Permanent lock. Clear any soft-lock expiry so the check is unambiguous.
    return { locked: true, lockUntil: null };
  }

  if (newCount >= LOCKOUT.MED_LOCK_THRESHOLD) {
    return { lockUntil: new Date(Date.now() + LOCKOUT.MED_LOCK_DURATION_MS) };
  }

  if (newCount >= LOCKOUT.SOFT_LOCK_THRESHOLD) {
    return { lockUntil: new Date(Date.now() + LOCKOUT.SOFT_LOCK_DURATION_MS) };
  }

  // Below every threshold — no lock change needed.
  return {};
}

/**
 * Returns true if the account is under an active soft (temporary) lock.
 *
 * A lockUntil in the past is treated as expired and returns false, allowing
 * the user to retry without manual intervention.
 */
export function isSoftLocked(lockUntil: Date | null | undefined): boolean {
  if (!lockUntil) return false;
  return lockUntil > new Date();
}
