"use client";

import { Link } from "@/i18n/routing";
import { User, Lock, CreditCard } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface NavItem {
  id: "profile" | "security" | "billing";
  label: string;
  icon: React.ElementType;
  href: string;
  clientOnly?: boolean;
}

const ITEMS: NavItem[] = [
  { id: "profile",  label: "Profile",  icon: User,       href: "/profile" },
  { id: "security", label: "Security", icon: Lock,       href: "/settings" },
  { id: "billing",  label: "Billing",  icon: CreditCard, href: "/billing", clientOnly: true },
];

type ActiveId = "profile" | "security" | "billing";

export function SettingsSidebar({ active }: { active: ActiveId }) {
  const { user } = useAuth();

  const visible = ITEMS.filter((item) => !item.clientOnly || user?.role === "client");

  return (
    <aside className="hidden md:block w-52 shrink-0">
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account</p>
        </div>
        <nav className="p-2">
          {visible.map(({ id, label, icon: Icon, href }) => (
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
