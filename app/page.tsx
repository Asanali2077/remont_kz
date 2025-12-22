import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Home, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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

        {/* News */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Новости</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              title: "Как выбрать подрядчика для ремонта",
              desc: "5 критериев, на которые стоит обратить внимание.",
              img: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4"
            }, {
              title: "Обновления платформы Remont.kz",
              desc: "Новые возможности поиска и фильтрации.",
              img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d"
            }, {
              title: "Сезон клининга: советы",
              desc: "Как подготовить квартиру к генеральной уборке.",
              img: "https://images.unsplash.com/photo-1515920010264-05a0f6a4c28f"
            }].map((a, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] w-full">
                  <Image src={a.img} alt={a.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{a.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{a.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Articles */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Статьи</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              title: "ТО автомобиля: что входит",
              desc: "Чек‑лист регулярного обслуживания вашего авто.",
              img: "https://images.unsplash.com/photo-1515920010264-05a0f6a4c28f"
            }, {
              title: "Уборка после ремонта: советы",
              desc: "Эффективные способы быстро навести порядок.",
              img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d"
            }, {
              title: "Дизайн-проект: с чего начать",
              desc: "Первые шаги и типичные ошибки.",
              img: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4"
            }].map((a, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] w-full">
                  <Image src={a.img} alt={a.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{a.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{a.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* PR */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">PR</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              title: "Запуск партнерской программы",
              desc: "Новые условия для бизнеса и подрядчиков.",
              img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d"
            }, {
              title: "Акции для новых пользователей",
              desc: "Скидки и бонусы при первых заказах.",
              img: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4"
            }, {
              title: "Расширение покрытия",
              desc: "Теперь и в новых городах Казахстана.",
              img: "https://images.unsplash.com/photo-1515920010264-05a0f6a4c28f"
            }].map((a, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] w-full">
                  <Image src={a.img} alt={a.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{a.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{a.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Analytics */}
        <section className="mb-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Аналитика</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[{ t: "Средняя цена ремонта", v: "25 000 ₸" }, { t: "ТО авто средн.", v: "18 000 ₸" }, { t: "Рейтинг подрядчиков", v: "4.5/5" }, { t: "Сроки старта", v: "≤ 7 дней" }].map((kpi, i) => (
              <Card key={i} className="text-center">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">{kpi.t}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.v}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
