import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { logAuditEvent } from "@calcom/lib/auditLog";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const VALID_KEYS = [
  "booking_confirmation",
  "booking_cancellation",
  "booking_reminder",
  "new_booking_notification",
] as const;

export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);

  const membership = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const templates = await prisma.enterpriseEmailTemplate.findMany({
    where: { teamId },
    select: {
      id: true,
      templateKey: true,
      subject: true,
      bodyText: true,
      hideBranding: true,
      updatedAt: true,
    },
    orderBy: { templateKey: "asc" },
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);
  const body = await req.json();

  const membership = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { templateKey, subject, bodyText, hideBranding } = body;

  if (!VALID_KEYS.includes(templateKey))
    return NextResponse.json({ error: "Invalid template key" }, { status: 400 });
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  if (!bodyText?.trim()) return NextResponse.json({ error: "Body is required" }, { status: 400 });

  const template = await prisma.enterpriseEmailTemplate.upsert({
    where: { teamId_templateKey: { teamId, templateKey } },
    create: {
      teamId,
      templateKey,
      subject: subject.trim(),
      bodyText: bodyText.trim(),
      hideBranding: hideBranding ?? false,
    },
    update: {
      subject: subject.trim(),
      bodyText: bodyText.trim(),
      hideBranding: hideBranding ?? false,
    },
    select: { id: true, templateKey: true, subject: true, bodyText: true, hideBranding: true },
  });

  await logAuditEvent({
    teamId,
    actorId: session.user.id,
    action: "EMAIL_TEMPLATE_SAVED",
    resource: `template:${templateKey}`,
    metadata: { templateKey, hideBranding: hideBranding ?? false },
  });

  return NextResponse.json({ template });
}
