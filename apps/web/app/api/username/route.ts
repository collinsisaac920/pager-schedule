import { checkUsername } from "@calcom/features/profile/lib/checkUsername";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import { HttpError } from "@calcom/lib/http-error";
import getIP from "@calcom/lib/getIP";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  // Max 39 chars mirrors GitHub's username limit; trim to reject padding tricks.
  username: z.string().trim().min(1).max(39),
  // Org slugs follow the same length constraint.
  orgSlug: z.string().trim().max(39).optional(),
});

async function postHandler(request: NextRequest) {
  const ip = getIP(request);

  // Prevent username enumeration brute-force — core limit (10 req/min per IP).
  try {
    await checkRateLimitAndThrowError({
      rateLimitingType: "core",
      identifier: `api:username:${piiHasher.hash(ip)}`,
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ message: e.message }, { status: e.statusCode });
    }
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  let parsedBody: z.infer<typeof bodySchema>;
  try {
    const body = await request.json();
    parsedBody = bodySchema.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { username, orgSlug } = parsedBody;

  try {
    const legacyReq = buildLegacyRequest(await headers(), await cookies());

    // Get current org domain from request headers
    const currentOrgDomain = null;
    const isValidOrgDomain = false;

    const result = await checkUsername(username, currentOrgDomain || orgSlug);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to check username availability" }, { status: 400 });
  }
}

export const POST = defaultResponderForAppDir(postHandler);
