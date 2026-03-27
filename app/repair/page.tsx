"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Info } from "lucide-react";
import { Footer } from "@/components/Footer";
import { OrgCard } from "@/components/OrgCard";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { FilterBar, SortOption } from "@/components/filters/FilterBar";
import type { CategoryFilterValue } from "@/components/filters/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ServiceRecord } from "@/lib/types";
import type { TopCategory } from "@/lib/categories";
import Link from "next/link";

function RepairContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | undefined>(undefined);
  const [serviceName, setServiceName] = useState<string | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>(() => {
    const cat = searchParams.get("category");
    return cat ? { category: cat as TopCategory } : {};
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [licensedOnly, setLicensedOnly] = useState(false);
  const [canStartWithin7, setCanStartWithin7] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  useEffect(() => {
    void loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const data = await api.getServices({ active: true });
      setServices(data);

      if (data.length > 0) {
        const maxPrice = Math.max(...data.map((s) => s.priceTo));
        setPriceRange([0, maxPrice]);
      }
    } finally {
      setLoading(false);
    }
  }

  const serviceOptions = useMemo(
    () => Array.from(new Set(services.map((s) => s.name))),
    [services]
  );

  const maxPrice = useMemo(
    () => (services.length > 0 ? Math.max(...services.map((s) => s.priceTo)) : 100000),
    [services]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return services
      .filter((service) => {
        const matchesQuery = normalizedQuery
          ? [service.name, service.company.name || "", service.city || "", service.description, ...service.tags]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)
          : true;

        const matchesCity = city ? service.city === city : true;
        const matchesServiceName = serviceName ? service.name === serviceName : true;
        const matchesPrice = service.priceTo >= priceRange[0] && service.priceFrom <= priceRange[1];
        const matchesRating = minRating > 0 ? (service.rating || 0) >= minRating : true;
        const matchesLicense = licensedOnly ? Boolean(service.licensed) : true;
        const matchesAvailability = canStartWithin7 ? (service.availabilityDays ?? 999) <= 7 : true;

        // Фильтр по категории из PDF-иерархии
        const matchesCategory = categoryFilter.category
          ? service.category === categoryFilter.category.toLowerCase().replace("_", "-") ||
            service.category === {
              AUTOMOBILES: "automobiles",
              REAL_ESTATE: "real-estate",
              OTHER: "other",
            }[categoryFilter.category]
          : true;

        // Фильтр по подкатегории (тегу)
        const matchesSubcategory = categoryFilter.subcategory
          ? service.tags.includes(categoryFilter.subcategory)
          : true;

        return (
          matchesQuery &&
          matchesCity &&
          matchesServiceName &&
          matchesPrice &&
          matchesRating &&
          matchesLicense &&
          matchesAvailability &&
          matchesCategory &&
          matchesSubcategory
        );
      })
      .sort((left, right) => {
        switch (sortBy) {
          case "rating":
            return (right.rating || 0) - (left.rating || 0);
          case "price":
            return left.priceFrom - right.priceFrom;
          case "requests":
            return (right._count?.requests || 0) - (left._count?.requests || 0);
          default: {
            const leftScore = (left.rating || 0) + (left._count?.requests || 0) / 10 - left.priceFrom / 100000;
            const rightScore = (right.rating || 0) + (right._count?.requests || 0) / 10 - right.priceFrom / 100000;
            return rightScore - leftScore;
          }
        }
      });
  }, [canStartWithin7, categoryFilter, city, licensedOnly, minRating, priceRange, query, serviceName, services, sortBy]);

  function resetFilters() {
    setQuery("");
    setCity(undefined);
    setServiceName(undefined);
    setCategoryFilter({});
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setLicensedOnly(false);
    setCanStartWithin7(false);
    setSortBy("relevance");
  }

  const createRequestAction = (() => {
    if (!user) {
      return (
        <AuthModal
          trigger={
            <Button variant="outline" size="sm">
              Log in to submit a request
            </Button>
          }
        />
      );
    }

    if (user.role !== "client") {
      return null;
    }

    return (
      <RequestCreateDialog
        trigger={<Button size="sm">Submit request</Button>}
      />
    );
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-6xl px-4 py-6">

        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Service Catalog</h1>
            <p className="text-sm text-muted-foreground">
              Find a service provider by city, price, and category
            </p>
          </div>
          {createRequestAction}
        </div>

        {/* Баннер для компаний */}
        {user?.role === "company" && (
          <Card className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <CardContent className="flex items-center gap-3 p-4">
              <Info className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="text-sm">
                <span className="font-medium">This is the client service catalog.</span>{" "}
                Your client request catalog{" "}
                <Link href="/company/catalog" className="underline font-medium">
                  here →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <FilterBar
          title="Filters"
          categoryFilter={categoryFilter}
          onChangeCategoryFilter={setCategoryFilter}
          query={query}
          city={city}
          service={serviceName}
          priceRange={priceRange}
          minRating={minRating}
          licensedOnly={licensedOnly}
          canStartWithin7={canStartWithin7}
          sortBy={sortBy}
          serviceOptions={serviceOptions}
          priceMin={0}
          priceMax={maxPrice}
          priceStep={1000}
          onChangeQuery={setQuery}
          onChangeCity={setCity}
          onChangeService={setServiceName}
          onChangePriceRange={(range) => setPriceRange(range)}
          onChangeMinRating={setMinRating}
          onChangeLicensed={setLicensedOnly}
          onChangeAvailability={setCanStartWithin7}
          onChangeSort={setSortBy}
          onReset={resetFilters}
        />

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading services...</div>
        ) : (
          <>
            <div className="mt-6 text-sm text-muted-foreground">
              Showing {filtered.length} of {services.length} services
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((service) => (
                <OrgCard key={service.id} service={service} />
              ))}
            </div>
          </>
        )}

        {!loading && filtered.length === 0 && (
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No results found for the selected filters.
                </p>
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filters
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

export default function RepairPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading...</div>}>
      <RepairContent />
    </Suspense>
  );
}
