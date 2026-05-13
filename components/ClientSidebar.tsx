"use client";

import { ClipboardList, MessageSquare, Heart, Bell, History, User, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export type CabinetTab = "requests" | "messages" | "favorites" | "notifications" | "history" | "profile" | "settings";

const ITEMS: { label: string; icon: React.ElementType; tab: CabinetTab }[] = [
  { label: "My Requests",   icon: ClipboardList, tab: "requests" },
  { label: "Messages",      icon: MessageSquare, tab: "messages" },
  { label: "Favorites",     icon: Heart,         tab: "favorites" },
  { label: "Notifications", icon: Bell,          tab: "notifications" },
  { label: "Order History", icon: History,       tab: "history" },
  { label: "Profile",       icon: User,          tab: "profile" },
  { label: "Settings",      icon: Settings,      tab: "settings" },
];

interface ClientSidebarProps {
  activeTab: CabinetTab;
  onTabChange: (tab: CabinetTab) => void;
}

export function ClientSidebar({ activeTab, onTabChange }: ClientSidebarProps) {
  const { user } = useAuth();
  if (!user || user.role !== "client") return null;

  return (
    <aside className="hidden md:block w-56 shrink-0">
      <div className="sticky top-20 bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-4 py-4 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-black text-primary shrink-0">
              {(user.name?.[0] ?? user.email[0]).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name ?? "Client"}</p>
              <p className="text-[11px] text-muted-foreground">Client</p>
            </div>
          </div>
        </div>
        <nav className="p-2">
          {ITEMS.map(({ label, icon: Icon, tab }) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                activeTab === tab
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
