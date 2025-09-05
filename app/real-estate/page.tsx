"use client";

import { Footer } from "@/components/Footer";
import { ORGS, Organization, SERVICES_REAL_ESTATE } from "@/lib/data";
import { useMemo, useState } from "react";
import { OrgCard } from "@/components/OrgCard";
import { FilterBar } from "@/components/filters/FilterBar";

export default function RealEstatePage() {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [service, setService] = useState<string | undefined>(undefined);

  const list = useMemo(() => {
    return ORGS.filter(o => o.category === "real-estate")
      .filter(o => o.priceTo >= priceRange[0] && o.priceFrom <= priceRange[1])
      .filter(o => o.rating >= minRating)
      .filter(o => (service ? o.services.includes(service) : true));
  }, [priceRange, minRating, service]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <FilterBar
          title="Фильтры"
          priceRange={priceRange}
          minRating={minRating}
          service={service}
          serviceOptions={SERVICES_REAL_ESTATE}
          showQuery={false}
          showCity={false}
          showLicensed={false}
          showAvailability={false}
          showSort={false}
          onChangePriceRange={(r) => setPriceRange(r)}
          onChangeMinRating={setMinRating}
          onChangeService={setService}
        />
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Ремонт и строительство</h1>
        <p className="text-muted-foreground mb-6">Ремонт квартир и домов, строительство, дизайн, клининг</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((org: Organization) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">Нет подрядчиков. Добавьте данные в ORGS.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}


