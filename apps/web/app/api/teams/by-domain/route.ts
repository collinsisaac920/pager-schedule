import prisma from "@calcom/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Internal endpoint used by middleware to resolve custom domains → team slugs.
// Only accessible from the middleware via the x-internal header.
export async function GET(req: NextRequest) {
  if (req.headers.get("x-internal") !== "1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) {
    return NextResponse.json({ teamSlug: null });
  }

  const team = await prisma.team.findFirst({
    where: { customDomain: domain.toLowerCase(), customDomainVerified: true, customDomainEnabled: true },
    select: { slug: true },
  });

  return NextResponse.json({ teamSlug: team?.slug ?? null });
}
