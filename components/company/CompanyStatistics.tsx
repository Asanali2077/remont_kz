"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Briefcase, ClipboardList, Star, TrendingUp, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";

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
  const t = useTranslations("company");
  const tCommon = useTranslations("common");
  const tReq = useTranslations("requests");
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
        {tCommon("loading")}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-16 text-center text-muted-foreground">{tCommon("noData")}</div>
    );
  }

  const topCards = [
    { label: t("stats.services"), value: stats.totalServices, icon: Briefcase, color: "text-blue-600 dark:text-blue-400" },
    { label: t("stats.totalRequests"), value: stats.totalRequests, icon: ClipboardList, color: "text-violet-600 dark:text-violet-400" },
    { label: t("stats.rating"), value: stats.avgRating !== null ? `${stats.avgRating.toFixed(1)} ★` : "—", icon: Star, color: "text-yellow-500" },
    { label: t("stats.revenue"), value: stats.revenue > 0 ? stats.revenue.toLocaleString("ru-RU") : "—", icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
  ];

  const statusRows = [
    { label: tReq("status.new"), value: stats.byStatus.new, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    { label: tReq("status.accepted"), value: stats.byStatus.accepted, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
    { label: tReq("status.in_progress"), value: stats.byStatus.in_progress, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
    { label: tReq("status.completed"), value: stats.byStatus.completed, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  ];

  /* Format dates for chart */
  const chartData = stats.requestsByDay.map(({ date, count }) => ({
    date: new Date(date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" }),
    count,
  }));

  function handlePrintReport() {
    if (!stats) return;
    const now = new Date().toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" });
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Remont.kz — Company Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 32px; color: #111; }
    h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 15px; margin: 24px 0 12px; color: #555; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    .meta { color: #888; font-size: 12px; margin-bottom: 28px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; }
    .card-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .card-value { font-size: 24px; font-weight: 800; }
    .status-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .status-card { border-radius: 8px; padding: 14px; text-align: center; }
    .status-value { font-size: 28px; font-weight: 800; }
    .status-label { font-size: 11px; margin-top: 3px; }
    .chart-row { display: flex; align-items: flex-end; gap: 3px; height: 80px; margin-bottom: 4px; }
    .bar { background: #6366f1; border-radius: 3px 3px 0 0; flex: 1; min-width: 4px; }
    .bar-label { font-size: 9px; color: #888; text-align: center; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    td, th { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; text-align: left; }
    th { font-weight: 600; color: #555; }
    .footer { margin-top: 36px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    @media print { @page { margin: 20mm; } }
  </style>
</head>
<body>
  <h1>Company Performance Report</h1>
  <p class="meta">Generated by Remont.kz · ${now}</p>

  <h2>Key Metrics</h2>
  <div class="grid">
    <div class="card"><div class="card-label">Services</div><div class="card-value">${stats.totalServices}</div></div>
    <div class="card"><div class="card-label">Total Requests</div><div class="card-value">${stats.totalRequests}</div></div>
    <div class="card"><div class="card-label">Avg Rating</div><div class="card-value">${stats.avgRating !== null ? stats.avgRating.toFixed(1) + " ★" : "—"}</div></div>
    <div class="card"><div class="card-label">Est. Revenue</div><div class="card-value">${stats.revenue > 0 ? (stats.revenue / 1000).toFixed(0) + "K ₸" : "—"}</div></div>
  </div>

  <h2>Requests by Status</h2>
  <div class="status-grid">
    <div class="status-card" style="background:#eff6ff;"><div class="status-value" style="color:#2563eb;">${stats.byStatus.new}</div><div class="status-label" style="color:#2563eb;">New</div></div>
    <div class="status-card" style="background:#fefce8;"><div class="status-value" style="color:#d97706;">${stats.byStatus.accepted}</div><div class="status-label" style="color:#d97706;">Accepted</div></div>
    <div class="status-card" style="background:#fff7ed;"><div class="status-value" style="color:#ea580c;">${stats.byStatus.in_progress}</div><div class="status-label" style="color:#ea580c;">In Progress</div></div>
    <div class="status-card" style="background:#f0fdf4;"><div class="status-value" style="color:#16a34a;">${stats.byStatus.completed}</div><div class="status-label" style="color:#16a34a;">Completed</div></div>
  </div>

  <h2>Activity — Last 30 Days</h2>
  ${(() => {
    const max = Math.max(...chartData.map(d => d.count), 1);
    const bars = chartData.map(d => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;"><div class="bar" style="height:${Math.round((d.count / max) * 76)}px"></div><div class="bar-label">${d.date}</div></div>`).join("");
    return `<div class="chart-row">${bars}</div>`;
  })()}

  <h2>Daily Breakdown</h2>
  <table>
    <thead><tr><th>Date</th><th>Requests</th></tr></thead>
    <tbody>${chartData.filter(d => d.count > 0).map(d => `<tr><td>${d.date}</td><td>${d.count}</td></tr>`).join("")}</tbody>
  </table>

  <div class="footer">Remont.kz — Kazakhstan Repair Services Marketplace · Confidential</div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;
    const win = window.open("", "_blank", "width=900,height=700");
    if (win) { win.document.write(html); win.document.close(); }
    else toast.error("Allow popups to export the report");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t("statistics")}</h2>
          <p className="text-muted-foreground text-sm">{t("stats.totalRequests")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 shrink-0" onClick={handlePrintReport}>
            <Download className="h-4 w-4" /> Quick PDF
          </Button>
          <Link href="/company/report">
            <Button size="sm" className="rounded-xl gap-2 shrink-0">
              <FileText className="h-4 w-4" /> Full Report
            </Button>
          </Link>
        </div>
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
          <CardTitle className="text-base">{t("requests")}</CardTitle>
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
