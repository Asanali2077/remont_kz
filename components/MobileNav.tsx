"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Home, Search, ClipboardList, MessageSquare, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequestCreateDialog } from "@/components/RequestCreateDialog";

export function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("nav");

  if (!user) return null;

  const CLIENT_ITEMS = [
    { href: "/",            icon: Home,           label: t("home") },
    { href: "/repair",      icon: Search,         label: t("catalog") },
    { href: "/my-requests", icon: ClipboardList,  label: t("myRequests") },
    { href: "/chat",        icon: MessageSquare,  label: t("chat") },
    { href: "/profile",     icon: User,           label: t("profile") },
  ];

  const COMPANY_ITEMS = [
    { href: "/",                    icon: Home,          label: t("home") },
    { href: "/company/catalog",     icon: Search,        label: t("catalog") },
    { href: "/company/dashboard",   icon: ClipboardList, label: t("dashboard") },
    { href: "/chat",                icon: MessageSquare, label: t("chat") },
    { href: "/profile",             icon: User,          label: t("profile") },
  ];

  const items = user.role === "company" ? COMPANY_ITEMS : CLIENT_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ href, icon: Icon, label }, i) => {
          // Center button for client — "New Request"
          if (user.role === "client" && i === 2) {
            return (
              <RequestCreateDialog key="new" trigger={
                <button className="flex flex-col items-center gap-0.5 px-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 -mt-4">
                    <span className="text-white text-2xl font-black leading-none">+</span>
                  </div>
                  <span className="text-[10px] font-semibold text-primary">{label}</span>
                </button>
              } />
            );
          }

          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-0.5 py-1">
              {active ? (
                <span className="flex flex-col items-center gap-0.5 bg-primary/10 rounded-xl px-3 py-1">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-semibold text-primary">{label}</span>
                </span>
              ) : (
                <span className="flex flex-col items-center gap-0.5 px-3 py-1">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
