import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import getIP from "@calcom/lib/getIP";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function getHandler(req: NextRequest) {
  const ip = getIP(req);
  // Prevent scraping abuse — common rate limit (200 req/min per IP).
  await checkRateLimitAndThrowError({
    rateLimitingType: "common",
    identifier: `api:geolocation:${piiHasher.hash(ip)}`,
  });

  const headersList = await headers();
  const country = headersList.get("x-vercel-ip-country") || "Unknown";

  const response = NextResponse.json({ country });
  // Vary on x-vercel-ip-country so CDN edge caches are keyed per country rather
  // than serving one user's country to every subsequent request on that edge node.
  response.headers.set("Cache-Control", "private, max-age=60");
  response.headers.set("Vary", "x-vercel-ip-country");

  return response;
}

export const GET = defaultResponderForAppDir(getHandler);
