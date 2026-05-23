-- Add TwoFactorMethod enum and new 2FA fields to User table.
-- Safe to run on a live database: both columns have defaults so no backfill is needed.

-- 1. Create the enum type.
CREATE TYPE "TwoFactorMethod" AS ENUM ('TOTP', 'EMAIL', 'SMS');

-- 2. Add twoFactorMethod with a default so existing rows get TOTP (preserving current behaviour).
ALTER TABLE "User"
  ADD COLUMN "twoFactorMethod" "TwoFactorMethod" NOT NULL DEFAULT 'TOTP';

-- 3. Add optional phone number for SMS 2FA.
ALTER TABLE "User"
  ADD COLUMN "phoneForTwoFactor" TEXT;
