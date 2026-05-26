import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import getIP from "@calcom/lib/getIP";
import { HttpError } from "@calcom/lib/http-error";
import { piiHasher } from "@calcom/lib/server/PiiHasher";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const requestorIp = getIP(req);
  try {
    // Prevent enumeration/probing abuse — common rate limit (200 req/min per IP).
    await checkRateLimitAndThrowError({
      rateLimitingType: "common",
      identifier: `api:ip:${piiHasher.hash(requestorIp)}`,
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ message: e.message }, { status: e.statusCode });
    }
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }
  return NextResponse.json({ ip: requestorIp });
}
