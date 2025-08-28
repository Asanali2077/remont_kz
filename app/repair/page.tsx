"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Filter, Search, ShieldCheck, Calendar, X, CheckCircle2 } from "lucide-react";
import { ORGS, CITIES, SERVICES } from "@/lib/data";
import { OrgCard } from "@/components/OrgCard";

export default function RepairPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | undefined>(undefined);
  const [service, setService] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [licensedOnly, setLicensedOnly] = useState(false);
  const [canStartWithin7, setCanStartWithin7] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORGS.filter((o) => {
      const matchesQuery = q
        ? [o.name, o.city, ...o.services, ...o.tags].some((t) => t.toLowerCase().includes(q))
        : true;
      const matchesCity = city ? o.city === city : true;
      const matchesService = service ? o.services.includes(service) : true;
      const matchesPrice = o.priceTo >= priceRange[0] && o.priceFrom <= priceRange[1];
      const matchesRating = o.rating >= minRating;
      const matchesLicense = licensedOnly ? o.licensed : true;
      const matchesAvailability = canStartWithin7 ? o.availabilityDays <= 7 : true;
      return (
        matchesQuery &&
        matchesCity &&
        matchesService &&
        matchesPrice &&
        matchesRating &&
        matchesLicense &&
        matchesAvailability
      );
    }).sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price":
          return a.priceFrom - b.priceFrom;
        case "reviews":
          return b.reviews - a.reviews;
        default:
          // simple relevance: rating + reviews/100 - priceFrom/100000
          const scoreA = a.rating + a.reviews / 100 - a.priceFrom / 100000;
          const scoreB = b.rating + b.reviews / 100 - b.priceFrom / 100000;
          return scoreB - scoreA;
      }
    });
  }, [query, city, service, priceRange, minRating, licensedOnly, canStartWithin7, sortBy]);

  function resetFilters() {
    setQuery("");
    setCity(undefined);
    setService(undefined);
    setPriceRange([0, 50000]);
    setMinRating(0);
    setLicensedOnly(false);
    setCanStartWithin7(false);
    setSortBy("relevance");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* FILTERS */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5"/>
              Фильтры
            </CardTitle>
            <CardDescription>Найдите проверенную организацию под ваш запрос</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Поиск</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                  <Input 
                    id="search" 
                    placeholder="Название, услуга, тег…" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>Город</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Любой" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Услуга</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Любая" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <Label>Диапазон цены (₸/м² или типовая работа)</Label>
                <div className="px-1 py-2">
                  <Slider 
                    min={0} 
                    max={60000} 
                    step={1000} 
                    value={priceRange} 
                    onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  от {priceRange[0].toLocaleString("ru-RU")} ₸ до {priceRange[1].toLocaleString("ru-RU")} ₸
                </div>
              </div>
              <div>
                <Label>Мин. рейтинг</Label>
                <div className="px-1 py-2">
                  <Slider 
                    min={0} 
                    max={5} 
                    step={0.5} 
                    value={[minRating]} 
                    onValueChange={(v) => setMinRating(v[0])}
                  />
                </div>
                <div className="text-sm text-muted-foreground">{minRating.toFixed(1)}+</div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="licensed" 
                    checked={licensedOnly} 
                    onCheckedChange={(v) => setLicensedOnly(Boolean(v))}
                  />
                  <Label htmlFor="licensed" className="cursor-pointer flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4"/>
                    Только лицензированные
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="start7" 
                    checked={canStartWithin7} 
                    onCheckedChange={(v) => setCanStartWithin7(Boolean(v))}
                  />
                  <Label htmlFor="start7" className="cursor-pointer flex items-center gap-1">
                    <Calendar className="h-4 w-4"/>
                    Начало работ ≤ 7 дней
                  </Label>
                </div>
                <Separator orientation="vertical" className="h-6"/>
                <div className="w-48">
                  <Label>Сортировка</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">По релевантности</SelectItem>
                      <SelectItem value="rating">По рейтингу</SelectItem>
                      <SelectItem value="price">Сначала дешевле</SelectItem>
                      <SelectItem value="reviews">По отзывам</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={resetFilters} className="gap-1">
                  <X className="h-4 w-4"/>
                  Сбросить
                </Button>
                <Button 
                  className="gap-1" 
                  onClick={() => toast("Фильтры применены")}
                >
                  Показать ({filtered.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RESULTS */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-6 w-6"/>
                <p className="text-sm text-muted-foreground">
                  Ничего не найдено. Попробуйте снять фильтры или изменить запрос.
                </p>
                <Button variant="secondary" onClick={resetFilters}>
                  Сбросить фильтры
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
