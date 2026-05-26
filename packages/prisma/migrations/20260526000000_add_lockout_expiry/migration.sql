-- AlterTable: add temporary soft-lock expiry column (nullable, no default)
-- Existing rows remain unlocked (NULL = no active soft lock).
ALTER TABLE "users" ADD COLUMN "lockUntil" TIMESTAMP(3);
