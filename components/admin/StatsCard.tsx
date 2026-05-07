import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "default" | "blue" | "green" | "red" | "amber";
  sub?: string;
}

const colorMap = {
  default: "bg-muted text-foreground",
  blue: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  green: "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400",
  red: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400",
  amber: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
};

const iconMap = {
  default: "text-muted-foreground",
  blue: "text-blue-500",
  green: "text-green-500",
  red: "text-red-500",
  amber: "text-amber-500",
};

export function StatsCard({ label, value, icon: Icon, color = "default", sub }: StatsCardProps) {
  return (
    <div className={cn("rounded-xl border p-4 flex items-start gap-4", colorMap[color])}>
      <div className={cn("mt-0.5", iconMap[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium opacity-70 truncate">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
