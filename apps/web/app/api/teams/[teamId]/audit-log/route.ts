import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

  const logs = await prisma.auditLog.findMany({
    where: {
      teamId,
      ...(action ? { action } : {}),
    },
    select: {
      id: true,
      action: true,
      resource: true,
      metadata: true,
      ipAddress: true,
      createdAt: true,
      actor: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = logs.length > limit;
  const items = hasMore ? logs.slice(0, limit) : logs;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ logs: items, nextCursor, hasMore });
}
