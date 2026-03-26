"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Footer } from "@/components/Footer";
import { OrgCard } from "@/components/OrgCard";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { FilterBar, SortOption } from "@/components/filters/FilterBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { ServiceRecord } from "@/lib/types";

export default function RepairPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | undefined>(undefined);
  const [serviceName, setServiceName] = useState<string | undefined>(undefined);
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
        const maxPrice = Math.max(...data.map((service) => service.priceTo));
        setPriceRange([0, maxPrice]);
      }
    } finally {
      setLoading(false);
    }
  }

  const cityOptions = useMemo(
    () =>
      Array.from(new Set(services.map((service) => service.city).filter(Boolean))) as string[],
    [services]
  );

  const serviceOptions = useMemo(
    () => Array.from(new Set(services.map((service) => service.name))),
    [services]
  );

  const maxPrice = useMemo(
    () => (services.length > 0 ? Math.max(...services.map((service) => service.priceTo)) : 100000),
    [services]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return services
      .filter((service) => {
        const matchesQuery = normalizedQuery
          ? [
              service.name,
              service.company.name || "",
              service.city || "",
              service.description,
              ...service.tags,
            ]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)
          : true;

        const matchesCity = city ? service.city === city : true;
        const matchesServiceName = serviceName ? service.name === serviceName : true;
        const matchesPrice =
          service.priceTo >= priceRange[0] && service.priceFrom <= priceRange[1];
        const matchesRating = minRating > 0 ? (service.rating || 0) >= minRating : true;
        const matchesLicense = licensedOnly ? Boolean(service.licensed) : true;
        const matchesAvailability = canStartWithin7
          ? (service.availabilityDays ?? 999) <= 7
          : true;

        return (
          matchesQuery &&
          matchesCity &&
          matchesServiceName &&
          matchesPrice &&
          matchesRating &&
          matchesLicense &&
          matchesAvailability
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
            const leftScore =
              (left.rating || 0) +
              (left._count?.requests || 0) / 10 -
              left.priceFrom / 100000;
            const rightScore =
              (right.rating || 0) +
              (right._count?.requests || 0) / 10 -
              right.priceFrom / 100000;
            return rightScore - leftScore;
          }
        }
      });
  }, [
    canStartWithin7,
    city,
    licensedOnly,
    minRating,
    priceRange,
    query,
    serviceName,
    services,
    sortBy,
  ]);

  function resetFilters() {
    setQuery("");
    setCity(undefined);
    setServiceName(undefined);
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
              Log in to create request
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
        trigger={
          <Button size="sm">
            Create Request
          </Button>
        }
      />
    );
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Service catalog</h1>
            <p className="text-sm text-muted-foreground">
              Browse live services from the platform and create real requests.
            </p>
          </div>
          {createRequestAction}
        </div>

        <FilterBar
          title="Filters"
          description="Filter live services by city, price, rating, and readiness."
          query={query}
          city={city}
          service={serviceName}
          priceRange={priceRange}
          minRating={minRating}
          licensedOnly={licensedOnly}
          canStartWithin7={canStartWithin7}
          sortBy={sortBy}
          cityOptions={cityOptions}
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
          <div className="py-16 text-center">Loading services...</div>
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

        {!loading && filtered.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-6 w-6" />
                <p className="text-sm text-muted-foreground">
                  No services matched your filters.
                </p>
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
