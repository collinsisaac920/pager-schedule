import { prisma } from "@calcom/prisma";

export interface DeliveryResult {
  ok: boolean;
  status: number | null;
  errorMessage?: string;
  duration: number;
}

export async function recordWebhookDelivery({
  webhookId,
  triggerEvent,
  subscriberUrl,
  requestBody,
  result,
}: {
  webhookId: string;
  triggerEvent: string;
  subscriberUrl: string;
  requestBody: string;
  result: DeliveryResult;
}): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "WebhookDelivery"
         ("id","webhookId","triggerEvent","subscriberUrl","requestBody","statusCode","success","errorMessage","duration","createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      globalThis.crypto.randomUUID(),
      webhookId,
      triggerEvent,
      subscriberUrl,
      requestBody.slice(0, 65_535),
      result.status ?? null,
      result.ok,
      result.errorMessage ?? null,
      result.duration
    );
  } catch {
    // Non-fatal — never block webhook delivery
  }
}

export interface WebhookDeliveryRow {
  id: string;
  webhookId: string;
  triggerEvent: string;
  subscriberUrl: string;
  statusCode: number | null;
  success: boolean;
  errorMessage: string | null;
  duration: number;
  createdAt: string;
}

export async function getWebhookDeliveries(webhookId: string, limit = 50): Promise<WebhookDeliveryRow[]> {
  try {
    const rows = await prisma.$queryRawUnsafe<WebhookDeliveryRow[]>(
      `SELECT id,"webhookId","triggerEvent","subscriberUrl","statusCode","success","errorMessage","duration","createdAt"
       FROM "WebhookDelivery"
       WHERE "webhookId" = $1
       ORDER BY "createdAt" DESC
       LIMIT $2`,
      webhookId,
      limit
    );
    return rows;
  } catch {
    return [];
  }
}
