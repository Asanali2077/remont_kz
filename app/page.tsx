import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Wrench, Users, TrendingUp, Car, Home, Package } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Найдите подрядчика для ремонта и услуг
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Платформа по поиску ремонтных, авто- и других сервисов по всему Казахстану. 
            Выбирайте проверенных исполнителей по рейтингу, отзывам и цене.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/real-estate">
              <Button size="lg" className="gap-2">
                <Home className="h-5 w-5" />
                Ремонт и уборка жилья
              </Button>
            </Link>
            <Link href="/automobiles">
              <Button variant="outline" size="lg" className="gap-2">
                <Car className="h-5 w-5" />
                Автосервис и детали
              </Button>
            </Link>
            <Link href="/other">
              <Button variant="secondary" size="lg" className="gap-2">
                <Package className="h-5 w-5" />
                Другое
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Car className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Авто</CardTitle>
              <CardDescription>
                Ремонт, обслуживание, детейлинг, запчасти и шины
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Home className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Недвижимость</CardTitle>
              <CardDescription>
                Ремонт квартир и домов, строительство, дизайн, клининг
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Package className="h-12 w-12 mx-auto text-primary mb-4" />
              <CardTitle>Другое</CardTitle>
              <CardDescription>
                Мелкий ремонт: техника, электроника, мебель, сантехника и др.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-muted/30 rounded-lg p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-muted-foreground">Объявлений</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-muted-foreground">Подрядчиков</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1M+</div>
              <div className="text-muted-foreground">Пользователей</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">15+</div>
              <div className="text-muted-foreground">Городов</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Готовы начать?
              </CardTitle>
              <CardDescription>
                Присоединяйтесь к тысячам довольных клиентов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/automobiles">
                  <Button size="lg" className="w-full gap-2"><Car className="h-5 w-5"/>Авто</Button>
                </Link>
                <Link href="/real-estate">
                  <Button size="lg" className="w-full gap-2"><Home className="h-5 w-5"/>Недвижимость</Button>
                </Link>
                <Link href="/other">
                  <Button size="lg" className="w-full gap-2"><Package className="h-5 w-5"/>Другое</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
