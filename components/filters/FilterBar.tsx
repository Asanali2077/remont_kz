"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, MapPin, Star, ImageIcon } from "lucide-react";
import { CategoryFilter, type CategoryFilterValue } from "@/components/filters/CategoryFilter";
import { KZ_CITIES } from "@/lib/cities";

export type SortOption = "relevance" | "rating" | "price" | "price-desc" | "requests";

export interface FilterBarProps {
  query?: string;
  city?: string;
  priceRange: [number, number];
  minRating: number;
  hasPhotos?: boolean;
  sortBy?: SortOption;
  categoryFilter?: CategoryFilterValue;
  onChangeCategoryFilter?: (v: CategoryFilterValue) => void;
  onChangeQuery?: (q: string) => void;
  onChangeCity?: (c?: string) => void;
  onChangePriceRange: (r: [number, number]) => void;
  onChangeMinRating: (r: number) => void;
  onChangeHasPhotos?: (v: boolean) => void;
  onChangeSort?: (s: SortOption) => void;
  onReset?: () => void;
  priceMin?: number;
  priceMax?: number;
  priceStep?: number;
  title?: string;
}

export function FilterBar(props: FilterBarProps) {
  const t = useTranslations("repair");

  const {
    query = "", city,
    priceRange, minRating,
    hasPhotos = false,
    onChangeQuery, onChangeCity,
    onChangePriceRange, onChangeMinRating, onChangeHasPhotos,
    onReset,
    priceMin = 0, priceMax = 100000, priceStep = 1000,
  } = props;

  return (
    <div className="space-y-6">

      {/* Search */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Search
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => onChangeQuery?.(e.target.value)}
            className="pl-9 rounded-xl h-10"
          />
          {query && (
            <button
              onClick={() => onChangeQuery?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Category
        </p>
        <CategoryFilter
          value={props.categoryFilter ?? {}}
          onChange={(v) => props.onChangeCategoryFilter?.(v)}
        />
      </div>

      {/* City */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          City
        </p>
        <Select
          value={city ?? "__any__"}
          onValueChange={(v) => onChangeCity?.(v === "__any__" ? undefined : v)}
        >
          <SelectTrigger className="rounded-xl h-10">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder={t("allCities")} />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__any__">{t("allCities")}</SelectItem>
            {KZ_CITIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Price range
        </p>
        {/* Input fields */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              value={priceRange[0]}
              min={priceMin}
              max={priceRange[1]}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), priceRange[1]);
                onChangePriceRange([Math.max(priceMin, val), priceRange[1]]);
              }}
              className="pr-6 rounded-xl h-9 text-sm tabular-nums"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">₸</span>
          </div>
          <span className="text-muted-foreground text-sm shrink-0">—</span>
          <div className="relative flex-1">
            <Input
              type="number"
              value={priceRange[1]}
              min={priceRange[0]}
              max={priceMax}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), priceRange[0]);
                onChangePriceRange([priceRange[0], Math.min(priceMax, val)]);
              }}
              className="pr-6 rounded-xl h-9 text-sm tabular-nums"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">₸</span>
          </div>
        </div>
        {/* Slider */}
        <div className="px-1">
          <Slider
            min={priceMin} max={priceMax} step={priceStep}
            value={priceRange}
            onValueChange={(v) => onChangePriceRange([v[0] as number, v[1] as number])}
          />
          <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
            <span>{priceMin.toLocaleString("ru-RU")} ₸</span>
            <span>{priceMax.toLocaleString("ru-RU")} ₸</span>
          </div>
        </div>
      </div>

      {/* Min rating */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Minimum rating
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeMinRating(0)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              minRating === 0
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Any
          </button>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => onChangeMinRating(minRating === s ? 0 : s)}
              className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                minRating >= s
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Star className={`h-3 w-3 ${minRating >= s ? "fill-current" : ""}`} />
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* With photos */}
      <button
        onClick={() => onChangeHasPhotos?.(!hasPhotos)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
          hasPhotos
            ? "border-primary/40 bg-primary/5 text-primary"
            : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
        }`}
      >
        <ImageIcon className="h-4 w-4 shrink-0" />
        <span className="text-sm font-semibold flex-1">With photos only</span>
        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
          hasPhotos ? "border-primary bg-primary" : "border-border/60"
        }`}>
          {hasPhotos && <div className="h-2 w-2 bg-white rounded-full" />}
        </div>
      </button>

      {/* Divider + Reset */}
      {onReset && (
        <>
          <div className="border-t border-border/40" />
          <Button
            variant="ghost" size="sm" onClick={onReset}
            className="w-full gap-2 text-muted-foreground hover:text-foreground rounded-xl h-9"
          >
            <X className="h-3.5 w-3.5" /> Reset filters
          </Button>
        </>
      )}
    </div>
  );
}
