import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { logAuditEvent } from "@calcom/lib/auditLog";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function handler(req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);
  const body = await req.json();
  const customDomain: string = body.customDomain?.trim().toLowerCase() ?? "";

  const membership = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });
  if (!membership || !["OWNER", "ADMIN"].includes(membership.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (customDomain && !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(customDomain))
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });

  await prisma.team.update({
    where: { id: teamId },
    data: {
      customDomain: customDomain || null,
      customDomainEnabled: Boolean(customDomain),
      customDomainVerified: false,
    },
  });

  await logAuditEvent({
    teamId,
    actorId: session.user.id,
    action: "CUSTOM_DOMAIN_SET",
    resource: customDomain ? `domain:${customDomain}` : undefined,
    metadata: { domain: customDomain || null },
  });

  return NextResponse.json({ ok: true });
}

export const POST = handler;
