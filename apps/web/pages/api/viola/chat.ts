import process from "node:process";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { detectAction } from "@lib/viola/viola-actions";
import { buildViolaContext } from "@lib/viola/viola-context";
import { buildViolaSystemPrompt } from "@lib/viola/viola-prompts";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// In-memory rate limiter: userId → { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const window = rateLimitMap.get(userId);

  if (!window || now > window.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (window.count >= 20) return false;

  window.count += 1;
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession({ req });
    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = String(session.user.id);

    if (!checkRateLimit(userId)) {
      return res.status(429).json({
        message: "You've sent too many messages. Please wait a minute before trying again.",
        action: null,
      });
    }

    const { messages = [], currentPage = "/" } = req.body as {
      messages: Array<{ role: string; content: string }>;
      currentPage: string;
    };

    // Build context and system prompt
    const context = await buildViolaContext(userId, currentPage);
    const systemPrompt = buildViolaSystemPrompt(context);

    // Keep only the last 10 messages to stay within token limits
    const trimmedMessages = messages.slice(-10);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 250,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...trimmedMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const responseText = completion.choices[0]?.message?.content ?? "";
    const action = detectAction(responseText);

    return res.status(200).json({ message: responseText, action });
  } catch (err) {
    console.error("[Viola] chat error:", err instanceof Error ? err.message : String(err));
    return res.status(200).json({
      message:
        "I'm having a little trouble right now. Please email support@pagerschedule.com if you need immediate help.",
      action: {
        type: "email",
        path: "mailto:support@pagerschedule.com",
        label: "Email support →",
      },
    });
  }
}
