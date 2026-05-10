"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ClientSidebar } from "@/components/ClientSidebar";
import { Footer } from "@/components/Footer";
import { Bell, CheckCircle2, Clock, MessageSquare, Star, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import type { RequestRecord } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { buildNotifications, type NotifItem } from "@/lib/use-notifications";

const ICONS = {
  offer:     { icon: Zap,            bg: "bg-amber-100 dark:bg-amber-950/40",  text: "text-amber-600" },
  accepted:  { icon: CheckCircle2,   bg: "bg-blue-100 dark:bg-blue-950/40",   text: "text-blue-600" },
  completed: { icon: Star,           bg: "bg-green-100 dark:bg-green-950/40", text: "text-green-600" },
  chat:      { icon: MessageSquare,  bg: "bg-violet-100 dark:bg-violet-950/40", text: "text-violet-600" },
  review:    { icon: Star,           bg: "bg-rose-100 dark:bg-rose-950/40",   text: "text-rose-600" },
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) router.push("/"); }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    void api.getRequests().then(setRequests).catch(() => null).finally(() => setLoading(false));
  }, [user]);

  const notifs = useMemo(() => buildNotifications(requests), [requests]);
  const unread = notifs.filter(n => !n.read).length;

  /* Group by date */
  const grouped = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const groups: Record<string, NotifItem[]> = { Today: [], Yesterday: [], "Earlier": [] };
    notifs.forEach(n => {
      const d = new Date(n.time); d.setHours(0,0,0,0);
      if (d >= today)     groups.Today.push(n);
      else if (d >= yesterday) groups.Yesterday.push(n);
      else                groups.Earlier.push(n);
    });
    return groups;
  }, [notifs]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
              <Bell className="h-6 w-6" /> Notifications
              {unread > 0 && (
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold px-1.5">
                  {unread}
                </span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your activity and updates</p>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          <ClientSidebar />

          <div className="flex-1 min-w-0">
            {notifs.length === 0 ? (
              <div className="bg-card border border-border/50 rounded-2xl py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-semibold">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-1">Activity from your requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(grouped).map(([group, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={group}>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> {group}
                      </p>
                      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/40">
                        {items.map((notif) => {
                          const { icon: Icon, bg, text } = ICONS[notif.type];
                          return (
                            <Link key={notif.id} href={notif.href}
                              className="flex items-start gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${bg}`}>
                                <Icon className={`h-5 w-5 ${text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-semibold leading-snug ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                                    {notif.title}
                                    {!notif.read && <span className="inline-block h-2 w-2 rounded-full bg-primary ml-2 align-middle" />}
                                  </p>
                                  <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(notif.time)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.desc}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
