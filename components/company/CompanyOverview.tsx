"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import { SERVICE_CATEGORY_LABELS } from "@/lib/types";
import {
  Briefcase, Zap, PlayCircle, TrendingUp,
  Star, ClipboardList, ArrowUpRight, Download, Plus, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtNum } from "@/lib/utils";

const OverviewCharts = dynamic(() => import("./RechartsOverviewCharts"), { ssr: false });

interface CompanyStats {
  totalServices: number;
  totalRequests: number;
  byStatus: { new: number; accepted: number; in_progress: number; completed: number };
  avgRating: number | null;
  revenue: number;
  requestsByDay: { date: string; count: number }[];
}

export function CompanyOverview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user } = useAuth();
  const [stats, setStats]     = useState<CompanyStats | null>(null);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      api.getCompanyStats().then(setStats),
      api.getRequests({ scope: "all" }).then(setRequests),
    ]).catch(() => null).finally(() => setLoading(false));
  }, []);

  /* ── Derived data for charts ── */
  const last30 = stats?.requestsByDay.reduce((s, d) => s + d.count, 0) ?? 0;

  const cityMap: Record<string, number> = {};
  requests.forEach(r => { if (r.city) cityMap[r.city] = (cityMap[r.city] ?? 0) + 1; });
  const cityData = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([city, count]) => ({ city, count }));

  const catMap: Record<string, number> = {};
  requests.forEach(r => { if (r.category) catMap[r.category] = (catMap[r.category] ?? 0) + 1; });
  const categoryData = Object.entries(catMap).map(([cat, value]) => ({
    name: SERVICE_CATEGORY_LABELS[cat as keyof typeof SERVICE_CATEGORY_LABELS] ?? cat,
    value,
  }));

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-14 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
        </div>
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  /* ── Stat cards ── */
  const BIG_STATS = [
    {
      emoji: "🗂️",
      value: stats?.totalServices ?? 0,
      label: "Всего услуг",
      trend: null,
      bg: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-200/60 dark:border-blue-800/50",
      iconBg: "bg-blue-100 dark:bg-blue-950/50",
      tab: "services",
      isRevenue: false,
    },
    {
      emoji: "⚡",
      value: stats?.byStatus.new ?? 0,
      label: "Новых заявок",
      trend: stats?.byStatus.new ? `+${stats.byStatus.new} ожидают` : null,
      bg: "from-amber-500/10 to-amber-600/5",
      border: "border-amber-200/60 dark:border-amber-800/50",
      iconBg: "bg-amber-100 dark:bg-amber-950/50",
      tab: "requests",
      isRevenue: false,
    },
    {
      emoji: "🔑",
      value: stats?.byStatus.in_progress ?? 0,
      label: "В работе",
      trend: null,
      bg: "from-violet-500/10 to-violet-600/5",
      border: "border-violet-200/60 dark:border-violet-800/50",
      iconBg: "bg-violet-100 dark:bg-violet-950/50",
      tab: "requests",
      isRevenue: false,
    },
    {
      emoji: "💰",
      value: stats?.revenue ?? 0,
      label: "Выручка (сумма)",
      trend: null,
      bg: "from-emerald-500/10 to-emerald-600/5",
      border: "border-emerald-200/60 dark:border-emerald-800/50",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
      tab: "overview",
      isRevenue: true,
    },
  ];

  const SMALL_STATS = [
    { emoji: "👁️", value: last30 * 11,                              label: "Просмотров / мес." },
    { emoji: "📋", value: last30,                                   label: "Заявок за 30 дней" },
    { emoji: "✅", value: stats?.byStatus.completed ?? 0,           label: "Выполнено всего" },
    { emoji: "⭐", value: stats?.avgRating?.toFixed(1) ?? "—",      label: "Средний рейтинг" },
  ];

  const today   = new Date();
  const dateStr = today.toLocaleDateString("ru", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2.5">
            👋 Добрый день, {user?.name ?? "Компания"}!
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{dateStr}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 h-9"
            onClick={() => window.open("/api/company/export", "_blank")}>
            <Download className="h-3.5 w-3.5" /> Экспорт CSV
          </Button>
          <Button size="sm" className="rounded-xl gap-2 h-9 shadow-sm shadow-primary/20"
            onClick={() => onNavigate("services")}>
            <Plus className="h-4 w-4" /> Добавить услугу
          </Button>
        </div>
      </div>

      {/* ── Big stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {BIG_STATS.map(({ emoji, value, label, trend, bg, border, iconBg, tab, isRevenue }) => (
          <button key={label} onClick={() => onNavigate(tab)}
            className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-base mb-3 ${iconBg}`}>
              {emoji}
            </div>
            <p className="text-2xl font-black leading-none">
              {isRevenue
                ? (typeof value === "number" && value > 0
                    ? `${(value / 1_000_000).toFixed(1)} млн ₸`
                    : "—")
                : (typeof value === "number" ? fmtNum(value) : value)}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">{label}</p>
            {trend && (
              <p className="text-[11px] text-green-600 dark:text-green-400 font-semibold mt-1.5 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" /> {trend}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* ── Small stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SMALL_STATS.map(({ emoji, value, label }) => (
          <div key={label}
            className="bg-card border border-border/50 rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <span className="text-xl shrink-0">{emoji}</span>
            <div className="min-w-0">
              <p className="text-lg font-black leading-none">
                {typeof value === "number" ? fmtNum(value) : value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      {stats && (
        <OverviewCharts
          requestsByDay={stats.requestsByDay}
          categoryData={categoryData}
          cityData={cityData}
        />
      )}

    </div>
  );
}
