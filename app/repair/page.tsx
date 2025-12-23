"use client";

import { useMemo, useState } from "react";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";
import { ORGS, CITIES, SERVICES } from "@/lib/data";
import { OrgCard } from "@/components/OrgCard";
import { FilterBar, SortOption } from "@/components/filters/FilterBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function RepairPage() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | undefined>(undefined);
  const [service, setService] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [licensedOnly, setLicensedOnly] = useState(false);
  const [canStartWithin7, setCanStartWithin7] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

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
      
      <main className="mx-auto max-w-6xl px-4 py-6">
        <FilterBar
          title="Фильтры"
          description="Найдите проверенную организацию под ваш запрос"
          query={query}
          city={city}
          service={service}
          priceRange={priceRange}
          minRating={minRating}
          licensedOnly={licensedOnly}
          canStartWithin7={canStartWithin7}
          sortBy={sortBy}
          cityOptions={CITIES}
          serviceOptions={SERVICES}
          priceMin={0}
          priceMax={60000}
          priceStep={1000}
          onChangeQuery={setQuery}
          onChangeCity={setCity}
          onChangeService={setService}
          onChangePriceRange={(r) => setPriceRange(r)}
          onChangeMinRating={setMinRating}
          onChangeLicensed={(v) => setLicensedOnly(v)}
          onChangeAvailability={(v) => setCanStartWithin7(v)}
          onChangeSort={(s) => setSortBy(s)}
          onReset={resetFilters}
          onApply={() => toast("Фильтры применены")}
        />

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
