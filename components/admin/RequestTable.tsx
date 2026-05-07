"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AdminRequest {
  id: string;
  description: string;
  category?: string | null;
  city?: string | null;
  status: string;
  budgetFrom?: number | null;
  budgetTo?: number | null;
  createdAt: string;
  client?: { id: string; name?: string | null; email: string } | null;
  company?: { id: string; name?: string | null; email: string } | null;
  _count: { offers: number };
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  NEW: { label: "Новая", variant: "secondary" },
  ACCEPTED: { label: "Принята", variant: "default" },
  IN_PROGRESS: { label: "В работе", variant: "default" },
  COMPLETED: { label: "Завершена", variant: "outline" },
};

interface RequestTableProps {
  requests: AdminRequest[];
  total: number;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function RequestTable({ requests, total, page, pages, onPageChange }: RequestTableProps) {
  return (
    <>
      <div className="text-xs text-muted-foreground mb-3">Всего: {total}</div>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Описание</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Клиент</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Компания</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Офферов</th>
              <th className="text-left px-4 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map((r) => {
              const s = STATUS_LABELS[r.status] ?? { label: r.status, variant: "secondary" as const };
              return (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="truncate max-w-[200px] font-medium">{r.description}</p>
                    <p className="text-xs text-muted-foreground">{r.category ?? "—"} · {r.city ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                    {r.client?.name ?? r.client?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                    {r.company?.name ?? r.company?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                    {r._count.offers}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.variant} className="text-xs">{s.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Назад
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
            Вперёд <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </>
  );
}
