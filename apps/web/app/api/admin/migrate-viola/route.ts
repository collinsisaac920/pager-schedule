import { prisma } from "@calcom/prisma";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// One-shot migration endpoint for Viola tables.
// Creates AiUsage and SupportTicket tables if they don't exist.
// Auth: CRON_API_KEY bearer token.
export async function POST(req: NextRequest) {
  const key = process.env.CRON_API_KEY ?? "";
  const auth = req.headers.get("authorization") ?? "";

  // Support both the current production key and the local dev key
  const validKeys = [key, "0cc0e6c35519bba620c9360cfe3e68d0"].filter(Boolean);
  const bearerToken = auth.replace("Bearer ", "");

  if (!validKeys.includes(bearerToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Array<{ step: string; ok: boolean; error?: string }> = [];

  async function run(step: string, sql: string) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push({ step, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        results.push({ step, ok: true });
      } else {
        results.push({ step, ok: false, error: msg });
      }
    }
  }

  await run(
    "AiUsage_table",
    `CREATE TABLE IF NOT EXISTS "AiUsage" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "feature" TEXT NOT NULL,
      "month" TEXT NOT NULL,
      "count" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
    )`
  );

  await run(
    "AiUsage_unique_idx",
    `CREATE UNIQUE INDEX IF NOT EXISTS "AiUsage_userId_feature_month_key"
     ON "AiUsage"("userId", "feature", "month")`
  );

  await run(
    "SupportTicket_table",
    `CREATE TABLE IF NOT EXISTS "SupportTicket" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "userEmail" TEXT NOT NULL,
      "issue" TEXT NOT NULL,
      "page" TEXT,
      "status" TEXT NOT NULL DEFAULT 'open',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
    )`
  );

  const failed = results.filter((r) => !r.ok);
  return NextResponse.json({
    ok: failed.length === 0,
    total: results.length,
    passed: results.filter((r) => r.ok).length,
    failed: failed.length,
    results,
  });
}
