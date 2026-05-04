"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { date: string; count: number }[];
}

export default function RechartsLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          interval={4}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          width={24}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}
          labelStyle={{ fontWeight: 600 }}
          cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 2" }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="Requests"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "#3b82f6", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
