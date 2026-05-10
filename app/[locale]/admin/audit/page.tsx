"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type AuditEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string | null; email: string };
};

const ACTION_COLORS: Record<string, string> = {
  block_user:    "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  unblock_user:  "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  delete_user:   "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  toggle_service:"bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  delete_service:"bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  edit_user:     "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function AdminAuditPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState("all");

  const load = useCallback(async (p = page) => {
    if (!user?.token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (entity !== "all") params.set("entity", entity);
    try {
      const res = await fetch(`/api/admin/audit?${params}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [user, entity, page]);

  useEffect(() => { void load(1); }, [user, entity]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{t("auditLog")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("audit")} — {total}</p>
      </div>

      <div className="flex gap-3">
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon("all")}</SelectItem>
            <SelectItem value="user">{t("users")}</SelectItem>
            <SelectItem value="service">{t("services")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-semibold">No audit entries yet</p>
          <p className="text-sm mt-1">Admin actions will appear here</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("timestamp")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("actor")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("action")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{t("entity")}</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">{tCommon("more")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("ru-KZ", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{log.actor?.name ?? log.actor?.email ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{log.actor?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${ACTION_COLORS[log.action] ?? "bg-muted text-foreground"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{log.entity}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {log.entityId.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => void load(page - 1)}>{tCommon("back")}</Button>
                <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => void load(page + 1)}>{tCommon("more")}</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
