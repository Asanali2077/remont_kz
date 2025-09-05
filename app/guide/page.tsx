"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQ = [
  { q: "Как выбрать подрядчика?", a: "Смотрите на рейтинг, отзывы, портфолио и условия договора." },
  { q: "Как формируется цена?", a: "Зависит от сложности работ, сроков и материалов." },
  { q: "Нужен ли договор?", a: "Да, договор защищает обе стороны и фиксирует условия." },
];

export default function GuidePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Remont Гид</h1>
      <p className="text-muted-foreground mb-6">Ответы на частые вопросы о сервисе и индустрии</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FAQ.map((item, idx) => (
          <Card key={idx} className="overflow-hidden">
            <button
              className="w-full text-left"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <CardHeader>
                <CardTitle className="text-base md:text-lg flex justify-between items-center">
                  {item.q}
                  <span className="text-sm text-muted-foreground">{openIndex === idx ? "−" : "+"}</span>
                </CardTitle>
              </CardHeader>
            </button>
            {openIndex === idx && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}


