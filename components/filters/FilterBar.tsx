"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, Search, X, SlidersHorizontal, ImageIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryFilter, type CategoryFilterValue } from "@/components/filters/CategoryFilter";
import { KZ_CITIES } from "@/lib/cities";

export type SortOption = "relevance" | "rating" | "price" | "price-desc" | "requests";

export interface FilterBarProps {
  query?: string;
  city?: string;
  priceRange: [number, number];
  minRating: number;
  hasPhotos?: boolean;
  licensedOnly?: boolean;
  canStartWithin7?: boolean;
  sortBy?: SortOption;
  categoryFilter?: CategoryFilterValue;
  onChangeCategoryFilter?: (v: CategoryFilterValue) => void;
  showCategory?: boolean;
  showQuery?: boolean;
  showCity?: boolean;
  showSort?: boolean;
  onChangeQuery?: (q: string) => void;
  onChangeCity?: (c?: string) => void;
  onChangePriceRange: (r: [number, number]) => void;
  onChangeMinRating: (r: number) => void;
  onChangeHasPhotos?: (v: boolean) => void;
  onChangeSort?: (s: SortOption) => void;
  onReset?: () => void;
  onApply?: () => void;
  title?: string;
  description?: string;
  priceMin?: number;
  priceMax?: number;
  priceStep?: number;
}

function FilterContent(props: FilterBarProps) {
  const t = useTranslations("repair");
  const tCommon = useTranslations("common");
  const {
    categoryFilter, onChangeCategoryFilter, showCategory = true,
    query = "", city,
    priceRange, minRating, sortBy = "relevance",
    hasPhotos = false,
    showQuery = true, showCity = true, showSort = true,
    onChangeQuery, onChangeCity,
    onChangePriceRange, onChangeMinRating, onChangeSort, onChangeHasPhotos,
    onReset,
    priceMin = 0, priceMax = 100000, priceStep = 1000,
  } = props;

  return (
    <div className="space-y-5">
      {/* Search */}
      {showQuery && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{tCommon("search")}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => onChangeQuery?.(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* City */}
      {showCity && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("city")}</Label>
          <Select value={city || "__any__"} onValueChange={(v) => onChangeCity?.(v === "__any__" ? undefined : v)}>
            <SelectTrigger>
              <SelectValue placeholder={t("allCities")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any__">{t("allCities")}</SelectItem>
              {KZ_CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Category */}
      {showCategory && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("category")}</Label>
          <CategoryFilter value={categoryFilter ?? {}} onChange={(v) => onChangeCategoryFilter?.(v)} />
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("priceRange")}</Label>
          <span className="text-xs font-medium">{priceRange[0].toLocaleString("ru-RU")} — {priceRange[1].toLocaleString("ru-RU")} ₸</span>
        </div>
        <div className="px-1 pt-1">
          <Slider min={priceMin} max={priceMax} step={priceStep} value={priceRange} onValueChange={(v) => onChangePriceRange([v[0] as number, v[1] as number])} />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{priceMin.toLocaleString("ru-RU")} ₸</span>
            <span>{priceMax.toLocaleString("ru-RU")} ₸</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">★</Label>
          <span className="text-xs font-medium">{minRating > 0 ? `${minRating.toFixed(1)} ★` : tCommon("all")}</span>
        </div>
        <div className="px-1 pt-1">
          <Slider min={0} max={5} step={0.5} value={[minRating]} onValueChange={(v) => onChangeMinRating(v[0] as number)} />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground"><span>{tCommon("all")}</span><span>5.0 ★</span></div>
        </div>
      </div>

      {/* Sort */}
      {showSort && (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("sortBy")}</Label>
          <Select value={sortBy} onValueChange={(v) => onChangeSort?.(v as SortOption)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{t("sortBy")}</SelectItem>
              <SelectItem value="rating">{t("sortOptions.rating")}</SelectItem>
              <SelectItem value="price">{t("sortOptions.price_asc")}</SelectItem>
              <SelectItem value="price-desc">{t("sortOptions.price_desc")}</SelectItem>
              <SelectItem value="requests">{t("sortOptions.newest")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Has photos */}
      <div className="flex items-center gap-2.5">
        <Checkbox
          id="has-photos"
          checked={hasPhotos}
          onCheckedChange={(v) => onChangeHasPhotos?.(!!v)}
        />
        <label htmlFor="has-photos" className="text-sm flex items-center gap-1.5 cursor-pointer select-none">
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" /> {t("licensed")}
        </label>
      </div>

      {onReset && (
        <Button variant="outline" onClick={onReset} className="w-full gap-2">
          <X className="h-4 w-4" /> {tCommon("reset")}
        </Button>
      )}
    </div>
  );
}

export function FilterBar(props: FilterBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("repair");
  const tCommon = useTranslations("common");

  return (
    <>
      {/* Desktop */}
      <Card className="hidden md:block shadow-sm">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">{props.title ?? t("filterTitle")}</span>
          </div>
          <FilterContent {...props} />
        </CardContent>
      </Card>

      {/* Mobile */}
      <div className="md:hidden">
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <div className="flex items-center justify-between mb-4">
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> {t("filterTitle")}
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> {t("filterTitle")}
              </DialogTitle>
            </DialogHeader>
            <FilterContent
              {...props}
              onApply={() => { props.onApply?.(); setMobileOpen(false); }}
            />
            <Button className="w-full mt-2" onClick={() => setMobileOpen(false)}>
              {tCommon("apply")}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
