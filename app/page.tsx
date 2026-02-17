"use client";

import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Найдите подрядчика для ремонта и услуг
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Каталог проверенных исполнителей с фильтрами по цене, городу и рейтингу.
            Оставляйте заявки и общайтесь с компаниями прямо на платформе.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/repair">
              <Button size="lg" className="gap-2">
                Перейти в каталог
              </Button>
            </Link>
            <Link href="/company/dashboard">
              <Button variant="outline" size="lg" className="gap-2">
                Я компания
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle2 className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Проверенные исполнители</CardTitle>
              <CardDescription>Портфолио, цены и условия в одном месте</CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Заявки и чат</CardTitle>
              <CardDescription>Обсуждайте детали и сроки напрямую</CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <ShieldCheck className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Безопасность</CardTitle>
              <CardDescription>Роли и доступы для клиентов и компаний</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-muted/30 rounded-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-muted-foreground">Городов</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-muted-foreground">Компаний</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-muted-foreground">Услуг</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">4.7</div>
              <div className="text-muted-foreground">Средний рейтинг</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
