import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import dns from "node:dns/promises";

async function handler(req: NextRequest, { params }: { params: { teamId: string } }) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamId = parseInt(params.teamId, 10);
  const body = await req.json();
  const domain: string = body.domain?.trim().toLowerCase();

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  // Verify caller is an admin/owner of this team
  const membership = await prisma.membership.findFirst({
    where: { teamId, userId: session.user.id, accepted: true },
    select: { role: true },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const records = await dns.resolveCname(domain);
    const verified = records.some((r) => r.includes("pagerschedule.com"));

    await prisma.team.update({
      where: { id: teamId },
      data: { customDomainVerified: verified, customDomain: domain },
    });

    return NextResponse.json({
      verified,
      message: verified
        ? "Domain verified successfully"
        : `CNAME not pointing to pagerschedule.com (found: ${records.join(", ")})`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.team.update({
      where: { id: teamId },
      data: { customDomainVerified: false },
    });
    return NextResponse.json({
      verified: false,
      message: `DNS lookup failed: ${message}`,
    });
  }
}

export const POST = handler;
