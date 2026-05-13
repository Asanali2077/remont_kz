"use client";

import { useEffect, useState } from "react";
import { Printer, ArrowLeft, TrendingUp, CheckCircle2, Clock, Star, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import { fmtNum } from "@/lib/utils";

interface Stats {
  total: number;
  completed: number;
  active: number;
  cancelled: number;
  avgRating: number | null;
  revenue: number;
}

function calcStats(reqs: RequestRecord[]): Stats {
  const completed = reqs.filter(r => r.status === "completed");
  const active = reqs.filter(r => ["accepted", "in_progress"].includes(r.status));
  const cancelled = reqs.filter(r => r.status === "cancelled");
  const ratings = completed.filter(r => r.rating != null).map(r => r.rating!);
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const revenue = completed.reduce((sum, r) => sum + ((r.budgetFrom ?? 0) + (r.budgetTo ?? r.budgetFrom ?? 0)) / 2, 0);
  return { total: reqs.length, completed: completed.length, active: active.length, cancelled: cancelled.length, avgRating, revenue };
}


export default function CompanyReportPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"month" | "quarter" | "year" | "all">("month");
  const now = new Date();

  useEffect(() => {
    api.getRequests({ scope: "assigned" })
      .then(setRequests)
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
  }, []);

  function filterByPeriod(reqs: RequestRecord[]) {
    if (period === "all") return reqs;
    const cutoff = new Date(now);
    if (period === "month")   cutoff.setMonth(now.getMonth() - 1);
    if (period === "quarter") cutoff.setMonth(now.getMonth() - 3);
    if (period === "year")    cutoff.setFullYear(now.getFullYear() - 1);
    return reqs.filter(r => new Date(r.createdAt) >= cutoff);
  }

  const filteredReqs = filterByPeriod(requests);
  const stats = calcStats(filteredReqs);
  const completed = filteredReqs.filter(r => r.status === "completed");

  const PERIOD_LABELS = { month: "За месяц", quarter: "За квартал", year: "За год", all: "За всё время" };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 print:bg-white">
      {/* Toolbar */}
      <div className="print:hidden sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-border/40 px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/company/dashboard?tab=overview">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Дашборд
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as typeof period)}
            className="h-8 rounded-xl border border-border/50 bg-card px-3 text-sm"
          >
            {(Object.entries(PERIOD_LABELS) as [typeof period, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <Button onClick={() => window.print()} size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Печать / PDF
          </Button>
        </div>
      </div>

      {/* Report document */}
      <div className="max-w-4xl mx-auto my-8 print:my-0 bg-white dark:bg-gray-900 print:bg-white shadow-xl print:shadow-none rounded-2xl print:rounded-none overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 print:from-blue-600 print:to-blue-500 px-8 py-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-black">R</div>
                <span className="text-lg font-bold">Remont.kz</span>
              </div>
              <p className="text-white/70 text-sm">Отчёт по деятельности компании</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">{PERIOD_LABELS[period]}</div>
              <div className="text-white/70 text-xs mt-1">
                Сформирован {now.toLocaleDateString("ru-KZ", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div>
                <h2 className="font-bold text-base mb-4">Сводная статистика</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={TrendingUp} label="Всего заказов" value={String(stats.total)} color="text-foreground" />
                  <StatCard icon={CheckCircle2} label="Завершено" value={String(stats.completed)} color="text-green-600" />
                  <StatCard icon={Clock} label="Активных" value={String(stats.active)} color="text-amber-600" />
                  <StatCard icon={XCircle} label="Отменено" value={String(stats.cancelled)} color="text-red-500" />
                </div>
              </div>

              {/* Financial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950/20 print:bg-green-50 border border-green-200/50 rounded-xl p-5">
                  <p className="text-sm text-muted-foreground mb-1">Расчётный доход</p>
                  <p className="text-3xl font-black text-green-600">{fmtNum(Math.round(stats.revenue))} ₸</p>
                  <p className="text-xs text-muted-foreground mt-1">Среднее из диапазона бюджетов</p>
                </div>
                {stats.avgRating !== null && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 print:bg-amber-50 border border-amber-200/50 rounded-xl p-5">
                    <p className="text-sm text-muted-foreground mb-1">Средний рейтинг</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-black text-amber-600">{stats.avgRating.toFixed(1)}</p>
                      <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">На основе {completed.filter(r => r.rating != null).length} отзывов</p>
                  </div>
                )}
              </div>

              {/* Completed requests table */}
              {completed.length > 0 && (
                <div>
                  <h2 className="font-bold text-base mb-4">Завершённые заказы</h2>
                  <div className="border border-border/50 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 text-left">
                          <th className="px-4 py-3 font-semibold text-muted-foreground text-xs">ID</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground text-xs">Услуга</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground text-xs">Дата</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground text-xs">Бюджет</th>
                          <th className="px-4 py-3 font-semibold text-muted-foreground text-xs">Оценка</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {completed.map(req => (
                          <tr key={req.id} className="hover:bg-muted/20">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{req.id.slice(0, 8).toUpperCase()}</td>
                            <td className="px-4 py-3 font-medium">{req.service?.name ?? "Пользовательский заказ"}</td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {new Date(req.updatedAt).toLocaleDateString("ru-KZ", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {req.budgetFrom || req.budgetTo
                                ? `${fmtNum(req.budgetFrom ?? 0)}–${fmtNum(req.budgetTo ?? req.budgetFrom ?? 0)} ₸`
                                : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {req.rating != null
                                ? <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{req.rating}</span>
                                : <span className="text-xs text-muted-foreground/50">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {filteredReqs.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  Нет данных за выбранный период
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-border/50 pt-6 flex items-center justify-between text-xs text-muted-foreground">
                <span>Remont.kz — маркетплейс услуг по ремонту</span>
                <span>Конфиденциально</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="print:hidden h-8" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 print:bg-gray-50 border border-border/40 rounded-xl p-4 text-center">
      <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
