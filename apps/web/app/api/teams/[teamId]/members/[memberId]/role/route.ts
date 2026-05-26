import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { logAuditEvent } from "@calcom/lib/auditLog";
import { MembershipRole } from "@calcom/prisma/enums";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { teamId: string; memberId: string } }
) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teamId = parseInt(params.teamId, 10);
  const membershipId = parseInt(params.memberId, 10);
  const { role } = await req.json();

  if (!Object.values(MembershipRole).includes(role))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const caller = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });
  if (!caller || caller.role !== "OWNER")
    return NextResponse.json({ error: "Only owners can change roles" }, { status: 403 });

  const previous = await prisma.membership.findUnique({
    where: { id: membershipId },
    select: { role: true, userId: true },
  });

  await prisma.membership.update({ where: { id: membershipId }, data: { role } });

  await logAuditEvent({
    teamId,
    actorId: session.user.id,
    action: "ROLE_CHANGED",
    resource: previous?.userId ? `user:${previous.userId}` : `membership:${membershipId}`,
    metadata: { from: previous?.role, to: role },
  });

  return NextResponse.json({ ok: true });
}
