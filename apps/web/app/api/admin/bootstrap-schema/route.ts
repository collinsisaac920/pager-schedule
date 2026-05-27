import process from "node:process";
import prisma from "@calcom/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Applies enterprise + audit-log migrations idempotently.
// Requires: Authorization: Bearer <CRON_API_KEY>
// Call once after any deployment that adds new schema.

type StepResult = { step: string; ok: boolean; error?: string };

async function run(step: string, sql: string): Promise<StepResult> {
  try {
    await prisma.$executeRawUnsafe(sql);
    return { step, ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // "already exists" / "already has value" are safe to ignore
    if (
      msg.includes("already exists") ||
      msg.includes("already has value") ||
      msg.includes("duplicate column") ||
      msg.includes("duplicate key")
    ) {
      return { step, ok: true };
    }
    return { step, ok: false, error: msg };
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/, "");
  if (!token || token !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: StepResult[] = [];

  // ── Enterprise Features (20260526200000) ─────────────────────────────────

  results.push(
    await run("MembershipRole VIEWER", `ALTER TYPE "MembershipRole" ADD VALUE IF NOT EXISTS 'VIEWER'`)
  );

  for (const [col, def] of [
    ["customDomain", "TEXT"],
    ["customDomainEnabled", "BOOLEAN NOT NULL DEFAULT false"],
    ["customDomainVerified", "BOOLEAN NOT NULL DEFAULT false"],
    ["brandLogo", "TEXT"],
    ["brandName", "TEXT"],
    ["hidePagerScheduleBranding", "BOOLEAN NOT NULL DEFAULT false"],
  ] as const) {
    results.push(await run(`Team.${col}`, `ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "${col}" ${def}`));
  }

  results.push(
    await run(
      "Team_customDomain_key",
      `CREATE UNIQUE INDEX IF NOT EXISTS "Team_customDomain_key" ON "Team"("customDomain")`
    )
  );

  results.push(
    await run(
      "EnterpriseEmailTemplate table",
      `CREATE TABLE IF NOT EXISTS "EnterpriseEmailTemplate" (
        "id"           TEXT NOT NULL,
        "teamId"       INTEGER NOT NULL,
        "templateKey"  TEXT NOT NULL,
        "subject"      TEXT NOT NULL DEFAULT '',
        "headerText"   TEXT NOT NULL DEFAULT '',
        "bodyText"     TEXT NOT NULL DEFAULT '',
        "footerText"   TEXT NOT NULL DEFAULT '',
        "hideBranding" BOOLEAN NOT NULL DEFAULT false,
        "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EnterpriseEmailTemplate_pkey" PRIMARY KEY ("id")
      )`
    )
  );

  results.push(
    await run(
      "EnterpriseEmailTemplate_teamId_templateKey_key",
      `CREATE UNIQUE INDEX IF NOT EXISTS "EnterpriseEmailTemplate_teamId_templateKey_key"
       ON "EnterpriseEmailTemplate"("teamId", "templateKey")`
    )
  );
  results.push(
    await run(
      "EnterpriseEmailTemplate_teamId_idx",
      `CREATE INDEX IF NOT EXISTS "EnterpriseEmailTemplate_teamId_idx"
       ON "EnterpriseEmailTemplate"("teamId")`
    )
  );
  results.push(
    await run(
      "EnterpriseEmailTemplate_teamId_fkey",
      `ALTER TABLE "EnterpriseEmailTemplate"
       ADD CONSTRAINT "EnterpriseEmailTemplate_teamId_fkey"
       FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  );

  results.push(
    await run(
      "ExportJob table",
      `CREATE TABLE IF NOT EXISTS "ExportJob" (
        "id"          TEXT NOT NULL,
        "teamId"      INTEGER,
        "userId"      INTEGER NOT NULL,
        "format"      TEXT NOT NULL,
        "dataType"    TEXT NOT NULL,
        "status"      TEXT NOT NULL DEFAULT 'pending',
        "fromDate"    TIMESTAMP(3),
        "toDate"      TIMESTAMP(3),
        "recordCount" INTEGER,
        "fileUrl"     TEXT,
        "expiresAt"   TIMESTAMP(3),
        "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
      )`
    )
  );

  results.push(
    await run(
      "ExportJob_teamId_idx",
      `CREATE INDEX IF NOT EXISTS "ExportJob_teamId_idx" ON "ExportJob"("teamId")`
    )
  );
  results.push(
    await run(
      "ExportJob_userId_idx",
      `CREATE INDEX IF NOT EXISTS "ExportJob_userId_idx" ON "ExportJob"("userId")`
    )
  );
  results.push(
    await run(
      "ExportJob_teamId_fkey",
      `ALTER TABLE "ExportJob"
       ADD CONSTRAINT "ExportJob_teamId_fkey"
       FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  );
  results.push(
    await run(
      "ExportJob_userId_fkey",
      `ALTER TABLE "ExportJob"
       ADD CONSTRAINT "ExportJob_userId_fkey"
       FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  );

  results.push(
    await run(
      "UptimeLog table",
      `CREATE TABLE IF NOT EXISTS "UptimeLog" (
        "id"         TEXT NOT NULL,
        "teamId"     INTEGER,
        "service"    TEXT NOT NULL,
        "status"     TEXT NOT NULL,
        "responseMs" INTEGER NOT NULL,
        "checkedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UptimeLog_pkey" PRIMARY KEY ("id")
      )`
    )
  );

  results.push(
    await run(
      "UptimeLog_service_checkedAt_idx",
      `CREATE INDEX IF NOT EXISTS "UptimeLog_service_checkedAt_idx" ON "UptimeLog"("service", "checkedAt")`
    )
  );
  results.push(
    await run(
      "UptimeLog_teamId_idx",
      `CREATE INDEX IF NOT EXISTS "UptimeLog_teamId_idx" ON "UptimeLog"("teamId")`
    )
  );
  results.push(
    await run(
      "UptimeLog_teamId_fkey",
      `ALTER TABLE "UptimeLog"
       ADD CONSTRAINT "UptimeLog_teamId_fkey"
       FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE`
    )
  );

  results.push(
    await run(
      "Incident table",
      `CREATE TABLE IF NOT EXISTS "Incident" (
        "id"          TEXT NOT NULL,
        "teamId"      INTEGER,
        "title"       TEXT NOT NULL,
        "description" TEXT NOT NULL DEFAULT '',
        "status"      TEXT NOT NULL DEFAULT 'investigating',
        "service"     TEXT NOT NULL,
        "startedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "resolvedAt"  TIMESTAMP(3),
        "createdById" INTEGER NOT NULL,
        "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
      )`
    )
  );

  results.push(
    await run(
      "Incident_service_idx",
      `CREATE INDEX IF NOT EXISTS "Incident_service_idx" ON "Incident"("service")`
    )
  );
  results.push(
    await run(
      "Incident_teamId_idx",
      `CREATE INDEX IF NOT EXISTS "Incident_teamId_idx" ON "Incident"("teamId")`
    )
  );
  results.push(
    await run(
      "Incident_teamId_fkey",
      `ALTER TABLE "Incident"
       ADD CONSTRAINT "Incident_teamId_fkey"
       FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE`
    )
  );
  results.push(
    await run(
      "Incident_createdById_fkey",
      `ALTER TABLE "Incident"
       ADD CONSTRAINT "Incident_createdById_fkey"
       FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE`
    )
  );

  // ── Audit Log (20260526210000) ───────────────────────────────────────────

  results.push(
    await run(
      "AuditLog table",
      `CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id"        TEXT NOT NULL,
        "teamId"    INTEGER NOT NULL,
        "actorId"   INTEGER NOT NULL,
        "action"    TEXT NOT NULL,
        "resource"  TEXT,
        "metadata"  JSONB,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      )`
    )
  );

  results.push(
    await run(
      "AuditLog_teamId_createdAt_idx",
      `CREATE INDEX IF NOT EXISTS "AuditLog_teamId_createdAt_idx" ON "AuditLog"("teamId", "createdAt" DESC)`
    )
  );
  results.push(
    await run(
      "AuditLog_actorId_idx",
      `CREATE INDEX IF NOT EXISTS "AuditLog_actorId_idx" ON "AuditLog"("actorId")`
    )
  );
  results.push(
    await run(
      "AuditLog_teamId_fkey",
      `ALTER TABLE "AuditLog"
       ADD CONSTRAINT "AuditLog_teamId_fkey"
       FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  );
  results.push(
    await run(
      "AuditLog_actorId_fkey",
      `ALTER TABLE "AuditLog"
       ADD CONSTRAINT "AuditLog_actorId_fkey"
       FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  );

  // ── 2FA + Account-Lockout columns on User (20260524000000) ─────────────

  results.push(
    await run(
      "TwoFactorMethod enum",
      `DO $$ BEGIN
         CREATE TYPE "TwoFactorMethod" AS ENUM ('TOTP', 'EMAIL', 'SMS');
       EXCEPTION WHEN duplicate_object THEN null;
       END $$`
    )
  );

  results.push(
    await run(
      "User.twoFactorMethod",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorMethod" "TwoFactorMethod" NOT NULL DEFAULT 'TOTP'`
    )
  );

  results.push(
    await run(
      "User.phoneForTwoFactor",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneForTwoFactor" TEXT`
    )
  );

  results.push(
    await run(
      "User.failedLoginAttempts",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0`
    )
  );

  results.push(
    await run(
      "User.lockUntil",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lockUntil" TIMESTAMP(3)`
    )
  );

  results.push(
    await run(
      "User.lastFailedLoginAt",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastFailedLoginAt" TIMESTAMP(3)`
    )
  );

  // ── OAuth Account-Linking audit columns (20260526100000) ─────────────────

  results.push(
    await run(
      "User.identityProviderChangedAt",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "identityProviderChangedAt" TIMESTAMP(3)`
    )
  );

  results.push(
    await run(
      "User.pendingProviderLinkToken",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pendingProviderLinkToken" TEXT`
    )
  );

  results.push(
    await run(
      "users_pendingProviderLinkToken_key",
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_pendingProviderLinkToken_key"
       ON "users"("pendingProviderLinkToken")`
    )
  );

  results.push(
    await run(
      "User.pendingProviderLinkExpiry",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pendingProviderLinkExpiry" TIMESTAMP(3)`
    )
  );

  results.push(
    await run(
      "User.pendingProviderLinkProvider",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pendingProviderLinkProvider" TEXT`
    )
  );

  results.push(
    await run(
      "User.pendingProviderLinkProviderId",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pendingProviderLinkProviderId" TEXT`
    )
  );

  // ── autoOptInFeatures column on User (20251217155117) ────────────────────

  results.push(
    await run(
      "User.autoOptInFeatures",
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "autoOptInFeatures" BOOLEAN NOT NULL DEFAULT false`
    )
  );

  // ── Webhook Delivery Log (20260526220000) ───────────────────────────────

  results.push(
    await run(
      "WebhookDelivery table",
      `CREATE TABLE IF NOT EXISTS "WebhookDelivery" (
        "id"           TEXT NOT NULL,
        "webhookId"    TEXT NOT NULL,
        "triggerEvent" TEXT NOT NULL,
        "subscriberUrl" TEXT NOT NULL,
        "requestBody"  TEXT NOT NULL,
        "statusCode"   INTEGER,
        "success"      BOOLEAN NOT NULL DEFAULT false,
        "errorMessage" TEXT,
        "duration"     INTEGER NOT NULL DEFAULT 0,
        "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
      )`
    )
  );

  results.push(
    await run(
      "WebhookDelivery_webhookId_createdAt_idx",
      `CREATE INDEX IF NOT EXISTS "WebhookDelivery_webhookId_createdAt_idx"
       ON "WebhookDelivery"("webhookId", "createdAt" DESC)`
    )
  );

  results.push(
    await run(
      "WebhookDelivery_webhookId_fkey",
      `ALTER TABLE "WebhookDelivery"
       ADD CONSTRAINT "WebhookDelivery_webhookId_fkey"
       FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    )
  );

  // ── Viola AI models ─────────────────────────────────────────────────────
  results.push(
    await run(
      "AiUsage_table",
      `CREATE TABLE IF NOT EXISTS "AiUsage" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "feature" TEXT NOT NULL,
        "month" TEXT NOT NULL,
        "count" INTEGER NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
      )`
    )
  );

  results.push(
    await run(
      "AiUsage_userId_feature_month_key",
      `CREATE UNIQUE INDEX IF NOT EXISTS "AiUsage_userId_feature_month_key"
       ON "AiUsage"("userId", "feature", "month")`
    )
  );

  results.push(
    await run(
      "SupportTicket_table",
      `CREATE TABLE IF NOT EXISTS "SupportTicket" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "userEmail" TEXT NOT NULL,
        "issue" TEXT NOT NULL,
        "page" TEXT,
        "status" TEXT NOT NULL DEFAULT 'open',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
      )`
    )
  );

  const failed = results.filter((r) => !r.ok);
  return NextResponse.json({
    ok: failed.length === 0,
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: failed.length,
    results,
  });
}
