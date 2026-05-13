"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, MapPin, Layers, Award } from "lucide-react";

const DONUT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899"];
const BAR_COLORS   = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 10,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
};

interface Props {
  requestsByDay: { date: string; count: number }[];
  categoryData:  { name: string; value: number }[];
  cityData:      { city: string; count: number }[];
  funnelData:    { label: string; value: number; pct: number }[];
  topServices:   { name: string; count: number }[];
  monthlyData:   { month: string; requests: number }[];
  allDays:       { date: string; count: number }[];
  period:        "7d" | "30d" | "90d";
  byStatus:      { new: number; accepted: number; in_progress: number; completed: number };
}

export default function RechartsOverviewCharts({
  requestsByDay, categoryData, cityData,
  funnelData, topServices, monthlyData, allDays, byStatus,
}: Props) {
  const chartData = requestsByDay.map(d => ({
    date:     new Date(d.date).toLocaleDateString("en", { day: "numeric", month: "short" }),
    requests: d.count,
    views:    d.count * 11,
  }));

  /* ── Heatmap: last 91 days (13 weeks × 7 days) ── */
  const heatmapDays = 91;
  const heatmapEnd  = new Date();
  heatmapEnd.setHours(0, 0, 0, 0);
  const heatmapStart = new Date(heatmapEnd);
  heatmapStart.setDate(heatmapStart.getDate() - heatmapDays + 1);

  const dayCountMap: Record<string, number> = {};
  allDays.forEach(d => { dayCountMap[d.date.slice(0, 10)] = d.count; });

  const heatCells: { key: string; count: number; date: Date }[] = [];
  for (let i = 0; i < heatmapDays; i++) {
    const d = new Date(heatmapStart);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    heatCells.push({ key, count: dayCountMap[key] ?? 0, date: d });
  }
  const heatMax = Math.max(...heatCells.map(c => c.count), 1);

  function heatColor(count: number) {
    if (count === 0) return "bg-muted/60";
    const ratio = count / heatMax;
    if (ratio < 0.25) return "bg-emerald-200 dark:bg-emerald-900/60";
    if (ratio < 0.5)  return "bg-emerald-300 dark:bg-emerald-700/70";
    if (ratio < 0.75) return "bg-emerald-400 dark:bg-emerald-600/80";
    return "bg-emerald-500 dark:bg-emerald-500";
  }

  /* week labels */
  const weekLabels: string[] = [];
  for (let w = 0; w < 13; w++) {
    const d = new Date(heatmapStart);
    d.setDate(d.getDate() + w * 7);
    weekLabels.push(d.toLocaleDateString("en", { month: "short", day: "numeric" }));
  }

  const funnelMax = funnelData[0]?.value ?? 1;

  const statusData = [
    { name: "New",         value: byStatus.new,         color: "#3b82f6" },
    { name: "Accepted",    value: byStatus.accepted,     color: "#f59e0b" },
    { name: "In progress", value: byStatus.in_progress,  color: "#8b5cf6" },
    { name: "Completed",   value: byStatus.completed,    color: "#10b981" },
  ].filter(s => s.value > 0);
  const statusTotal = statusData.reduce((a, s) => a + s.value, 0);

  return (
    <div className="space-y-4">

      {/* ── Area chart + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Views & Requests
            </h3>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-400" /> Views
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Requests
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gReqs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                interval={4} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="views" name="Views"
                stroke="#3b82f6" strokeWidth={2} fill="url(#gViews)"
                dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="requests" name="Requests"
                stroke="#10b981" strokeWidth={2} fill="url(#gReqs)"
                dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col">
          <h3 className="font-bold text-sm mb-3">Service categories</h3>
          {categoryData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={78}
                    dataKey="value" paddingAngle={2} strokeWidth={0}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
                {categoryData.map((item, i) => (
                  <span key={item.name} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    {item.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Conversion funnel + Top services ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Funnel */}
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Conversion funnel
          </h3>
          <div className="space-y-3">
            {funnelData.map((step, i) => {
              const barW = funnelMax > 0 ? (step.value / funnelMax) * 100 : 0;
              const colors = ["bg-blue-500", "bg-amber-500", "bg-violet-500", "bg-emerald-500"];
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{step.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {step.value.toLocaleString()}
                      {i > 0 && (
                        <span className="ml-1.5 text-[10px] font-bold">{step.pct}%</span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[i]} transition-all duration-500`}
                      style={{ width: `${barW}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top services */}
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" /> Top services
          </h3>
          {topServices.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground h-24">No data</div>
          ) : (
            <div className="space-y-2.5">
              {topServices.map((svc, i) => {
                const maxCount = topServices[0]?.count ?? 1;
                const barW = (svc.count / maxCount) * 100;
                return (
                  <div key={svc.name} className="flex items-center gap-2.5">
                    <span className="text-[11px] font-black text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium truncate">{svc.name}</span>
                        <span className="text-muted-foreground ml-2 shrink-0">{svc.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Monthly requests bar + Status breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Monthly */}
        {monthlyData.length > 0 && (
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Monthly requests
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 8, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"
                  strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="requests" name="Requests" radius={[6, 6, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status breakdown donut */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col">
          <h3 className="font-bold text-sm mb-3">Request statuses</h3>
          {statusTotal === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={78}
                    dataKey="value" paddingAngle={2} strokeWidth={0}>
                    {statusData.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {statusData.map(s => {
                  const pct = statusTotal > 0 ? Math.round((s.value / statusTotal) * 100) : 0;
                  return (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-xs text-muted-foreground flex-1">{s.name}</span>
                      <span className="text-xs font-bold tabular-nums">{s.value}</span>
                      <span className="text-[11px] text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── City bar ── */}
      {cityData.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Requests by city
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cityData} margin={{ top: 5, right: 8, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"
                strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="city" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false} tickLine={false} width={24} allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Requests" radius={[6, 6, 0, 0]}>
                {cityData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Activity heatmap ── */}
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Activity — last 13 weeks
        </h3>
        <div className="overflow-x-auto">
          <div className="min-w-[520px]">
            {/* Week labels */}
            <div className="grid gap-[3px] mb-1" style={{ gridTemplateColumns: `repeat(13, 1fr)` }}>
              {weekLabels.map((label, i) => (
                <div key={i} className="text-[9px] text-muted-foreground truncate">{label}</div>
              ))}
            </div>
            {/* 13 cols × 7 rows — grid-flow-col fills column by column */}
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(13, 1fr)`, gridTemplateRows: `repeat(7, 1fr)`, gridAutoFlow: "column" }}>
              {heatCells.map(cell => (
                <div
                  key={cell.key}
                  title={`${cell.date.toLocaleDateString("en", { month: "short", day: "numeric" })}: ${cell.count} requests`}
                  className={`rounded-[3px] aspect-square ${heatColor(cell.count)}`}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-2 justify-end">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {["bg-muted/60","bg-emerald-200 dark:bg-emerald-900/60","bg-emerald-300 dark:bg-emerald-700/70","bg-emerald-400 dark:bg-emerald-600/80","bg-emerald-500"].map((cls, i) => (
                <div key={i} className={`h-3 w-3 rounded-[3px] ${cls}`} />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
