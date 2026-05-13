"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AdminService {
  id: string;
  name: string;
  category: string;
  active: boolean;
  city?: string | null;
  priceFrom: number;
  priceTo: number;
  rating?: number | null;
  createdAt: string;
  company: { id: string; name?: string | null; email: string };
  _count: { requests: number };
}

interface ServiceTableProps {
  services: AdminService[];
  total: number;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  token: string;
}

export function ServiceTable({ services, total, page, pages, onPageChange, onRefresh, token }: ServiceTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleActive = async (svc: AdminService) => {
    setLoadingId(svc.id);
    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !svc.active }),
      });
      if (!res.ok) throw new Error();
      toast.success(svc.active ? "Услуга скрыта" : "Услуга опубликована");
      onRefresh();
    } catch {
      toast.error("Не удалось изменить статус");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (svc: AdminService) => {
    if (!confirm(`Удалить услугу "${svc.name}"? Это действие необратимо.`)) return;
    setLoadingId(svc.id);
    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Услуга удалена");
      onRefresh();
    } catch {
      toast.error("Не удалось удалить");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="text-xs text-muted-foreground mb-3">Всего: {total}</div>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Название</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Компания</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Город</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Заявок</th>
              <th className="text-left px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium truncate max-w-[180px]">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.category}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs truncate max-w-[160px]">
                  {s.company.name ?? s.company.email}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{s.city ?? "—"}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{s._count.requests}</td>
                <td className="px-4 py-3">
                  {s.active ? (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">Активна</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Скрыта</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7"
                      disabled={loadingId === s.id}
                      onClick={() => toggleActive(s)}
                      title={s.active ? "Скрыть" : "Опубликовать"}
                    >
                      {s.active
                        ? <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                        : <Eye className="h-3.5 w-3.5 text-green-600" />}
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7"
                      disabled={loadingId === s.id}
                      onClick={() => handleDelete(s)}
                      title="Удалить"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
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
