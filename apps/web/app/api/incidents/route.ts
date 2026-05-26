import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, service } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
  if (!service?.trim()) return NextResponse.json({ error: "Service required" }, { status: 400 });

  const incident = await prisma.incident.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? "",
      service: service.trim(),
      status: "investigating",
      createdById: session.user.id,
    },
    select: { id: true, title: true, status: true, startedAt: true },
  });

  return NextResponse.json({ incident });
}
