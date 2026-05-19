"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { User, Lock } from "lucide-react";

type ActiveId = "profile" | "security";

export function SettingsSidebar({ active }: { active: ActiveId }) {
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const ITEMS = [
    { id: "profile" as ActiveId,  label: tNav("profile"),    icon: User, href: "/company/dashboard?tab=profile" },
    { id: "security" as ActiveId, label: tCommon("security"), icon: Lock, href: "/company/dashboard?tab=security" },
  ];

  return (
    <aside className="hidden md:block w-52 shrink-0">
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{tNav("cabinet")}</p>
        </div>
        <nav className="p-2">
          {ITEMS.map(({ id, label, icon: Icon, href }) => (
            <Link
              key={id}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
