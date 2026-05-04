"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ClipboardList, Briefcase, TrendingUp, CheckCircle2,
  AlertCircle, MessageSquare, ArrowRight, Star, Zap,
} from "lucide-react";
import type { RequestRecord } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function CompanyOverview({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [stats, setStats] = useState<{
    totalServices: number; totalRequests: number;
    byStatus: { new: number; accepted: number; in_progress: number; completed: number };
    avgRating: number | null; revenue: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      api.getCompanyStats().then(setStats),
      api.getRequests({ scope: "all" }).then(setRequests),
    ]).catch(() => null).finally(() => setLoading(false));
  }, []);

  const newRequests    = requests.filter(r => !r.companyId);
  const actionNeeded   = requests.filter(r => r.companyId && (r.status === "new" || (r.status === "completed" && r.rating !== null && !r.companyReply)));
  const inProgress     = requests.filter(r => r.status === "in_progress");

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    );
  }

  const STAT_CARDS = [
    { label: "New Requests",  value: stats?.byStatus.new ?? 0,        icon: AlertCircle,    color: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", iconCls: "text-amber-600", tab: "requests" },
    { label: "In Progress",   value: stats?.byStatus.in_progress ?? 0, icon: Zap,           color: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",   iconCls: "text-blue-600",  tab: "requests" },
    { label: "Completed",     value: stats?.byStatus.completed ?? 0,   icon: CheckCircle2,  color: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800",iconCls: "text-green-600", tab: "requests" },
    { label: "My Services",   value: stats?.totalServices ?? 0,        icon: Briefcase,     color: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800", iconCls: "text-violet-600", tab: "services" },
  ];

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold">Good day, {user?.name ?? "Company"}! 👋</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, iconCls, tab }) => (
          <button key={label} onClick={() => onNavigate(tab)}
            className={`rounded-2xl border p-4 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${color}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${iconCls}`} />
              <span className="text-xs font-semibold text-muted-foreground">{label}</span>
            </div>
            <p className="text-3xl font-black">{value}</p>
          </button>
        ))}
      </div>

      {/* KPI row */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40 shrink-0">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.avgRating?.toFixed(1) ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Avg. rating</p>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40 shrink-0">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-black">{stats.revenue > 0 ? `${(stats.revenue / 1000).toFixed(0)}K ₸` : "—"}</p>
              <p className="text-xs text-muted-foreground">Total revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Needed ── */}
      {(actionNeeded.length > 0 || newRequests.length > 0) && (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/40">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-sm">Action needed</h3>
            <span className="ml-auto text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              {actionNeeded.length + newRequests.length}
            </span>
          </div>
          <div className="divide-y divide-border/40">
            {newRequests.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0 mt-0.5">
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">New request available</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{r.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground">{timeAgo(r.createdAt)}</span>
                  <button onClick={() => onNavigate("requests")}
                    className="text-xs font-semibold text-primary hover:underline underline-offset-2">
                    View →
                  </button>
                </div>
              </div>
            ))}
            {actionNeeded.slice(0, 2).map(r => (
              <div key={r.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    {r.status === "new" ? "Awaiting your confirmation" : "Review awaits reply"}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{r.service?.name ?? "Custom request"}</p>
                </div>
                <button onClick={() => onNavigate("requests")}
                  className="text-xs font-semibold text-primary hover:underline underline-offset-2 shrink-0">
                  View →
                </button>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border/40">
            <button onClick={() => onNavigate("requests")}
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
              View all requests <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── In Progress ── */}
      {inProgress.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/40">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-sm">Currently in progress</h3>
            <span className="ml-auto text-xs text-muted-foreground">{inProgress.length} active</span>
          </div>
          <div className="divide-y divide-border/40">
            {inProgress.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.service?.name ?? "Custom request"}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.client?.name ?? r.client?.email}</p>
                </div>
                <Link href={`/chat/${r.id}`} className="text-xs font-semibold text-primary hover:underline underline-offset-2 shrink-0">
                  Chat →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Add new service",    icon: Briefcase,     tab: "services",    color: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800" },
          { label: "View all requests",  icon: ClipboardList, tab: "requests",    color: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
          { label: "See statistics",     icon: TrendingUp,    tab: "statistics",  color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
        ].map(({ label, icon: Icon, tab, color }) => (
          <button key={tab} onClick={() => onNavigate(tab)}
            className={`flex items-center gap-3 rounded-xl border p-4 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-left ${color}`}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold">{label}</span>
            <ArrowRight className="h-4 w-4 ml-auto opacity-60" />
          </button>
        ))}
      </div>
    </div>
  );
}
