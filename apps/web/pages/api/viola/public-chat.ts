import process from "node:process";
import { buildViolaPublicSystemPrompt } from "@lib/viola/viola-prompts";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

// In-memory rate limiter keyed by IP for public endpoint
const publicRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkPublicRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = publicRateLimit.get(ip);

  if (!window || now > window.resetAt) {
    publicRateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (window.count >= 15) return false;

  window.count += 1;
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ?? req.socket.remoteAddress ?? "unknown";

    if (!checkPublicRateLimit(ip)) {
      return res.status(429).json({
        message: "You've sent too many messages. Please wait a minute before trying again.",
      });
    }

    const {
      messages = [],
      hostName = "the host",
      eventTypes = [],
    } = req.body as {
      messages: Array<{ role: string; content: string }>;
      hostName: string;
      eventTypes: string[];
    };

    const systemPrompt = buildViolaPublicSystemPrompt(hostName, eventTypes);
    const trimmedMessages = messages.slice(-6);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
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

    return res.status(200).json({ message: responseText });
  } catch (err) {
    console.error("[Viola/public] chat error:", err instanceof Error ? err.message : String(err));
    return res.status(200).json({
      message:
        "I'm having a little trouble right now. Please reach out to the host directly if you need help booking.",
    });
  }
}
