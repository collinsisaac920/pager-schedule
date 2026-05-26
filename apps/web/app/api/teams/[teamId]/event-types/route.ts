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
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { slug: true, name: true },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const eventTypes = await prisma.eventType.findMany({
    where: { teamId },
    select: {
      id: true,
      title: true,
      slug: true,
      length: true,
      schedulingType: true,
      hidden: true,
      description: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { position: "desc" },
  });

  const baseUrl = process.env.NEXT_PUBLIC_WEBAPP_URL ?? "";

  const items = eventTypes.map((et) => ({
    id: et.id,
    title: et.title,
    slug: et.slug,
    length: et.length,
    schedulingType: et.schedulingType,
    hidden: et.hidden,
    description: et.description,
    bookingCount: et._count.bookings,
    link: `${baseUrl}/team/${team.slug}/${et.slug}`,
  }));

  return NextResponse.json({ eventTypes: items, teamSlug: team.slug, teamName: team.name });
}
