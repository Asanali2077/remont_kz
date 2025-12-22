"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, CheckCircle2, Clock, Globe, MapPin, Phone, ShieldCheck, Car, Home, Package } from "lucide-react";
import { toast } from "sonner";
import { Organization } from "@/lib/data";
import { Stars } from "./Stars";
import { Currency } from "./Currency";
import Image from "next/image";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

interface OrgCardProps {
  org: Organization;
}

export function OrgCard({ org }: OrgCardProps) {
  const imageSrc = org.imageUrl ?? "https://images.unsplash.com/photo-1501183638710-841dd1904471";
  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative aspect-[16/9] w-full">
        <Image src={imageSrc} alt={org.name} fill className="object-cover" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5"/>
              {org.name}
              {org.licensed && (
                <Badge className="ml-1" variant="secondary">
                  <ShieldCheck className="h-3 w-3 mr-1"/>
                  Лицензия
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <MapPin className="h-4 w-4"/>
              {org.city}
              <Separator orientation="vertical" className="h-4"/>
              <Clock className="h-4 w-4"/>
              Старт ≤ {org.availabilityDays} дн.
            </div>
          </div>
          <div className="text-right">
            <Stars value={org.rating} />
            <div className="text-xs text-muted-foreground">
              {org.reviews} отзывов
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {org.category === "automobiles" && <Car className="h-3 w-3"/>}
          {org.category === "real-estate" && <Home className="h-3 w-3"/>}
          {org.category === "other" && <Package className="h-3 w-3"/>}
          <span>
            {org.category === "automobiles" ? "Авто" : org.category === "real-estate" ? "Недвижимость" : "Другое"}
          </span>
        </div>

        <div className="text-sm text-muted-foreground line-clamp-2">{org.description}</div>
        <div className="flex flex-wrap gap-2">
          {org.services.map((service) => (
            <Badge key={service} variant="outline">
              {service}
            </Badge>
          ))}
        </div>
        
        <div className="text-sm">
          Бюджет: <Currency value={org.priceFrom}/> — <Currency value={org.priceTo}/> · Стаж: {org.years} лет
        </div>
        
        <div className="flex flex-wrap gap-2">
          {org.tags.map((tag) => (
            <Badge key={tag} className="rounded-xl" variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <a 
            href={org.website} 
            target="_blank" 
            rel="noreferrer" 
            className="text-sm underline inline-flex items-center gap-1"
          >
            <Globe className="h-4 w-4"/>
            Сайт
          </a>
          <FavoriteButton id={org.id} />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Phone className="h-4 w-4"/>
                Связаться
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5"/>
                  {org.name}
                </DialogTitle>
                <DialogDescription>
                  Оставьте заявку — подрядчик свяжется с вами в ближайшее время.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="request">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="request">Заявка</TabsTrigger>
                  <TabsTrigger value="contacts">Контакты</TabsTrigger>
                </TabsList>
                <TabsContent value="request" className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Имя</Label>
                      <Input placeholder="Ваше имя" id={`name-${org.id}`}/>
                    </div>
                    <div>
                      <Label>Телефон</Label>
                      <Input placeholder="+7 ___ ___ __ __" id={`tel-${org.id}`}/>
                    </div>
                  </div>
                  <div>
                    <Label>Кратко о задаче</Label>
                    <Input 
                      placeholder="Например: ремонт ванной 4 м², нужна сантехника и плитка" 
                      id={`msg-${org.id}`}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id={`agree-${org.id}`} />
                    <Label htmlFor={`agree-${org.id}`} className="text-sm text-muted-foreground">
                      Соглашаюсь на обработку персональных данных
                    </Label>
                  </div>
                </TabsContent>
                <TabsContent value="contacts" className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4"/>
                    {org.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4"/>
                    {org.website}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4"/>
                    {org.city}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button 
                  onClick={() => { 
                    toast.success("Заявка отправлена"); 
                  }} 
                  className="gap-1"
                >
                  <CheckCircle2 className="h-4 w-4"/>
                  Отправить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
