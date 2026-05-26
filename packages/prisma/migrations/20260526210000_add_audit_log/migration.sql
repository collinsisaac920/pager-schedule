-- Feature 11: Audit Log
CREATE TABLE "AuditLog" (
    "id"        TEXT NOT NULL,
    "teamId"    INTEGER NOT NULL,
    "actorId"   INTEGER NOT NULL,
    "action"    TEXT NOT NULL,
    "resource"  TEXT,
    "metadata"  JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_teamId_createdAt_idx" ON "AuditLog"("teamId", "createdAt" DESC);
CREATE INDEX "AuditLog_actorId_idx"          ON "AuditLog"("actorId");

ALTER TABLE "AuditLog"
    ADD CONSTRAINT "AuditLog_teamId_fkey"
        FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
    ADD CONSTRAINT "AuditLog_actorId_fkey"
        FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
