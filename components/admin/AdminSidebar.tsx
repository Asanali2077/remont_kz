"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LayoutDashboard, Users, Briefcase, ClipboardList, LogOut, ScrollText, Tag } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const { logout } = useAuth();

  const NAV = [
    { href: "/admin/dashboard" as const, label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/users" as const, label: t("users"), icon: Users },
    { href: "/admin/services" as const, label: t("services"), icon: Briefcase },
    { href: "/admin/requests" as const, label: t("requests"), icon: ClipboardList },
    { href: "/admin/audit" as const, label: t("auditLog"), icon: ScrollText },
    { href: "/admin/promo" as const, label: t("promo"), icon: Tag },
  ];

  return (
    <aside className="flex flex-col w-56 shrink-0 border-r bg-card min-h-screen">
      <div className="px-4 py-5 border-b">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("title")}</p>
        <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5">remont.kz</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href
                ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-2 py-4 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {tAuth("logout")}
        </button>
      </div>
    </aside>
  );
}
