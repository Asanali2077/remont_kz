import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
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

    const systemText = `Ты — помощник маркетплейса ремонтных услуг Remont.kz.
Составь краткое (2-3 предложения) профессиональное резюме о компании на основе данных, которые тебе предоставят.
Пиши от третьего лица, нейтральный деловой тон, на русском языке.`;

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
        max_tokens: 300,
        system: [
          {
            type: "text",
            text: systemText,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
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

    const data = await response.json();
    const aiSummary = data.content?.[0]?.text?.trim() ?? "";

    await prisma.service.update({
      where: { id: serviceId },
      data: { aiSummary, aiSummaryAt: new Date() },
    });

    return NextResponse.json({ aiSummary });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
