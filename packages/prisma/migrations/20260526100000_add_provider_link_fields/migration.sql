-- AlterTable: audit trail and pending cross-provider link confirmation fields.
-- All columns are nullable — existing rows are unaffected.
ALTER TABLE "users" ADD COLUMN "identityProviderChangedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "pendingProviderLinkToken"      TEXT;
ALTER TABLE "users" ADD COLUMN "pendingProviderLinkExpiry"     TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "pendingProviderLinkProvider"   TEXT;
ALTER TABLE "users" ADD COLUMN "pendingProviderLinkProviderId" TEXT;

-- Unique index so token lookups are O(1) and duplicates are impossible.
CREATE UNIQUE INDEX "users_pendingProviderLinkToken_key" ON "users"("pendingProviderLinkToken");
