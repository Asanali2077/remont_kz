"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, Search, Calendar, X } from "lucide-react";
import { CategoryFilter, type CategoryFilterValue } from "@/components/filters/CategoryFilter";

export type SortOption = "relevance" | "rating" | "price" | "requests";

export interface FilterBarProps {
  // Values
  query?: string;
  city?: string;
  service?: string;
  priceRange: [number, number];
  minRating: number;
  licensedOnly?: boolean;
  canStartWithin7?: boolean;
  sortBy?: SortOption;

  // Options
  cityOptions?: string[];
  serviceOptions?: string[];

  // Category filter
  categoryFilter?: CategoryFilterValue;
  onChangeCategoryFilter?: (v: CategoryFilterValue) => void;

  // Visibility toggles
  showCategory?: boolean;
  showQuery?: boolean;
  showCity?: boolean;
  showService?: boolean;
  showLicensed?: boolean;
  showAvailability?: boolean;
  showSort?: boolean;

  // Callbacks
  onChangeQuery?: (q: string) => void;
  onChangeCity?: (c?: string) => void;
  onChangeService?: (s?: string) => void;
  onChangePriceRange: (r: [number, number]) => void;
  onChangeMinRating: (r: number) => void;
  onChangeLicensed?: (v: boolean) => void;
  onChangeAvailability?: (v: boolean) => void;
  onChangeSort?: (s: SortOption) => void;

  // Actions
  onReset?: () => void;
  onApply?: () => void;

  // Labels
  title?: string;
  description?: string;

  // Limits
  priceMin?: number;
  priceMax?: number;
  priceStep?: number;
}

export function FilterBar(props: FilterBarProps) {
  const {
    // values
    categoryFilter,
    onChangeCategoryFilter,
    showCategory = true,
    query = "",
    city,
    service,
    priceRange,
    minRating,
    licensedOnly = false,
    canStartWithin7 = false,
    sortBy = "relevance",

    // options
    cityOptions = [],
    serviceOptions = [],

    // visibility
    showQuery = true,
    showCity = true,
    showService = true,
    showLicensed = true,
    showAvailability = true,
    showSort = true,

    // callbacks
    onChangeQuery,
    onChangeCity,
    onChangeService,
    onChangePriceRange,
    onChangeMinRating,
    onChangeLicensed,
    onChangeAvailability,
    onChangeSort,

    // actions
    onReset,
    onApply,

    // labels
    title = "Filters",
    description,

    // limits
    priceMin = 0,
    priceMax = 100000,
    priceStep = 1000,
  } = props;

  const [mobileOpen, setMobileOpen] = useState(false);

  const Content = (
    <CardContent className="space-y-6">
      {showCategory && (
        <div>
          <Label>Service Category</Label>
          <div className="mt-1">
            <CategoryFilter
              value={categoryFilter ?? {}}
              onChange={(v) => onChangeCategoryFilter && onChangeCategoryFilter(v)}
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {showQuery && (
          <div className="md:col-span-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Name, service, tag…"
                value={query}
                onChange={(e) => onChangeQuery && onChangeQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}
        {showCity && (
          <div>
            <Label>City</Label>
            <Select value={city} onValueChange={(v) => onChangeCity && onChangeCity(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {showService && (
          <div>
            <Label>Service</Label>
            <Select value={service} onValueChange={(v) => onChangeService && onChangeService(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
          <Label>Price Range (₸)</Label>
          <div className="px-1 py-2">
            <Slider
              min={priceMin}
              max={priceMax}
              step={priceStep}
              value={priceRange}
              onValueChange={(v) => onChangePriceRange([v[0] as number, v[1] as number])}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            from {priceRange[0].toLocaleString()} ₸ to {priceRange[1].toLocaleString()} ₸
          </div>
        </div>
        <div>
          <Label>Min. Rating</Label>
          <div className="px-1 py-2">
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={[minRating]}
              onValueChange={(v) => onChangeMinRating(v[0] as number)}
            />
          </div>
          <div className="text-sm text-muted-foreground">{minRating.toFixed(1)}+</div>
        </div>
        <div className="flex gap-4">
          {showLicensed && (
            <div className="flex items-center space-x-2">
              <Checkbox id="licensed" checked={licensedOnly} onCheckedChange={(v) => onChangeLicensed && onChangeLicensed(Boolean(v))} />
              <Label htmlFor="licensed" className="cursor-pointer">
                Licensed only
              </Label>
            </div>
          )}
        </div>
      </div>

      {(showAvailability || showSort) && (
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-4">
            {showAvailability && (
              <div className="flex items-center space-x-2">
                <Checkbox id="start7" checked={canStartWithin7} onCheckedChange={(v) => onChangeAvailability && onChangeAvailability(Boolean(v))} />
                <Label htmlFor="start7" className="cursor-pointer flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Starts within 7 days
                </Label>
              </div>
            )}
            {showAvailability && <Separator orientation="vertical" className="h-6" />}
            {showSort && (
              <div className="w-48">
                <Label>Sort by</Label>
                <Select value={sortBy} onValueChange={(v) => onChangeSort && onChangeSort(v as SortOption)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price">Price: low to high</SelectItem>
                    <SelectItem value="requests">Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {onReset && (
              <Button variant="ghost" onClick={onReset} className="gap-1">
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
            {onApply && (
              <Button className="gap-1" onClick={onApply}>
                Apply
              </Button>
            )}
          </div>
        </div>
      )}
    </CardContent>
  );

  return (
    <div>
      {/* Desktop */}
      <Card className="hidden md:block shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {title}
          </CardTitle>
          {props.description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        {Content}
      </Card>

      {/* Mobile */}
      <div className="md:hidden">
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <div className="flex items-center justify-between mb-3">
            <Button size="sm" variant="secondary" className="gap-2" asChild>
              <DialogTrigger>
                <>
                  <Filter className="h-4 w-4" /> Filters
                </>
              </DialogTrigger>
            </Button>
          </div>
          <DialogContent className="max-w-[640px]">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Reuse same content inside dialog */}
              <Card className="border-0 shadow-none">
                {Content}
              </Card>
              <div className="flex justify-end gap-2">
                {onReset && (
                  <Button variant="ghost" onClick={onReset} className="gap-1">
                    <X className="h-4 w-4" />
                    Reset
                  </Button>
                )}
                <Button
                  onClick={() => {
                    onApply && onApply();
                    setMobileOpen(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


