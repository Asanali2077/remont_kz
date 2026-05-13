"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, ResponsiveContainer, Tooltip,
} from "recharts";
import type { ServiceRecord } from "@/lib/types";

const COLORS = ["#6366f1", "#f59e0b", "#10b981"];

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 75;
  return Math.round(((value - min) / (max - min)) * 100);
}

function shortName(s: ServiceRecord): string {
  return s.name.length > 18 ? s.name.slice(0, 16) + "…" : s.name;
}

export default function CompareRadar({ services }: { services: ServiceRecord[] }) {
  const prices = services.map(s => s.priceFrom ?? 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const keys = services.map(shortName);

  const data = [
    {
      metric: "Rating",
      fullMark: 100,
      ...Object.fromEntries(services.map((s, i) => [keys[i], Math.round((s.rating ?? 0) * 20)])),
    },
    {
      metric: "Price value",
      fullMark: 100,
      ...Object.fromEntries(services.map((s, i) => [keys[i], 100 - normalize(s.priceFrom ?? 0, minPrice, maxPrice)])),
    },
    {
      metric: "Photos",
      fullMark: 100,
      ...Object.fromEntries(services.map((s, i) => [keys[i], Math.min(s.images.length * 25, 100)])),
    },
    {
      metric: "Availability",
      fullMark: 100,
      ...Object.fromEntries(services.map((s, i) => [keys[i], (!s.startDate && !s.endDate) ? 100 : 55])),
    },
    {
      metric: "Active",
      fullMark: 100,
      ...Object.fromEntries(services.map((s, i) => [keys[i], s.active ? 100 : 30])),
    },
  ];

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 mt-4">
      <h3 className="font-bold text-base mb-0.5">Visual Comparison</h3>
      <p className="text-xs text-muted-foreground mb-5">Score across key criteria (0–100 scale)</p>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={18} domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickCount={4} axisLine={false}
          />
          {keys.map((key, i) => (
            <Radar
              key={key} name={key} dataKey={key}
              stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]}
              fillOpacity={0.15} strokeWidth={2} dot={{ r: 3 }}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            formatter={(value) => <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>{value}</span>}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value ?? 0}/100`]}
            contentStyle={{
              background: "hsl(var(--card))", border: "1px solid hsl(var(--border))",
              borderRadius: "8px", fontSize: "12px",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
