import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Свяжитесь с нами</h1>
          <p className="text-xl text-muted-foreground">
            У вас есть вопросы? Мы готовы помочь!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Отправить сообщение</CardTitle>
              <CardDescription>
                Заполните форму ниже, и мы свяжемся с вами в ближайшее время
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Имя</Label>
                  <Input id="name" placeholder="Ваше имя" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Тема</Label>
                <Input id="subject" placeholder="Тема сообщения" />
              </div>
              <div>
                <Label htmlFor="message">Сообщение</Label>
                <Textarea 
                  id="message" 
                  placeholder="Опишите ваш вопрос или предложение..."
                  rows={5}
                />
              </div>
              <Button className="w-full gap-2">
                <Send className="h-4 w-4" />
                Отправить сообщение
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Контактная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Телефон</p>
                    <p className="text-muted-foreground">+7 777 123 45 67</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">info@remont.kz</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Адрес</p>
                    <p className="text-muted-foreground">
                      г. Алматы, ул. Примерная, 123
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Время работы</p>
                    <p className="text-muted-foreground">
                      Пн-Пт: 9:00 - 18:00<br />
                      Сб: 10:00 - 16:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Поддержка</CardTitle>
                <CardDescription>
                  Нужна помощь? Обратитесь в нашу службу поддержки
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Написать в поддержку
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
