"use client";

import { KZ_CITIES } from "@/lib/cities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CitySelectProps {
  value: string;
  onChange: (city: string) => void;
  allowAny?: boolean;
}

const ANY = "__any__";

export function CitySelect({ value, onChange, allowAny = false }: CitySelectProps) {
  return (
    <Select value={value || (allowAny ? ANY : "")} onValueChange={(v) => onChange(v === ANY ? "" : v)}>
      <SelectTrigger>
        <SelectValue placeholder={allowAny ? "Any city" : "Select city"} />
      </SelectTrigger>
      <SelectContent>
        {allowAny && <SelectItem value={ANY}>Any city</SelectItem>}
        {KZ_CITIES.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
