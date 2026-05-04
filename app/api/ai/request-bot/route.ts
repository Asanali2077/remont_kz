import { NextRequest, NextResponse } from "next/server";
import { requireClient } from "@/lib/middleware";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

const SYSTEM_PROMPT = `You are a friendly assistant on Remont.kz, a repair services marketplace in Kazakhstan.
Your goal is to help the client create a service request by collecting the following information through natural conversation:
1. description (required) — a clear description of what needs to be done
2. category (required) — one of: automobiles, real-estate, plumbing, electrical, painting, cleaning, renovation, welding, roofing, other
3. city — city in Kazakhstan where the service is needed
4. budgetFrom and budgetTo — budget in KZT (numbers, optional)

Rules:
- Ask ONE question at a time, keep it short and friendly
- Infer category from context when possible (car/auto → automobiles; apartment/house → real-estate; pipes/water → plumbing; wiring/sockets → electrical; walls/ceiling → painting; deep clean → cleaning; remodel/repair → renovation; metal/welding → welding; roof/leak → roofing)
- Once you have at minimum description and category, confirm with the user and return JSON
- ONLY when all required data is confirmed, respond with EXACTLY this JSON and nothing else:
{"done":true,"data":{"description":"...","category":"automobiles|real-estate|plumbing|electrical|painting|cleaning|renovation|welding|roofing|other","city":"...","budgetFrom":0,"budgetTo":0}}`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }
  try {
    const authResult = await requireClient()(req);
    if ("error" in authResult) return authResult.error;

    const { messages, collectedData } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: `Currently collected: ${JSON.stringify(collectedData)}`,
          },
        ],
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const aiData = await response.json();
    const text: string = aiData.content?.[0]?.text?.trim() ?? "";

    const jsonMatch =
      text.match(/```json\s*([\s\S]+?)\s*```/) ??
      text.match(/```\s*([\s\S]+?)\s*```/) ??
      text.match(/(\{[\s\S]*"done"\s*:\s*true[\s\S]*\})/);

    const jsonText = jsonMatch?.[1] ?? (text.startsWith("{") ? text : null);

    if (jsonText) {
      try {
        const parsed = JSON.parse(jsonText) as { done?: boolean; data?: Record<string, unknown> };
        if (parsed.done && parsed.data) {
          return NextResponse.json({
            message: "I have everything I need. Please review the details below and confirm your request.",
            done: true,
            data: parsed.data,
          });
        }
      } catch {
        /* not valid JSON, treat as normal message */
      }
    }

    return NextResponse.json({ message: text, done: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
