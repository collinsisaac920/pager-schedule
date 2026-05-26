-- CreateTable: WebhookDelivery
CREATE TABLE IF NOT EXISTS "WebhookDelivery" (
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
);

CREATE INDEX IF NOT EXISTS "WebhookDelivery_webhookId_createdAt_idx"
    ON "WebhookDelivery"("webhookId", "createdAt" DESC);

ALTER TABLE "WebhookDelivery"
    ADD CONSTRAINT "WebhookDelivery_webhookId_fkey"
    FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
