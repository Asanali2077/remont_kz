"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type TopCategory,
  getCategoryGroups,
  getSubcategories,
} from "@/lib/categories";
import { useTranslations } from "next-intl";

export interface CategoryFilterValue {
  category?: TopCategory;
  group?: string;
  subcategory?: string;
}

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  /** Show "All categories" placeholder (default true) */
  showAll?: boolean;
}

export function CategoryFilter({ value, onChange, showAll = true }: CategoryFilterProps) {
  const t = useTranslations("categoryFilter");

  const groups = value.category ? getCategoryGroups(value.category) : [];
  const subcategories =
    value.category && value.group ? getSubcategories(value.category, value.group) : [];

  function tGroup(g: string): string {
    try { return t(`groups.${g}`); } catch { return g; }
  }

  function tSub(s: string): string {
    try { return t(`subcategories.${s}`); } catch { return s; }
  }

  function handleCategoryChange(cat: string) {
    if (cat === "__all__") {
      onChange({ category: undefined, group: undefined, subcategory: undefined });
    } else {
      onChange({ category: cat as TopCategory, group: undefined, subcategory: undefined });
    }
  }

  function handleGroupChange(group: string) {
    if (group === "__all__") {
      onChange({ ...value, group: undefined, subcategory: undefined });
    } else {
      onChange({ ...value, group, subcategory: undefined });
    }
  }

  function handleSubcategoryChange(sub: string) {
    if (sub === "__all__") {
      onChange({ ...value, subcategory: undefined });
    } else {
      onChange({ ...value, subcategory: sub });
    }
  }

  const topCategories: TopCategory[] = ["AUTOMOBILES", "REAL_ESTATE", "OTHER"];

  return (
    <div className="flex flex-col gap-2">
      {/* Level 1: Top category */}
      <Select
        value={value.category ?? "__all__"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("allCategories")} />
        </SelectTrigger>
        <SelectContent>
          {showAll && <SelectItem value="__all__">{t("allCategories")}</SelectItem>}
          {topCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {t(`topLabels.${cat}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Level 2: Group (appears after category selected) */}
      {value.category && groups.length > 0 && (
        <Select
          value={value.group ?? "__all__"}
          onValueChange={handleGroupChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("allSections")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("allSections")}</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g} value={g}>
                {tGroup(g)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Level 3: Subcategory (appears after group selected) */}
      {value.category && value.group && subcategories.length > 0 && (
        <Select
          value={value.subcategory ?? "__all__"}
          onValueChange={handleSubcategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("allTypes")}</SelectItem>
            {subcategories.map((s) => (
              <SelectItem key={s} value={s}>
                {tSub(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
