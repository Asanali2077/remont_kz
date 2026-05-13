"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import { SERVICE_CATEGORY_LABELS } from "@/lib/types";
import {
  Briefcase, Zap, Wrench, Banknote,
  Eye, ClipboardList, CheckCircle2, Star,
  ArrowUpRight, ArrowDownRight, Download, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtNum } from "@/lib/utils";

const OverviewCharts = dynamic(() => import("./RechartsOverviewCharts"), { ssr: false });

type Period = "7d" | "30d" | "90d";

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
  const tCo = useTranslations("company");
  const tR = useTranslations("requests");
  const [stats, setStats]       = useState<CompanyStats | null>(null);
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [period, setPeriod]     = useState<Period>("30d");

  useEffect(() => {
    void Promise.all([
      api.getCompanyStats().then(setStats),
      api.getRequests({ scope: "all" }).then(setRequests),
    ]).catch(() => null).finally(() => setLoading(false));
  }, []);

  /* ── Period filtering ── */
  const PERIOD_DAYS: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const days = PERIOD_DAYS[period];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const filteredDays = (stats?.requestsByDay ?? []).filter(d => new Date(d.date) >= cutoff);
  const prevDays     = (stats?.requestsByDay ?? []).filter(d => {
    const t = new Date(d.date);
    const prev = new Date(cutoff);
    prev.setDate(prev.getDate() - days);
    return t >= prev && t < cutoff;
  });

  const totalReqs     = filteredDays.reduce((s, d) => s + d.count, 0);
  const prevTotalReqs = prevDays.reduce((s, d) => s + d.count, 0);
  const reqs_pct      = prevTotalReqs > 0 ? Math.round(((totalReqs - prevTotalReqs) / prevTotalReqs) * 100) : null;

  const filteredRequests = requests.filter(r => new Date(r.updatedAt) >= cutoff);

  /* ── Chart derived data ── */
  const cityMap: Record<string, number> = {};
  filteredRequests.forEach(r => { if (r.city) cityMap[r.city] = (cityMap[r.city] ?? 0) + 1; });
  const cityData = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([city, count]) => ({ city, count }));

  const catMap: Record<string, number> = {};
  filteredRequests.forEach(r => { if (r.category) catMap[r.category] = (catMap[r.category] ?? 0) + 1; });
  const categoryData = Object.entries(catMap).map(([cat, value]) => ({
    name: SERVICE_CATEGORY_LABELS[cat as keyof typeof SERVICE_CATEGORY_LABELS] ?? cat, value,
  }));

  /* ── Funnel data ── */
  const views     = totalReqs * 11;
  const accepted  = filteredRequests.filter(r => ["accepted","in_progress","completed"].includes(r.status)).length;
  const completed = filteredRequests.filter(r => r.status === "completed").length;
  const funnelData = [
    { label: "Views",     value: views,     pct: 100 },
    { label: "Requests",  value: totalReqs, pct: views > 0 ? Math.round((totalReqs / views) * 100) : 0 },
    { label: "Accepted",  value: accepted,  pct: totalReqs > 0 ? Math.round((accepted / totalReqs) * 100) : 0 },
    { label: "Completed", value: completed, pct: accepted > 0 ? Math.round((completed / accepted) * 100) : 0 },
  ];

  /* ── Top services ── */
  const svcMap: Record<string, number> = {};
  filteredRequests.forEach(r => {
    const name = r.service?.name ?? "Custom request";
    svcMap[name] = (svcMap[name] ?? 0) + 1;
  });
  const topServices = Object.entries(svcMap).sort(([,a],[,b]) => b - a).slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  /* ── Monthly requests ── */
  const monthMap: Record<string, number> = {};
  (stats?.requestsByDay ?? []).forEach(d => {
    const m = new Date(d.date).toLocaleDateString("en", { month: "short" });
    monthMap[m] = (monthMap[m] ?? 0) + d.count;
  });
  const monthlyData = Object.entries(monthMap).map(([month, requests]) => ({ month, requests }));

  /* ── Sparkline data per card (daily counts, filtered) ── */
  const sparkline = filteredDays.map(d => ({ v: d.count }));

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-14 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
        </div>
        <div className="h-72 bg-muted rounded-2xl" />
      </div>
    );
  }

  const today   = new Date();
  const dateStr = today.toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" });

  const BIG_STATS = [
    { icon: Briefcase, iconColor: "text-blue-500",   iconBg: "bg-blue-100 dark:bg-blue-950/50",
      value: stats?.totalServices ?? 0, label: tCo("totalServices"),
      bg: "from-blue-500/10 to-blue-600/5", border: "border-blue-200/60 dark:border-blue-800/50",
      tab: "services", isRevenue: false, trend: null, spark: [] },
    { icon: Zap,       iconColor: "text-amber-500",  iconBg: "bg-amber-100 dark:bg-amber-950/50",
      value: totalReqs, label: tCo("requests"),
      bg: "from-amber-500/10 to-amber-600/5", border: "border-amber-200/60 dark:border-amber-800/50",
      tab: "requests", isRevenue: false,
      trend: reqs_pct, spark: sparkline },
    { icon: Wrench,    iconColor: "text-violet-500", iconBg: "bg-violet-100 dark:bg-violet-950/50",
      value: stats?.byStatus.in_progress ?? 0, label: tCo("inProgress"),
      bg: "from-violet-500/10 to-violet-600/5", border: "border-violet-200/60 dark:border-violet-800/50",
      tab: "requests", isRevenue: false, trend: null, spark: sparkline },
    { icon: Banknote,  iconColor: "text-emerald-500",iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
      value: stats?.revenue ?? 0, label: tCo("stats.revenue"),
      bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-200/60 dark:border-emerald-800/50",
      tab: "overview", isRevenue: true, trend: null, spark: sparkline },
  ];

  const SMALL_STATS = [
    { icon: Eye,          iconColor: "text-blue-500",    value: fmtNum(totalReqs * 11), label: tCo("viewsPerPeriod") },
    { icon: ClipboardList,iconColor: "text-violet-500",  value: fmtNum(totalReqs),      label: tCo("requestsPerPeriod", { period }) },
    { icon: CheckCircle2, iconColor: "text-emerald-500", value: fmtNum(completed),      label: tR("status.completed") },
    { icon: Star,         iconColor: "text-amber-500",   value: stats?.avgRating?.toFixed(1) ?? "—", label: tCo("avgRating") },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">{tCo("goodDay", { name: user?.name ?? tCo("overview") })}</h2>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Period selector */}
          <div className="flex rounded-xl border border-border/50 bg-muted/30 p-0.5 text-sm">
            {(["7d","30d","90d"] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  period === p ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-2 h-9"
            onClick={() => window.open("/api/company/export", "_blank")}>
            <Download className="h-3.5 w-3.5" /> {tCo("export")}
          </Button>
          <Button size="sm" className="rounded-xl gap-2 h-9 shadow-sm shadow-primary/20"
            onClick={() => onNavigate("services")}>
            <Plus className="h-4 w-4" /> {tCo("addService")}
          </Button>
        </div>
      </div>

      {/* ── Big stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {BIG_STATS.map(({ icon: Icon, iconColor, iconBg, value, label, trend, bg, border, tab, isRevenue, spark }) => (
          <button key={label} onClick={() => onNavigate(tab)}
            className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-2`}>
            <div className="flex items-start justify-between">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              {trend !== null && (
                <span className={`text-[11px] font-bold flex items-center gap-0.5 ${
                  trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                }`}>
                  {trend >= 0
                    ? <ArrowUpRight className="h-3 w-3" />
                    : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
            <div>
              <p className="text-2xl font-black leading-none">
                {isRevenue
                  ? (typeof value === "number" && value > 0 ? `${(value / 1_000_000).toFixed(1)}M ₸` : "—")
                  : (typeof value === "number" ? fmtNum(value) : value)}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
            </div>
            {/* Sparkline */}
            {spark.length > 1 && (
              <Sparkline data={spark} color={iconColor.replace("text-","").split("-")[0]} />
            )}
          </button>
        ))}
      </div>

      {/* ── Small stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SMALL_STATS.map(({ icon: Icon, iconColor, value, label }) => (
          <div key={label} className="bg-card border border-border/50 rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
            <div className="min-w-0">
              <p className="text-lg font-black leading-none">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      {stats && (
        <OverviewCharts
          requestsByDay={filteredDays}
          categoryData={categoryData}
          cityData={cityData}
          funnelData={funnelData}
          topServices={topServices}
          monthlyData={monthlyData}
          allDays={stats.requestsByDay}
          period={period}
          byStatus={stats.byStatus}
        />
      )}
    </div>
  );
}

/* ── Inline SVG sparkline ── */
function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const w = 100, h = 28;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.v / max) * h;
    return `${x},${y}`;
  }).join(" ");
  const COLOR_MAP: Record<string, string> = {
    blue: "#3b82f6", amber: "#f59e0b", violet: "#8b5cf6", emerald: "#10b981",
  };
  const stroke = COLOR_MAP[color] ?? "#3b82f6";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
    </svg>
  );
}
