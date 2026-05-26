import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { getWebhookDeliveries } from "@calcom/lib/webhookDelivery";
import prisma from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: webhookId } = await params;

  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId },
    select: { id: true, userId: true, teamId: true },
  });

  if (!webhook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (webhook.teamId) {
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id, teamId: webhook.teamId, accepted: true },
      select: { role: true },
    });
    if (!membership || !["OWNER", "ADMIN", "MEMBER"].includes(membership.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (webhook.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "50", 10), 100);
  const deliveries = await getWebhookDeliveries(webhookId, limit);

  return NextResponse.json({ deliveries });
}
