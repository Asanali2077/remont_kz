"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { RequestRecord } from "@/lib/types";

export interface NotifItem {
  id: string;
  type: "offer" | "accepted" | "completed" | "review";
  title: string;
  desc: string;
  time: string;
  href: string;
  read: boolean;
}

const STORAGE_KEY = "notif_checked_at";

export function buildNotifications(requests: RequestRecord[]): NotifItem[] {
  const notifs: NotifItem[] = [];

  requests.forEach((r) => {
    if ((r.offers?.length ?? 0) > 0 && !r.companyId) {
      notifs.push({
        id: `offer-${r.id}`,
        type: "offer",
        title: `${r.offers!.length} offer${r.offers!.length > 1 ? "s" : ""} received`,
        desc: `${r.service?.name ?? "Custom request"} — review and accept the best offer`,
        time: r.updatedAt,
        href: "/my-requests",
        read: false,
      });
    }
    if (r.status === "accepted" && r.companyId) {
      notifs.push({
        id: `accepted-${r.id}`,
        type: "accepted",
        title: "Company accepted your request",
        desc: `${r.company?.name ?? "Company"}: ${r.service?.name ?? "Custom request"}`,
        time: r.updatedAt,
        href: `/chat/${r.id}`,
        read: false,
      });
    }
    if (r.status === "completed") {
      notifs.push({
        id: `completed-${r.id}`,
        type: "completed",
        title: "Job completed!",
        desc: `${r.service?.name ?? "Custom request"}${r.rating === null ? " — leave a review" : ""}`,
        time: r.updatedAt,
        href: "/my-requests",
        read: r.rating !== null,
      });
    }
  });

  return notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

export function useNotifications(role: "client" | "company", intervalMs = 30_000) {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const check = useCallback(async () => {
    // Skip if no session token in storage yet
    if (typeof window !== "undefined" && !localStorage.getItem("session:user")) return;
    try {
      const lastChecked = localStorage.getItem(STORAGE_KEY) ?? "2000-01-01";

      if (role === "client") {
        const reqs = await api.getRequests();
        const notifs = buildNotifications(reqs);
        const fresh = notifs.filter((n) => new Date(n.time) > new Date(lastChecked));
        setItems(notifs);
        setUnreadCount(fresh.length);
      } else {
        const reqs = await api.getRequests({ scope: "all" });
        const fresh = reqs.filter((r) => new Date(r.updatedAt) > new Date(lastChecked));
        setUnreadCount(fresh.length);
        setItems(
          fresh.slice(0, 8).map((r) => ({
            id: r.id,
            type: "offer" as const,
            title: `Request updated — ${r.status.replace("_", " ")}`,
            desc: r.service?.name ?? "Custom request",
            time: r.updatedAt,
            href: "/company/dashboard",
            read: false,
          }))
        );
      }
    } catch { /* silent */ }
  }, [role]);

  useEffect(() => {
    // Small delay to let AuthProvider write the token to localStorage first
    const init = setTimeout(() => void check(), 300);
    const id = setInterval(() => void check(), intervalMs);
    return () => { clearTimeout(init); clearInterval(id); };
  }, [check, intervalMs]);

  function markRead() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setUnreadCount(0);
  }

  return { items, unreadCount, markRead, refresh: check };
}
