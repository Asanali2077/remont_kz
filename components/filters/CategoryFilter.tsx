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
  TOP_CATEGORY_LABELS,
  getCategoryGroups,
  getSubcategories,
} from "@/lib/categories";

export interface CategoryFilterValue {
  category?: TopCategory;
  group?: string;
  subcategory?: string;
}

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  /** Показывать ли плейсхолдер «Все категории» (по умолчанию true) */
  showAll?: boolean;
}

export function CategoryFilter({ value, onChange, showAll = true }: CategoryFilterProps) {
  const groups = value.category ? getCategoryGroups(value.category) : [];
  const subcategories =
    value.category && value.group ? getSubcategories(value.category, value.group) : [];

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

  return (
    <div className="flex flex-col gap-2">
      {/* Уровень 1: Категория */}
      <Select
        value={value.category ?? "__all__"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {showAll && <SelectItem value="__all__">All categories</SelectItem>}
          {(Object.keys(TOP_CATEGORY_LABELS) as TopCategory[]).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {TOP_CATEGORY_LABELS[cat]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Уровень 2: Группа (появляется после выбора категории) */}
      {value.category && groups.length > 0 && (
        <Select
          value={value.group ?? "__all__"}
          onValueChange={handleGroupChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All sections</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Уровень 3: Подкатегория (появляется после выбора группы) */}
      {value.category && value.group && subcategories.length > 0 && (
        <Select
          value={value.subcategory ?? "__all__"}
          onValueChange={handleSubcategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All types</SelectItem>
            {subcategories.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
