"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, MapPin } from "lucide-react";

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
}

export default function RechartsOverviewCharts({ requestsByDay, categoryData, cityData }: Props) {
  const chartData = requestsByDay.map(d => ({
    date:     new Date(d.date).toLocaleDateString("ru", { day: "numeric", month: "short" }),
    requests: d.count,
    views:    d.count * 11,
  }));

  return (
    <div className="space-y-4">

      {/* Area chart + Donut side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

        {/* Area chart */}
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Просмотры и заявки
            </h3>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-400" /> Просмотры
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Заявки
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
              <Area type="monotone" dataKey="views" name="Просмотры"
                stroke="#3b82f6" strokeWidth={2} fill="url(#gViews)"
                dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="requests" name="Заявки"
                stroke="#10b981" strokeWidth={2} fill="url(#gReqs)"
                dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col">
          <h3 className="font-bold text-sm mb-3">Категории услуг</h3>
          {categoryData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Нет данных
            </div>
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

      {/* Bar chart — cities */}
      {cityData.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Заявки по городам
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
              <Bar dataKey="count" name="Заявки" radius={[6, 6, 0, 0]}>
                {cityData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
