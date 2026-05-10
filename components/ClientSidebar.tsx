"use client";

import { Link, usePathname } from "@/i18n/routing";
import { ClipboardList, MessageSquare, Heart, CreditCard, User, Bell } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const ITEMS = [
  { label: "My Requests",    icon: ClipboardList,  href: "/my-requests" },
  { label: "Messages",       icon: MessageSquare,  href: "/chat" },
  { label: "Saved Services", icon: Heart,          href: "/favorites" },
  { label: "Notifications",  icon: Bell,           href: "/notifications" },
  { label: "Billing",        icon: CreditCard,     href: "/billing" },
  { label: "Profile",        icon: User,           href: "/profile" },
];

export function ClientSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || user.role !== "client") return null;

  return (
    <aside className="hidden md:block w-56 shrink-0">
      <div className="sticky top-20 bg-card border border-border/50 rounded-2xl overflow-hidden">
        {/* User info */}
        <div className="px-4 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-black text-primary shrink-0">
              {(user.name?.[0] ?? user.email[0]).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name ?? "Client"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-2">
          {ITEMS.map(({ label, icon: Icon, href }) => {
            const active = pathname === href || (href !== "/my-requests" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
