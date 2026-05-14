"use client";

import { KZ_CITIES } from "@/lib/cities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface CitySelectProps {
  value: string;
  onChange: (city: string) => void;
  allowAny?: boolean;
}

const ANY = "__any__";

export function CitySelect({ value, onChange, allowAny = false }: CitySelectProps) {
  const t = useTranslations("citySelect");

  function tCity(city: string): string {
    try { return t(`cities.${city}`); } catch { return city; }
  }

  return (
    <Select value={value || (allowAny ? ANY : "")} onValueChange={(v) => onChange(v === ANY ? "" : v)}>
      <SelectTrigger>
        <SelectValue placeholder={allowAny ? t("anyCity") : t("selectCity")} />
      </SelectTrigger>
      <SelectContent>
        {allowAny && <SelectItem value={ANY}>{t("anyCity")}</SelectItem>}
        {KZ_CITIES.map((city) => (
          <SelectItem key={city} value={city}>
            {tCity(city)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
