"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { RequestsManagement } from "@/components/company/RequestsManagement";
import { ServicesManagement } from "@/components/company/ServicesManagement";
import { CompanyStatistics } from "@/components/company/CompanyStatistics";
import { CompanyOverview } from "@/components/company/CompanyOverview";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";
import {
  LayoutDashboard, Briefcase, ClipboardList, BarChart3,
  Menu, X, ArrowRight, User, MessageSquare, GalleryHorizontal,
} from "lucide-react";
import { PortfolioManager } from "@/components/company/PortfolioManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Tab = "overview" | "services" | "requests" | "statistics" | "portfolio" | "profile";

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState<RequestRecord[]>([]);

  /* Live badge counts */
  const loadRequests = useCallback(async () => {
    try { setRequests(await api.getRequests({ scope: "all" })); } catch { /* silent */ }
  }, []);

  useEffect(() => {
    void loadRequests();
    const id = setInterval(() => void loadRequests(), 30_000);
    return () => clearInterval(id);
  }, [loadRequests]);

  const newCount       = requests.filter(r => !r.companyId).length;
  const actionCount    = requests.filter(r => r.companyId && r.status === "new").length;
  const totalBadge     = newCount + actionCount;
  const unreadMessages = requests.filter(r => r.companyId && (r.status === "accepted" || r.status === "in_progress")).length;

  const NAV: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview",    label: "Overview",    icon: LayoutDashboard, badge: totalBadge > 0 ? totalBadge : undefined },
    { id: "requests",    label: "Requests",    icon: ClipboardList,   badge: totalBadge > 0 ? totalBadge : undefined },
    { id: "services",    label: "Services",    icon: Briefcase },
    { id: "statistics",  label: "Statistics",  icon: BarChart3 },
    { id: "portfolio",   label: "Portfolio",   icon: GalleryHorizontal },
    { id: "profile",     label: "Profile",     icon: User },
  ];

  const activeLabel = NAV.find(n => n.id === activeTab)?.label ?? "";

  function navigate(tab: string) {
    setActiveTab(tab as Tab);
    setSidebarOpen(false);
  }

  return (
    <ProtectedRoute requiredRole="company">
      <div className="min-h-[calc(100vh-56px)] bg-muted/20">
        <div className="mx-auto max-w-6xl flex min-h-[calc(100vh-56px)]">

          {/* Mobile backdrop */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* ── Sidebar ── */}
          <aside className={`
            fixed md:sticky top-0 md:top-14 z-30 md:z-auto
            h-screen md:h-[calc(100vh-3.5rem)]
            w-60 bg-background border-r border-border/50 flex flex-col shrink-0
            transition-transform duration-300 md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}>
            {/* Mobile close */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 md:hidden">
              <span className="font-semibold text-sm">Dashboard</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Company info */}
            <div className="px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-black text-primary shrink-0">
                  {(user?.name?.[0] ?? user?.email?.[0] ?? "C").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{user?.name ?? "Company"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {NAV.map(({ id, label, icon: Icon, badge }) => (
                <button key={id} onClick={() => navigate(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    activeTab === id
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-black ${
                      activeTab === id ? "bg-white/25 text-white" : "bg-destructive text-destructive-foreground"
                    }`}>
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </button>
              ))}

              <div className="pt-2 border-t border-border/40 mt-2">
                <Link href="/chat">
                  <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-muted-foreground hover:bg-muted hover:text-foreground`}>
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">Messages</span>
                    {unreadMessages > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 text-white px-1 text-[10px] font-black">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    )}
                  </button>
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border/50">
              <a href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← Back to site
              </a>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Mobile topbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-background md:hidden sticky top-0 z-10">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 relative" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
                {totalBadge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-black">
                    {totalBadge > 9 ? "9+" : totalBadge}
                  </span>
                )}
              </Button>
              <span className="font-bold text-sm">{activeLabel}</span>
            </div>

            {/* Content area */}
            <div className="flex-1 p-5 md:p-7 overflow-auto">
              {activeTab === "overview"   && <CompanyOverview onNavigate={navigate} />}
              {activeTab === "services"   && <ServicesManagement />}
              {activeTab === "requests"   && <RequestsManagement />}
              {activeTab === "statistics" && <CompanyStatistics />}
              {activeTab === "portfolio"  && user && (
                <div>
                  <h2 className="text-xl font-bold mb-1">Portfolio</h2>
                  <p className="text-muted-foreground text-sm mb-6">Showcase your completed work — up to 20 photos.</p>
                  <PortfolioManager companyId={user.id} />
                </div>
              )}
              {activeTab === "profile"    && (
                <div className="max-w-md">
                  <h2 className="text-xl font-bold mb-1">Company Profile</h2>
                  <p className="text-muted-foreground text-sm mb-6">Manage your avatar, name, phone, and address.</p>
                  <Card>
                    <CardContent className="p-5">
                      <Link href="/profile">
                        <Button className="w-full gap-2 rounded-xl">
                          <User className="h-4 w-4" /> Open Profile Settings <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
