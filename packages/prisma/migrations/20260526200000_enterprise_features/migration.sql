-- Enterprise Features Migration
-- Features 1, 2, 3, 6, 8, 9, 10

-- Feature 3: Add VIEWER to MembershipRole enum
ALTER TYPE "MembershipRole" ADD VALUE IF NOT EXISTS 'VIEWER';

-- Feature 1: Custom domain fields on Team
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "customDomain"         TEXT;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "customDomainEnabled"  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "customDomainVerified" BOOLEAN NOT NULL DEFAULT false;

-- Feature 2: White-label branding fields on Team
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "brandLogo"                 TEXT;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "brandName"                 TEXT;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "hidePagerScheduleBranding" BOOLEAN NOT NULL DEFAULT false;

-- Unique index for customDomain
CREATE UNIQUE INDEX IF NOT EXISTS "Team_customDomain_key" ON "Team"("customDomain");

-- Feature 8: Custom email templates
CREATE TABLE IF NOT EXISTS "EnterpriseEmailTemplate" (
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
);

CREATE UNIQUE INDEX IF NOT EXISTS "EnterpriseEmailTemplate_teamId_templateKey_key"
    ON "EnterpriseEmailTemplate"("teamId", "templateKey");
CREATE INDEX IF NOT EXISTS "EnterpriseEmailTemplate_teamId_idx"
    ON "EnterpriseEmailTemplate"("teamId");

ALTER TABLE "EnterpriseEmailTemplate"
    ADD CONSTRAINT "EnterpriseEmailTemplate_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Feature 6: Export jobs
CREATE TABLE IF NOT EXISTS "ExportJob" (
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
);

CREATE INDEX IF NOT EXISTS "ExportJob_teamId_idx" ON "ExportJob"("teamId");
CREATE INDEX IF NOT EXISTS "ExportJob_userId_idx" ON "ExportJob"("userId");

ALTER TABLE "ExportJob"
    ADD CONSTRAINT "ExportJob_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExportJob"
    ADD CONSTRAINT "ExportJob_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Feature 10: Uptime logs
CREATE TABLE IF NOT EXISTS "UptimeLog" (
    "id"         TEXT NOT NULL,
    "teamId"     INTEGER,
    "service"    TEXT NOT NULL,
    "status"     TEXT NOT NULL,
    "responseMs" INTEGER NOT NULL,
    "checkedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UptimeLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UptimeLog_service_checkedAt_idx" ON "UptimeLog"("service", "checkedAt");
CREATE INDEX IF NOT EXISTS "UptimeLog_teamId_idx" ON "UptimeLog"("teamId");

ALTER TABLE "UptimeLog"
    ADD CONSTRAINT "UptimeLog_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Feature 10: Incidents
CREATE TABLE IF NOT EXISTS "Incident" (
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
);

CREATE INDEX IF NOT EXISTS "Incident_service_idx" ON "Incident"("service");
CREATE INDEX IF NOT EXISTS "Incident_teamId_idx" ON "Incident"("teamId");

ALTER TABLE "Incident"
    ADD CONSTRAINT "Incident_teamId_fkey"
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Incident"
    ADD CONSTRAINT "Incident_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
