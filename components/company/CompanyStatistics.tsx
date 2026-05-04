"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Briefcase, ClipboardList, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";

/* Recharts loaded client-only to avoid SSR issues */
const RechartsLine = dynamic(() => import("./RechartsLineChart"), { ssr: false });

interface CompanyStats {
  totalServices: number;
  totalRequests: number;
  byStatus: { new: number; accepted: number; in_progress: number; completed: number };
  avgRating: number | null;
  revenue: number;
  requestsByDay: { date: string; count: number }[];
}

export function CompanyStatistics() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api.getCompanyStats();
        setStats(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load statistics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-foreground animate-pulse">
        Loading statistics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-16 text-center text-muted-foreground">No statistics available.</div>
    );
  }

  const topCards = [
    { label: "Total Services", value: stats.totalServices, icon: Briefcase, color: "text-blue-600 dark:text-blue-400" },
    { label: "Total Requests", value: stats.totalRequests, icon: ClipboardList, color: "text-violet-600 dark:text-violet-400" },
    { label: "Avg Rating", value: stats.avgRating !== null ? `${stats.avgRating.toFixed(1)} ★` : "—", icon: Star, color: "text-yellow-500" },
    { label: "Revenue (₸)", value: stats.revenue > 0 ? stats.revenue.toLocaleString("ru-RU") : "—", icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
  ];

  const statusRows = [
    { label: "New", value: stats.byStatus.new, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    { label: "Accepted", value: stats.byStatus.accepted, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
    { label: "In Progress", value: stats.byStatus.in_progress, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
    { label: "Completed", value: stats.byStatus.completed, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  ];

  /* Format dates for chart */
  const chartData = stats.requestsByDay.map(({ date, count }) => ({
    date: new Date(date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" }),
    count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Statistics</h2>
        <p className="text-muted-foreground text-sm">Overview of your company performance</p>
      </div>

      {/* Top metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusRows.map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-xs font-medium mt-1 opacity-80">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests over time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <RechartsLine data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
