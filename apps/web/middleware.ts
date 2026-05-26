import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Hostnames that are the platform itself — custom domain routing skips these
const PLATFORM_HOSTNAMES = new Set([
  "pagerschedule.com",
  "www.pagerschedule.com",
  "localhost",
  "localhost:3000",
]);

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") ?? "";
  const bareHostname = hostname.split(":")[0];

  // Skip platform hostnames — no custom domain rewrite needed
  if (PLATFORM_HOSTNAMES.has(hostname) || PLATFORM_HOSTNAMES.has(bareHostname)) {
    return NextResponse.next();
  }

  // Skip Vercel preview deployments and internal paths
  if (hostname.endsWith(".vercel.app") || req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Look up the team that owns this custom domain
  // We do a lightweight fetch against our own API to avoid importing Prisma in Edge runtime
  const lookupUrl = new URL(
    `/api/teams/by-domain?domain=${encodeURIComponent(hostname)}`,
    req.nextUrl.origin
  );

  try {
    const res = await fetch(lookupUrl.toString(), { headers: { "x-internal": "1" } });
    if (!res.ok) return NextResponse.next();

    const { teamSlug } = await res.json();
    if (!teamSlug) return NextResponse.next();

    // Rewrite custom domain requests to the team's booking pages
    const url = req.nextUrl.clone();
    const originalPath = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/team/${teamSlug}${originalPath}`;

    return NextResponse.rewrite(url);
  } catch {
    // DNS lookup / network error — fall through
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Run on all paths except static files and API internals
    "/((?!_next/static|_next/image|favicon.ico|api/teams/by-domain).*)",
  ],
};
