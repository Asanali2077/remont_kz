"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, Info, LayoutList, LayoutGrid, X, SlidersHorizontal,
  Car, Home, Wrench, Star, Image, CheckCircle2, ChevronDown,
  Sparkles, MapPin, ArrowRight, LocateFixed,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Footer } from "@/components/Footer";
import { OrgCard } from "@/components/OrgCard";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";
import { AiRequestBot } from "@/components/AiRequestBot";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { FilterBar, SortOption } from "@/components/filters/FilterBar";
import type { CategoryFilterValue } from "@/components/filters/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { ServiceRecord } from "@/lib/types";
import type { TopCategory } from "@/lib/categories";
import { Link } from "@/i18n/routing";
import { CATEGORY_COLORS, fmtNum } from "@/lib/utils";

const PAGE_SIZE = 10;

/* ─── Shimmer skeleton ─── */
function ShimmerCard({ grid }: { grid?: boolean }) {
  if (grid) return (
    <div className="rounded-2xl border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-4/5" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-8 bg-muted rounded-xl mt-2" />
      </div>
    </div>
  );
  return (
    <div className="flex rounded-2xl border bg-card overflow-hidden h-44 animate-pulse">
      <div className="w-52 md:w-60 bg-muted shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="flex-1 p-5 space-y-3">
        <div className="h-3 bg-muted rounded w-1/4" />
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="flex gap-2 mt-2">
          <div className="h-8 bg-muted rounded-xl flex-1" />
          <div className="h-8 w-24 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Compact Grid Card ─── */
function GridCard({ service }: { service: ServiceRecord }) {
  const { user } = useAuth();
  const isClient = user?.role === "client";
  const [imgError, setImgError] = useState(false);
  const img = !imgError && service.images[0]?.url ? service.images[0].url : null;

  const CAT_LABEL: Record<string, string> = { automobiles: "Auto", "real-estate": "Real Estate", other: "Other" };

  return (
    <div className="group flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-border hover:-translate-y-0.5 transition-all duration-200">
      <Link href={`/repair/${service.id}`} className="relative aspect-[4/3] bg-muted overflow-hidden block">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={service.name} onError={() => setImgError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Image className="h-8 w-8 text-muted-foreground/30" aria-label="No photo" />
          </div>
        )}
        {service.images.length > 1 && (
          <div className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full">
            {service.images.length} photos
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center justify-between gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[service.category]}`}>
            {CAT_LABEL[service.category]}
          </span>
          {service.city && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />{service.city}
            </span>
          )}
        </div>

        <Link href={`/repair/${service.id}`}>
          <h3 className="text-sm font-bold leading-snug line-clamp-2 hover:text-primary transition-colors">{service.name}</h3>
        </Link>
        <p className="text-[11px] text-muted-foreground truncate">{service.company.name}</p>

        {typeof service.rating === "number" && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold">{service.rating.toFixed(1)}</span>
            <span className="text-[11px] text-muted-foreground">({service._count?.requests ?? 0})</span>
          </div>
        )}

        <p className="text-sm font-bold mt-auto">
          {fmtNum(service.priceFrom)}
          {service.priceTo !== service.priceFrom && <> – {fmtNum(service.priceTo)}</>}
          <span className="text-xs font-normal text-muted-foreground ml-0.5">₸</span>
        </p>

        <div className="flex gap-1.5 mt-1">
          {isClient ? (
            <RequestCreateDialog service={service} trigger={
              <Button size="sm" className="flex-1 h-8 text-xs rounded-xl gap-1 shadow-sm shadow-primary/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> Request
              </Button>
            } />
          ) : !user ? (
            <AuthModal trigger={
              <Button size="sm" className="flex-1 h-8 text-xs rounded-xl">Request</Button>
            } />
          ) : null}
          <Link href={`/repair/${service.id}`} className="shrink-0">
            <Button variant="outline" size="sm" className="h-8 w-8 rounded-xl p-0">
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Active filter chips ─── */
interface ActiveChipsProps {
  query: string; city?: string; categoryFilter: CategoryFilterValue;
  minRating: number; hasPhotos: boolean; sortBy: SortOption; maxPrice: number; priceRange: [number, number];
  onRemoveQuery: () => void; onRemoveCity: () => void; onRemoveCategory: () => void;
  onRemoveRating: () => void; onRemovePhotos: () => void; onRemoveSort: () => void;
  onRemovePrice: () => void; onReset: () => void;
}

function ActiveChips(props: ActiveChipsProps) {
  const chips: { label: string; onRemove: () => void }[] = [];

  if (props.query) chips.push({ label: `"${props.query}"`, onRemove: props.onRemoveQuery });
  if (props.city) chips.push({ label: `📍 ${props.city}`, onRemove: props.onRemoveCity });
  if (props.categoryFilter.category) chips.push({ label: { AUTOMOBILES: "🚗 Automobiles", REAL_ESTATE: "🏠 Real Estate", OTHER: "🔧 Other" }[props.categoryFilter.category] ?? props.categoryFilter.category, onRemove: props.onRemoveCategory });
  if (props.minRating > 0) chips.push({ label: `⭐ ${props.minRating}+`, onRemove: props.onRemoveRating });
  if (props.hasPhotos) chips.push({ label: "📸 With photos", onRemove: props.onRemovePhotos });
  if (props.sortBy !== "relevance") chips.push({ label: { rating: "↑ Top rated", price: "↑ Price", "price-desc": "↓ Price", requests: "🔥 Popular" }[props.sortBy] ?? props.sortBy, onRemove: props.onRemoveSort });
  if (props.priceRange[0] > 0 || props.priceRange[1] < props.maxPrice) chips.push({ label: `${props.priceRange[0].toLocaleString()} – ${props.priceRange[1].toLocaleString()} ₸`, onRemove: props.onRemovePrice });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Active:</span>
      {chips.map(({ label, onRemove }) => (
        <button key={label} onClick={onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors">
          {label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button onClick={props.onReset}
        className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <X className="h-3 w-3" /> Clear all
      </button>
    </div>
  );
}

/* ─── Quick filter tabs (labels set in component) ─── */
const QUICK_FILTER_DEFS = [
  { labelKey: "all",         icon: null,   value: null,            type: "category" },
  { labelKey: "AUTOMOBILES", icon: Car,    value: "AUTOMOBILES",   type: "category" },
  { labelKey: "REAL_ESTATE", icon: Home,   value: "REAL_ESTATE",   type: "category" },
  { labelKey: "OTHER",       icon: Wrench, value: "OTHER",         type: "category" },
  { labelKey: "rating",      icon: Star,   value: "rating",        type: "sort" },
  { labelKey: "hasPhotos",   icon: Image,  value: "photos",        type: "photos" },
] as const;

/* ─── Sort option keys ─── */
const SORT_OPTION_KEYS: { key: "rating" | "price_asc" | "price_desc" | "newest" | null; value: SortOption }[] = [
  { key: null,         value: "relevance" },
  { key: "rating",    value: "rating" },
  { key: "price_asc", value: "price" },
  { key: "price_desc",value: "price-desc" },
  { key: "newest",    value: "requests" },
];

/* ════════════════════════════════
   MAIN CONTENT
════════════════════════════════ */
function RepairContent() {
  const { user } = useAuth();
  const t = useTranslations("repair");
  const tCat = useTranslations("categories");
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  /* State */
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState<string | undefined>(searchParams.get("city") ?? undefined);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterValue>(() => {
    const cat = searchParams.get("category");
    return cat ? { category: cat as TopCategory } : {};
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [hasPhotos, setHasPhotos] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    if (typeof window === "undefined") return "list";
    return (localStorage.getItem("catalog:view") as "list" | "grid") ?? "list";
  });
  const [page, setPage] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [stickyQuery, setStickyQuery] = useState("");

  /* Load data */
  useEffect(() => { void loadServices(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Scroll detection for sticky bar */
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 180);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const [data, favs] = await Promise.all([
        api.getServices({ active: true }),
        user?.role === "client" ? api.getFavorites().catch(() => []) : Promise.resolve([]),
      ]);
      setServices(data);
      setFavoriteIds(new Set(favs.map((s) => s.id)));
      if (data.length > 0) setPriceRange([0, Math.max(...data.map((s) => s.priceTo))]);
    } finally {
      setLoading(false);
    }
  }

  const maxPrice = useMemo(
    () => (services.length > 0 ? Math.max(...services.map((s) => s.priceTo)) : 100000),
    [services]
  );

  /* Filter + sort */
  const filtered = useMemo(() => {
    const q = (query || stickyQuery).trim().toLowerCase();
    return services
      .filter((s) => {
        if (q && ![s.name, s.company.name ?? "", s.city ?? "", s.description, ...s.tags].join(" ").toLowerCase().includes(q)) return false;
        if (city && s.city !== city) return false;
        if (s.priceTo < priceRange[0] || s.priceFrom > priceRange[1]) return false;
        if (minRating > 0 && (s.rating ?? 0) < minRating) return false;
        if (categoryFilter.category) {
          const map: Record<string, string> = { AUTOMOBILES: "automobiles", REAL_ESTATE: "real-estate", OTHER: "other" };
          if (s.category !== map[categoryFilter.category]) return false;
        }
        if (categoryFilter.subcategory && !s.tags.includes(categoryFilter.subcategory)) return false;
        if (hasPhotos && s.images.length === 0) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "rating":     return (b.rating ?? 0) - (a.rating ?? 0);
          case "price":      return a.priceFrom - b.priceFrom;
          case "price-desc": return b.priceFrom - a.priceFrom;
          case "requests":   return (b._count?.requests ?? 0) - (a._count?.requests ?? 0);
          default: {
            const score = (s: ServiceRecord) => (s.rating ?? 0) + (s._count?.requests ?? 0) / 10 - s.priceFrom / 100000;
            return score(b) - score(a);
          }
        }
      });
  }, [services, query, stickyQuery, city, priceRange, minRating, categoryFilter, hasPhotos, sortBy]);

  /* Pagination */
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  /* Reset page on filter change */
  useEffect(() => setPage(1), [query, city, categoryFilter, minRating, hasPhotos, sortBy, priceRange]);

  function resetFilters() {
    setQuery(""); setCity(undefined); setCategoryFilter({});
    setPriceRange([0, maxPrice]); setMinRating(0); setHasPhotos(false); setSortBy("relevance");
    setStickyQuery("");
  }

  function toggleView(mode: "list" | "grid") {
    setViewMode(mode);
    localStorage.setItem("catalog:view", mode);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=en`,
            { headers: { "User-Agent": "Remont.kz/1.0" } }
          );
          const data = await res.json() as { address?: { city?: string; town?: string; village?: string } };
          const detectedCity = data.address?.city ?? data.address?.town ?? data.address?.village;
          if (detectedCity) setCity(detectedCity);
        } catch { /* silent */ }
      },
      () => { /* permission denied */ }
    );
  }

  function handleQuickFilter(filter: typeof QUICK_FILTER_DEFS[number]) {
    if (filter.type === "category") {
      setCategoryFilter(filter.value ? { category: filter.value as TopCategory } : {});
    } else if (filter.type === "sort") {
      setSortBy(filter.value as SortOption);
    } else if (filter.type === "photos") {
      setHasPhotos((v) => !v);
    }
  }

  const activeCategory = categoryFilter.category ?? null;

  const createRequestAction = (() => {
    if (!user) return <AuthModal trigger={<Button variant="outline" size="sm" className="rounded-xl">{t("createRequest") || "Log in to request"}</Button>} />;
    if (user.role !== "client") return null;
    return (
      <div className="flex gap-2">
        <AiRequestBot onCreated={() => void loadServices()} />
        <RequestCreateDialog trigger={<Button size="sm" className="rounded-xl gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {t("createRequest") || "Post request"}</Button>} />
      </div>
    );
  })();

  /* Active filter count for sticky bar */
  const activeFilterCount = [
    query, city, categoryFilter.category, minRating > 0, hasPhotos, sortBy !== "relevance",
    priceRange[0] > 0 || priceRange[1] < maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background" ref={scrollRef}>

      {/* ════ STICKY MINI-BAR ════ */}
      <div className={`fixed top-14 left-0 right-0 z-30 transition-all duration-300 ${isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
        <div className="bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={stickyQuery} onChange={(e) => setStickyQuery(e.target.value)}
                placeholder="Search services…" className="pl-9 h-8 text-sm rounded-xl" />
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> results
            </div>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5">
                <SlidersHorizontal className="h-3 w-3" /> {activeFilterCount}
              </span>
            )}
            <Button variant="ghost" size="sm" className="h-8 rounded-xl text-xs gap-1" onClick={resetFilters}>
              <X className="h-3 w-3" /> Reset
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl hidden sm:inline-flex"
              onClick={useMyLocation} title="Use my location">
              <LocateFixed className="h-3.5 w-3.5" />
              {city ? `📍 ${city}` : t("nearMe")}
            </Button>
            {createRequestAction}
          </div>
        </div>

        {/* Company notice */}
        {user?.role === "company" && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <p className="text-sm">
              <span className="font-medium">This is the client catalog.</span>{" "}
              <Link href="/company/catalog" className="text-primary hover:underline underline-offset-2">View client requests →</Link>
            </p>
          </div>
        )}

        {/* ── Quick filter tabs ── */}
        <div className="flex flex-wrap gap-2 mb-5">
          {QUICK_FILTER_DEFS.map((f) => {
            const isActive =
              f.type === "category" ? (f.value ? activeCategory === f.value : !activeCategory) :
              f.type === "sort"     ? sortBy === f.value :
              f.type === "photos"   ? hasPhotos : false;
            const Icon = f.icon;
            const label = f.type === "category" && f.value
              ? tCat(f.value as "AUTOMOBILES" | "REAL_ESTATE" | "OTHER")
              : f.labelKey === "all" ? t("allCategories")
              : f.labelKey === "rating" ? t("sortOptions.rating")
              : f.labelKey === "hasPhotos" ? "📸"
              : f.labelKey;
            return (
              <button key={f.labelKey} onClick={() => handleQuickFilter(f)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${isActive ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20" : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"}`}>
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
              </button>
            );
          })}
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">

          {/* Sidebar */}
          <aside className="hidden md:block w-64 shrink-0 sticky top-28">
            <FilterBar
              title="Filters"
              categoryFilter={categoryFilter} onChangeCategoryFilter={setCategoryFilter}
              query={query} city={city} priceRange={priceRange} minRating={minRating}
              hasPhotos={hasPhotos} sortBy={sortBy} priceMin={0} priceMax={maxPrice} priceStep={1000}
              onChangeQuery={setQuery} onChangeCity={setCity} onChangePriceRange={setPriceRange}
              onChangeMinRating={setMinRating} onChangeHasPhotos={setHasPhotos}
              onChangeSort={setSortBy} onReset={resetFilters}
            />
          </aside>

          {/* Mobile filter */}
          <div className="md:hidden w-full mb-2">
            <FilterBar
              categoryFilter={categoryFilter} onChangeCategoryFilter={setCategoryFilter}
              query={query} city={city} priceRange={priceRange} minRating={minRating}
              hasPhotos={hasPhotos} sortBy={sortBy} priceMin={0} priceMax={maxPrice} priceStep={1000}
              onChangeQuery={setQuery} onChangeCity={setCity} onChangePriceRange={setPriceRange}
              onChangeMinRating={setMinRating} onChangeHasPhotos={setHasPhotos}
              onChangeSort={setSortBy} onReset={resetFilters}
            />
          </div>

          {/* Results area */}
          <div className="flex-1 min-w-0">

            {/* Active filter chips */}
            {!loading && (
              <ActiveChips
                query={query} city={city} categoryFilter={categoryFilter}
                minRating={minRating} hasPhotos={hasPhotos} sortBy={sortBy}
                maxPrice={maxPrice} priceRange={priceRange}
                onRemoveQuery={() => setQuery("")}
                onRemoveCity={() => setCity(undefined)}
                onRemoveCategory={() => setCategoryFilter({})}
                onRemoveRating={() => setMinRating(0)}
                onRemovePhotos={() => setHasPhotos(false)}
                onRemoveSort={() => setSortBy("relevance")}
                onRemovePrice={() => setPriceRange([0, maxPrice])}
                onReset={resetFilters}
              />
            )}

            {/* Sort + View controls */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              {/* Sort tabs */}
              <div className="flex items-center gap-1 flex-wrap">
                {SORT_OPTION_KEYS.map(({ key, value }) => (
                  <button key={value} onClick={() => setSortBy(value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${sortBy === value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    {key ? t(`sortOptions.${key}`) : t("sortBy")}
                  </button>
                ))}
              </div>

              {/* Right: count + view toggle */}
              <div className="flex items-center gap-3">
                {!loading && (
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    <span className="font-bold text-foreground">{filtered.length}</span> {t("found") || "of"} {services.length}
                  </p>
                )}
                <div className="flex items-center gap-0.5 border border-border/50 rounded-xl p-0.5 bg-card">
                  <button onClick={() => toggleView("list")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    <LayoutList className="h-4 w-4" />
                  </button>
                  <button onClick={() => toggleView("grid")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading skeletons */}
            {loading && (
              viewMode === "grid"
                ? <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <ShimmerCard key={i} grid />)}</div>
                : <div className="space-y-3">{[1,2,3].map(i => <ShimmerCard key={i} />)}</div>
            )}

            {/* Results */}
            {!loading && filtered.length > 0 && (
              <>
                {viewMode === "grid"
                  ? (
                    <div className="grid grid-cols-2 gap-3">
                      {visible.map((s) => (
                        <GridCard key={s.id} service={s} />
                      ))}
                    </div>
                  )
                  : (
                    <div className="flex flex-col gap-3">
                      {visible.map((s) => (
                        <OrgCard key={s.id} service={s} initialFavorited={favoriteIds.has(s.id)} />
                      ))}
                    </div>
                  )
                }

                {/* Load more */}
                {hasMore && (
                  <div className="mt-6 text-center">
                    <div className="text-xs text-muted-foreground mb-3">
                      Showing <span className="font-semibold text-foreground">{visible.length}</span> of <span className="font-semibold text-foreground">{filtered.length}</span> services
                    </div>
                    <Button variant="outline" className="rounded-xl gap-2 px-8" onClick={() => setPage((p) => p + 1)}>
                      Load {Math.min(PAGE_SIZE, filtered.length - visible.length)} more
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/60 bg-card py-14 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-5">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-1">{t("noResults")}</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                  {t("noResultsDesc")}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button variant="outline" className="rounded-xl gap-2" onClick={resetFilters}>
                    <X className="h-4 w-4" /> {t("resetFilters")}
                  </Button>
                  {user?.role === "client" && (
                    <RequestCreateDialog trigger={
                      <Button className="rounded-xl gap-2">
                        <Sparkles className="h-4 w-4" /> Post a custom request
                      </Button>
                    } />
                  )}
                </div>
                {/* Related suggestions */}
                <div className="mt-8 pt-6 border-t border-border/40">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Browse instead</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {([
                      { labelKey: "AUTOMOBILES" as const, emoji: "🚗", cat: "AUTOMOBILES" },
                      { labelKey: "REAL_ESTATE" as const, emoji: "🏠", cat: "REAL_ESTATE" },
                      { labelKey: "OTHER" as const, emoji: "🔧", cat: "OTHER" },
                    ] as const).map(({ labelKey, emoji, cat }) => (
                      <button key={cat}
                        onClick={() => { resetFilters(); setCategoryFilter({ category: cat as TopCategory }); }}
                        className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all">
                        {emoji} {tCat(labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RepairPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 p-8">
        <div className="mx-auto max-w-6xl space-y-3">
          {[1,2,3].map(i => <ShimmerCard key={i} />)}
        </div>
      </div>
    }>
      <RepairContent />
    </Suspense>
  );
}


