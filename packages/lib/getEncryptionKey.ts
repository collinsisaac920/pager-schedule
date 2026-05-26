/**
 * Returns the AES-256 symmetric encryption key from the environment.
 *
 * Throws immediately if the key is absent so cryptographic operations fail
 * loudly rather than silently falling back to an empty string, which would
 * allow an attacker to forge tokens encrypted with a known (empty) key.
 *
 * All encryption / decryption call sites must use this function instead of
 * reading process.env.CALENDSO_ENCRYPTION_KEY directly.
 */
import process from "node:process";
export function getEncryptionKey(): string {
  const key = process.env.CALENDSO_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "CRITICAL: CALENDSO_ENCRYPTION_KEY is not set. " +
        "Cannot perform cryptographic operations. " +
        "Ensure the environment variable is configured before starting the server."
    );
  }
  return key;
}
