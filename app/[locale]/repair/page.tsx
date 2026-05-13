"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, Info, LayoutList, LayoutGrid, X, SlidersHorizontal,
  Car, Home, Wrench, Star, Image as ImageIcon, CheckCircle2, ChevronDown,
  Sparkles, MapPin, ArrowRight, LocateFixed, Map, Heart,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Footer } from "@/components/Footer";
import { OrgCard } from "@/components/OrgCard";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { FilterBar, SortOption } from "@/components/filters/FilterBar";
import type { CategoryFilterValue } from "@/components/filters/CategoryFilter";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { ServiceRecord } from "@/lib/types";
import type { TopCategory } from "@/lib/categories";
import { Link } from "@/i18n/routing";
import { CATEGORY_COLORS, fmtNum } from "@/lib/utils";
import dynamic from "next/dynamic";

const ServiceMap = dynamic(
  () => import("@/components/ServiceMap").then((m) => m.ServiceMap),
  { ssr: false, loading: () => <div className="w-full h-[520px] rounded-2xl bg-muted animate-pulse" /> }
);

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
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const img = !imgError && service.images[0]?.url ? service.images[0].url : null;

  const CAT_LABEL: Record<string, string> = { automobiles: "Auto", "real-estate": "Real Estate", other: "Other" };

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isClient || favLoading) return;
    setFavLoading(true);
    try {
      if (isFav) { await api.removeFavorite(service.id); setIsFav(false); toast.success("Removed from saved"); }
      else { await api.addFavorite(service.id); setIsFav(true); toast.success("Saved to favorites"); }
    } catch { toast.error("Failed to update favorites"); }
    finally { setFavLoading(false); }
  }

  return (
    <div className="group flex flex-col bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:border-border hover:-translate-y-0.5 transition-all duration-200">
      <Link href={`/repair/${service.id}`} className="relative aspect-[4/3] bg-muted overflow-hidden block">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={service.name} onError={() => setImgError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground/30" aria-hidden="true" />
          </div>
        )}
        {service.images.length > 1 && (
          <div className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full">
            {service.images.length} photos
          </div>
        )}
        {/* Favorite button */}
        <div className="absolute top-2.5 right-2.5" onClick={e => e.preventDefault()}>
          {isClient ? (
            <button onClick={(e) => void toggleFavorite(e)} disabled={favLoading}
              className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 ${
                isFav ? "bg-rose-500 text-white shadow-sm" : "bg-black/30 text-white hover:bg-black/50"
              }`}>
              <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-white" : ""}`} />
            </button>
          ) : !user ? (
            <AuthModal trigger={
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors">
                <Heart className="h-3.5 w-3.5" />
              </button>
            } />
          ) : null}
        </div>
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
  const chips: { key: string; label: React.ReactNode; onRemove: () => void }[] = [];

  if (props.query)
    chips.push({ key: "q", label: <><Search className="h-3 w-3" />&nbsp;&ldquo;{props.query}&rdquo;</>, onRemove: props.onRemoveQuery });
  if (props.city)
    chips.push({ key: "city", label: <><MapPin className="h-3 w-3" />{props.city}</>, onRemove: props.onRemoveCity });
  if (props.categoryFilter.category)
    chips.push({ key: "cat", label: (
      { AUTOMOBILES: <><Car className="h-3 w-3" />Automobiles</>,
        REAL_ESTATE:  <><Home className="h-3 w-3" />Real Estate</>,
        OTHER:        <><Wrench className="h-3 w-3" />Other</> }[props.categoryFilter.category] ?? props.categoryFilter.category
    ), onRemove: props.onRemoveCategory });
  if (props.minRating > 0)
    chips.push({ key: "rating", label: <><Star className="h-3 w-3 fill-current" />{props.minRating}+ stars</>, onRemove: props.onRemoveRating });
  if (props.hasPhotos)
    chips.push({ key: "photos", label: <><ImageIcon className="h-3 w-3" />With photos</>, onRemove: props.onRemovePhotos });
  if (props.sortBy !== "relevance")
    chips.push({ key: "sort", label: ({ rating: "Top rated", price: "Cheapest first", "price-desc": "Most expensive", requests: "Most popular" } as Record<string,string>)[props.sortBy] ?? props.sortBy, onRemove: props.onRemoveSort });
  if (props.priceRange[0] > 0 || props.priceRange[1] < props.maxPrice)
    chips.push({ key: "price", label: `${props.priceRange[0].toLocaleString()} – ${props.priceRange[1].toLocaleString()} ₸`, onRemove: props.onRemovePrice });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Active filters:</span>
      {chips.map(({ key, label, onRemove }) => (
        <button key={key} onClick={onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
          {label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button onClick={props.onReset}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        <X className="h-3 w-3" /> Clear all
      </button>
    </div>
  );
}

/* ─── Category tabs ─── */
const CATEGORY_TABS: { labelKey: string; icon: React.ElementType | null; value: TopCategory | null }[] = [
  { labelKey: "all",         icon: null,   value: null },
  { labelKey: "AUTOMOBILES", icon: Car,    value: "AUTOMOBILES" },
  { labelKey: "REAL_ESTATE", icon: Home,   value: "REAL_ESTATE" },
  { labelKey: "OTHER",       icon: Wrench, value: "OTHER" },
];

/* ─── Sort option keys ─── */
const SORT_OPTION_KEYS: { key: "rating" | "price_asc" | "price_desc" | "newest"; value: SortOption }[] = [
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
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("list");
  useEffect(() => {
    const saved = localStorage.getItem("catalog:view") as "list" | "grid" | "map" | null;
    if (saved && ["list", "grid", "map"].includes(saved)) setViewMode(saved);
  }, []);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);

  /* Load data */
  useEffect(() => { void loadServices(); }, []); // eslint-disable-line react-hooks/exhaustive-deps


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
    const q = query.trim().toLowerCase();
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
        // Radius filter: only apply to services that have coordinates
        if (userCoords && radiusKm && s.lat != null && s.lng != null) {
          if (haversineKm(userCoords.lat, userCoords.lng, s.lat, s.lng) > radiusKm) return false;
        }
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
  }, [services, query, city, priceRange, minRating, categoryFilter, hasPhotos, sortBy, userCoords, radiusKm]);

  /* Pagination */
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  /* Reset page on filter change */
  useEffect(() => setPage(1), [query, city, categoryFilter, minRating, hasPhotos, sortBy, priceRange]);

  function resetFilters() {
    setQuery(""); setCity(undefined); setCategoryFilter({});
    setPriceRange([0, maxPrice]); setMinRating(0); setHasPhotos(false); setSortBy("relevance");
    setUserCoords(null); setRadiusKm(null);
  }

  function toggleView(mode: "list" | "grid" | "map") {
    setViewMode(mode);
    localStorage.setItem("catalog:view", mode);
  }

  function handleGetLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setRadiusKm(10); // default 10 km radius
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
            { headers: { "User-Agent": "Remont.kz/1.0" } }
          );
          const data = await res.json() as { address?: { city?: string; town?: string; village?: string } };
          const detectedCity = data.address?.city ?? data.address?.town ?? data.address?.village;
          if (detectedCity) setCity(detectedCity);
        } catch { /* silent */ }
      },
      () => { toast.error("Location access denied"); }
    );
  }

  function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const activeCategory = categoryFilter.category ?? null;

  const createRequestAction = (() => {
    if (!user) return <AuthModal trigger={<Button variant="outline" size="sm" className="rounded-xl">{t("createRequest") || "Log in to request"}</Button>} />;
    if (user.role !== "client") return null;
    return (
      <RequestCreateDialog trigger={<Button size="sm" className="rounded-xl gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {t("createRequest") || "Post request"}</Button>} />
    );
  })();

  /* Active filter count for sticky bar */
  const activeFilterCount = [
    query, city, categoryFilter.category, minRating > 0, hasPhotos, sortBy !== "relevance",
    priceRange[0] > 0 || priceRange[1] < maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background" ref={scrollRef}>


      <main className="mx-auto max-w-6xl px-4 py-8">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={userCoords ? "default" : "outline"} size="sm" className="gap-1.5 rounded-xl hidden sm:inline-flex"
              onClick={() => {
                if (userCoords) { setUserCoords(null); setRadiusKm(null); }
                else handleGetLocation();
              }} title="Use my location">
              <LocateFixed className="h-3.5 w-3.5" />
              {userCoords ? `≤${radiusKm}km` : (city ? city : t("nearMe"))}
            </Button>
            {userCoords && (
              <select
                value={radiusKm ?? 10}
                onChange={e => setRadiusKm(Number(e.target.value))}
                className="h-8 rounded-xl border border-border/50 bg-card px-2 text-xs hidden sm:block"
              >
                {[5, 10, 20, 50].map(km => <option key={km} value={km}>{km} km</option>)}
              </select>
            )}
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

        {/* ── Category tabs + controls ── */}
        <div className="border-b border-border/50 mb-5">
          {/* Row 1: category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0 hide-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const isActive = tab.value ? activeCategory === tab.value : !activeCategory;
              const Icon = tab.icon;
              const label = tab.value
                ? tCat(tab.value as "AUTOMOBILES" | "REAL_ESTATE" | "OTHER")
                : t("allCategories");
              return (
                <button
                  key={tab.labelKey}
                  onClick={() => setCategoryFilter(tab.value ? { category: tab.value } : {})}
                  className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150
                    ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Full-width results */}
        <div>

          {/* Controls bar: Filters + Sort + Count + View */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">

              {/* Filters button */}
              <Button variant="outline" size="sm" className="h-8 rounded-xl gap-2 border-border/70"
                onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black px-1">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <div className="h-5 w-px bg-border/60 mx-0.5" />

              {/* Sort tabs */}
              <span className="text-xs text-muted-foreground font-medium hidden sm:block">Sort:</span>
              {SORT_OPTION_KEYS.map(({ key, value }) => (
                <button key={value} onClick={() => setSortBy(sortBy === value ? "relevance" : value)}
                  className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all ${
                    sortBy === value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                  {t(`sortOptions.${key}`)}
                </button>
              ))}
            </div>

            {/* Right: count + view toggle */}
            <div className="flex items-center gap-3">
              {!loading && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  <span className="font-semibold text-foreground">{filtered.length}</span> {t("found") || "results"}
                </p>
              )}
              <div className="flex items-center gap-0.5 border border-border/50 rounded-xl p-0.5 bg-card">
                {([
                  { mode: "list" as const, Icon: LayoutList, label: "List" },
                  { mode: "grid" as const, Icon: LayoutGrid, label: "Grid" },
                  { mode: "map"  as const, Icon: Map,        label: "Map"  },
                ] as const).map(({ mode, Icon, label }) => (
                  <button key={mode} onClick={() => toggleView(mode)} title={label}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

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

            {/* Loading skeletons */}
            {loading && (
              viewMode === "grid"
                ? <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{[1,2,3,4].map(i => <ShimmerCard key={i} grid />)}</div>
                : <div className="space-y-3">{[1,2,3].map(i => <ShimmerCard key={i} />)}</div>
            )}

            {/* Map view */}
            {!loading && viewMode === "map" && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">
                    {filtered.filter(s => s.city && ["Almaty","Astana","Shymkent","Karaganda","Aktobe","Taraz","Pavlodar","Oskemen","Semey","Atyrau","Kostanay","Kyzylorda","Oral","Petropavl","Aktau","Temirtau","Turkestan"].includes(s.city)).length} services on map
                  </span>
                  <span className="text-xs text-muted-foreground">— click a marker to see details</span>
                </div>
                <ServiceMap
                  services={filtered.filter(s => !!s.city)}
                  onServiceClick={(id) => window.open(`/repair/${id}`, "_blank")}
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Services without a city are not shown on the map.
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && filtered.length > 0 && viewMode !== "map" && (
              <>
                {viewMode === "grid"
                  ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      { labelKey: "AUTOMOBILES" as const, Icon: Car,    cat: "AUTOMOBILES" },
                      { labelKey: "REAL_ESTATE" as const, Icon: Home,   cat: "REAL_ESTATE" },
                      { labelKey: "OTHER" as const,       Icon: Wrench, cat: "OTHER" },
                    ] as const).map(({ labelKey, Icon, cat }) => (
                      <button key={cat}
                        onClick={() => { resetFilters(); setCategoryFilter({ category: cat as TopCategory }); }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all">
                        <Icon className="h-3.5 w-3.5" /> {tCat(labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </main>
      <Footer />

      {/* ── Filter drawer overlay ── */}
      {filterOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setFilterOpen(false)} />
      )}

      {/* ── Filter drawer ── */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-background border-l border-border/50 shadow-2xl flex flex-col transition-transform duration-300 ${filterOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-bold text-sm">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black px-1.5">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button onClick={() => setFilterOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <FilterBar
            title="Filters"
            categoryFilter={categoryFilter} onChangeCategoryFilter={setCategoryFilter}
            query={query} city={city} priceRange={priceRange} minRating={minRating}
            hasPhotos={hasPhotos} sortBy={sortBy} priceMin={0} priceMax={maxPrice} priceStep={1000}
            onChangeQuery={setQuery} onChangeCity={setCity} onChangePriceRange={setPriceRange}
            onChangeMinRating={setMinRating} onChangeHasPhotos={setHasPhotos}
            onChangeSort={setSortBy} onReset={resetFilters}
          />
        </div>
        <div className="px-5 py-4 border-t border-border/50 shrink-0">
          <Button className="w-full rounded-xl gap-2" onClick={() => setFilterOpen(false)}>
            <CheckCircle2 className="h-4 w-4" />
            Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
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


