import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { incidentId: string } }
) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.incidentId;

  const incident = await prisma.incident.findUnique({
    where: { id },
    select: { resolvedAt: true },
  });
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (incident.resolvedAt) return NextResponse.json({ error: "Already resolved" }, { status: 400 });

  await prisma.incident.update({
    where: { id },
    data: { resolvedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
