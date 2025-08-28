"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ORGS, Organization, SERVICES_AUTOMOBILES } from "@/lib/data";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { OrgCard } from "@/components/OrgCard";

export default function AutomobilesPage() {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [service, setService] = useState<string | undefined>(undefined);

  const list = useMemo(() => {
    return ORGS.filter(o => o.category === "automobiles")
      .filter(o => o.priceTo >= priceRange[0] && o.priceFrom <= priceRange[1])
      .filter(o => o.rating >= minRating)
      .filter(o => (service ? o.services.includes(service) : true));
  }, [priceRange, minRating, service]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <Label>Диапазон цены (₸)</Label>
                <div className="px-1 py-2">
                  <Slider min={0} max={100000} step={1000} value={priceRange} onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])} />
                </div>
                <div className="text-sm text-muted-foreground">от {priceRange[0].toLocaleString("ru-RU")} ₸ до {priceRange[1].toLocaleString("ru-RU")} ₸</div>
              </div>
              <div>
                <Label>Мин. рейтинг</Label>
                <div className="px-1 py-2">
                  <Slider min={0} max={5} step={0.5} value={[minRating]} onValueChange={(v) => setMinRating(v[0])} />
                </div>
                <div className="text-sm text-muted-foreground">{minRating.toFixed(1)}+</div>
              </div>
              <div>
                <Label>Услуга</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Любая" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES_AUTOMOBILES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Автосервисы и обслуживание</h1>
        <p className="text-muted-foreground mb-6">Ремонт, ТО, детейлинг, запчасти и шины</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((org: Organization) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">Нет автосервисов. Добавьте данные в ORGS.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}


