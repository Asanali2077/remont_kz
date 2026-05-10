import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

const MODEL = process.env.OPENROUTER_SUMMARY_MODEL ?? "google/gemma-4-31b-it:free";

const SYSTEM_PROMPT = `Ты — помощник маркетплейса ремонтных услуг Remont.kz.
Составь краткое (2-3 предложения) профессиональное резюме о компании на основе данных, которые тебе предоставят.
Пиши от третьего лица, нейтральный деловой тон, на русском языке.`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
  }
  try {
    const authResult = await requireAuth()(req);
    if ("error" in authResult) return authResult.error;

    const { serviceId } = await req.json();
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        requests: {
          where: { status: "COMPLETED" },
          select: { rating: true, description: true },
        },
      },
    });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const completedRequests = service.requests;
    const avgRating = completedRequests.length
      ? (completedRequests.reduce((s, r) => s + (r.rating ?? 0), 0) / completedRequests.length).toFixed(1)
      : null;
    const reviews = completedRequests
      .filter((r) => r.description)
      .map((r) => `"${r.description}"`)
      .slice(0, 5)
      .join("; ") || "нет отзывов";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Remont.kz",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Название услуги: ${service.name}
Описание: ${service.description}
Теги: ${service.tags.join(", ")}
Количество завершённых заявок: ${completedRequests.length}
Средний рейтинг: ${avgRating ?? "нет данных"}
Краткое из заявок: ${reviews}

Резюме:`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter summary error:", err);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const aiSummary = data.choices?.[0]?.message?.content?.trim() ?? "";

    await prisma.service.update({
      where: { id: serviceId },
      data: { aiSummary, aiSummaryAt: new Date() },
    });

    return NextResponse.json({ aiSummary });
  } catch (err) {
    console.error("AI summary error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
