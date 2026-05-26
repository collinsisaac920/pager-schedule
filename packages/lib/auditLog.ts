import { prisma } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";

export type AuditAction =
  | "MEMBER_INVITED"
  | "MEMBER_REMOVED"
  | "ROLE_CHANGED"
  | "BULK_INVITE"
  | "BRANDING_UPDATED"
  | "CUSTOM_DOMAIN_SET"
  | "CUSTOM_DOMAIN_VERIFIED"
  | "EMAIL_TEMPLATE_SAVED"
  | "DATA_EXPORTED"
  | "SETTINGS_CHANGED"
  | "INCIDENT_CREATED"
  | "INCIDENT_RESOLVED"
  | "SCHEDULING_UPDATED"
  | "WEBHOOK_CREATED"
  | "WEBHOOK_DELETED"
  | "WEBHOOK_DELIVERED";

interface AuditParams {
  teamId: number;
  actorId: number;
  action: AuditAction;
  resource?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAuditEvent(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        teamId: params.teamId,
        actorId: params.actorId,
        action: params.action,
        resource: params.resource ?? null,
        metadata: params.metadata !== undefined ? (params.metadata as Prisma.InputJsonValue) : undefined,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch {
    // Audit logging is non-fatal — never block the primary operation
  }
}
