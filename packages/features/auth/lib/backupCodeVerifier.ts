import { createHash, timingSafeEqual } from "node:crypto";

// ---------------------------------------------------------------------------
// Storage format types
// ---------------------------------------------------------------------------

/**
 * V1 (legacy): generated codes stored as plaintext inside the AES-256 blob.
 * Codes are nulled in-place when consumed.
 *
 * Produced by: totp/setup/route.ts before this migration.
 */
export type BackupCodeStorageV1 = Array<string | null>;

/**
 * V2 (current): SHA-256 hex digests of normalised codes stored inside the AES-256 blob.
 * Plaintext is shown to the user exactly once at setup time; only the hash persists.
 *
 * Produced by: totp/setup/route.ts after this migration.
 */
export interface BackupCodeStorageV2 {
  version: 2;
  codes: Array<string | null>;
}

export type BackupCodeStorage = BackupCodeStorageV1 | BackupCodeStorageV2;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function sha256hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Strips hyphens and lowercases — matches whatever a user might type.
 * Applied to user input before hashing, and to V1 plaintext before on-the-fly hashing.
 */
function normalise(code: string): string {
  return code.replaceAll("-", "").toLowerCase();
}

function isV2(s: BackupCodeStorage): s is BackupCodeStorageV2 {
  return !Array.isArray(s) && (s as BackupCodeStorageV2).version === 2;
}

/**
 * A 32-byte all-zero buffer used as a dummy in comparisons for null (consumed) slots.
 * SHA-256 output is uniformly distributed — probability of a real digest equalling
 * this value is 1/2^256, which is computationally negligible.
 * Length matches SHA-256 output (32 bytes) so timingSafeEqual never throws.
 */
const DUMMY_HASH = Buffer.alloc(32, 0);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Constant-time backup code verifier.
 *
 * ─── Attack vectors addressed ───────────────────────────────────────────────
 *
 *  1. Early-exit timing oracle (findIndex / some / break):
 *     The previous code called Array.findIndex() which returns on the first match.
 *     An attacker making many login attempts could measure whether the valid code is
 *     near the front or back of the array by comparing response latencies, and infer
 *     how many codes had already been consumed.
 *     Fix: this function ALWAYS iterates every slot and records the match index
 *     without stopping.
 *
 *  2. Length-check timing oracle:
 *     The previous code did `if (stored.length !== inputCode.length) return false`
 *     before calling timingSafeEqual. For variable-length inputs this creates a
 *     detectable timing difference between same-length and different-length codes.
 *     Fix: both sides are always hashed to SHA-256 (fixed 32-byte output).
 *     timingSafeEqual never sees variable-length buffers.
 *
 *  3. Null-slot timing leak:
 *     Null (consumed) slots were skipped immediately via `if (!code) return false`.
 *     An attacker counting consumed codes (from timing) could reconstruct usage patterns.
 *     Fix: null slots are compared against a dummy hash — the comparison runs at the
 *     same cost as a live slot, then the result is discarded.
 *
 *  4. Partial-match prefix leak (V1 plaintext storage):
 *     Comparing raw bytes allows an attacker who can submit crafted codes to observe
 *     whether bytes match up to some prefix (cache timing, branch prediction effects).
 *     Fix: both sides are hashed to SHA-256 before comparison. Partial knowledge of
 *     the input no longer gives partial knowledge of the comparison result.
 *
 * @returns The index of the first matching non-null slot, or -1 if none match.
 */
export function findBackupCode(storage: BackupCodeStorage, userInput: string): number {
  const inputHash = Buffer.from(sha256hex(normalise(userInput)), "hex");
  const slots: Array<string | null> = isV2(storage) ? storage.codes : storage;

  let matchIndex = -1;

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];

    // For null (consumed) slots: use a dummy so the timingSafeEqual call always runs.
    // For V2: slot already is a SHA-256 hex digest — decode directly.
    // For V1: slot is plaintext — hash it on the fly to get a 32-byte comparable value.
    let storedHash: Buffer;
    if (!slot) {
      storedHash = DUMMY_HASH;
    } else if (isV2(storage)) {
      storedHash = Buffer.from(slot, "hex");
    } else {
      storedHash = Buffer.from(sha256hex(normalise(slot)), "hex");
    }

    const isMatch = timingSafeEqual(inputHash, storedHash);

    // Record first match but keep iterating every slot — constant-time requirement.
    if (isMatch && slot !== null && matchIndex === -1) {
      matchIndex = i;
    }
  }

  return matchIndex;
}

/**
 * Returns a new storage value with the slot at `index` nulled (consumed).
 * Does NOT mutate the input — the caller re-encrypts and persists the returned value.
 */
export function consumeBackupCode(storage: BackupCodeStorage, index: number): BackupCodeStorage {
  if (isV2(storage)) {
    const codes = [...storage.codes];
    codes[index] = null;
    return { version: 2, codes };
  }
  const codes = [...storage];
  codes[index] = null;
  return codes;
}

/**
 * Hashes a batch of plaintext backup codes for V2 storage.
 * Called at code-generation time in totp/setup/route.ts.
 *
 * The plaintext is returned to the user once and never stored.
 * Only the SHA-256 digest of the normalised code is persisted.
 */
export function hashBackupCodes(plaintextCodes: string[]): string[] {
  return plaintextCodes.map((c) => sha256hex(normalise(c)));
}

/**
 * Serialises storage to a JSON string ready for AES-256 encryption.
 */
export function serializeBackupCodeStorage(storage: BackupCodeStorage): string {
  return JSON.stringify(storage);
}

/**
 * Parses raw decrypted JSON into typed storage.
 * Throws on unrecognised structure — callers never receive an unexpected shape.
 */
export function parseBackupCodeStorage(json: string): BackupCodeStorage {
  const parsed: unknown = JSON.parse(json);
  if (Array.isArray(parsed)) {
    return parsed as BackupCodeStorageV1;
  }
  if (
    parsed !== null &&
    typeof parsed === "object" &&
    (parsed as BackupCodeStorageV2).version === 2 &&
    Array.isArray((parsed as BackupCodeStorageV2).codes)
  ) {
    return parsed as BackupCodeStorageV2;
  }
  throw new Error("Invalid backup code storage format");
}
