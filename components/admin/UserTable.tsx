"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Ban, Unlock, Trash2, ChevronLeft, ChevronRight, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlockUserDialog } from "./BlockUserDialog";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  name?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  isBlocked: boolean;
  blockReason?: string | null;
  lastActiveAt?: string | null;
  createdAt: string;
  _count: { clientRequests: number; services: number };
}

interface UserTableProps {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  token: string;
}

export function UserTable({ users, total, page, pages, onPageChange, onRefresh, token }: UserTableProps) {
  const [blockTarget, setBlockTarget] = useState<AdminUser | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const allSelected = users.length > 0 && users.every(u => selected.has(u.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(users.map(u => u.id)));
  const toggleOne = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const bulkBlock = async () => {
    if (!selected.size || !confirm(`Заблокировать ${selected.size} пользователей?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selected].map(id =>
        fetch(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ isBlocked: true }),
        })
      ));
      toast.success(`Заблокировано: ${selected.size}`);
      setSelected(new Set());
      onRefresh();
    } catch { toast.error("Ошибка при массовой блокировке"); }
    finally { setBulkLoading(false); }
  };

  const bulkDelete = async () => {
    if (!selected.size || !confirm(`Удалить ${selected.size} пользователей? Необратимо.`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selected].map(id =>
        fetch(`/api/admin/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      toast.success(`Удалено: ${selected.size}`);
      setSelected(new Set());
      onRefresh();
    } catch { toast.error("Ошибка при массовом удалении"); }
    finally { setBulkLoading(false); }
  };

  const patchUser = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
  };

  const handleUnblock = async (user: AdminUser) => {
    setLoadingId(user.id);
    try {
      await patchUser(user.id, { isBlocked: false, blockReason: null });
      toast.success(`${user.name ?? user.email} разблокирован`);
      onRefresh();
    } catch {
      toast.error("Не удалось разблокировать");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Удалить ${user.name ?? user.email}? Это действие необратимо.`)) return;
    setLoadingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Пользователь удалён");
      onRefresh();
    } catch {
      toast.error("Не удалось удалить");
    } finally {
      setLoadingId(null);
    }
  };

  const handleBlockConfirm = async (reason: string) => {
    if (!blockTarget) return;
    await patchUser(blockTarget.id, { isBlocked: true, blockReason: reason || null });
    toast.success(`${blockTarget.name ?? blockTarget.email} заблокирован`);
    onRefresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">Всего: {total}</span>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Выбрано: {selected.size}</span>
            <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs gap-1 text-amber-600 border-amber-300 hover:bg-amber-50"
              disabled={bulkLoading} onClick={() => void bulkBlock()}>
              <Ban className="h-3 w-3" /> Блок. всех
            </Button>
            <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
              disabled={bulkLoading} onClick={() => void bulkDelete()}>
              <Trash2 className="h-3 w-3" /> Удалить всех
            </Button>
          </div>
        )}
      </div>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 w-8">
                <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                  {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium">Пользователь</th>
              <th className="text-left px-4 py-3 font-medium">Роль</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Заявки / Услуги</th>
              <th className="text-left px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className={`hover:bg-muted/30 transition-colors ${selected.has(u.id) ? "bg-primary/5" : ""}`}>
                <td className="px-4 py-3">
                  <button onClick={() => toggleOne(u.id)} className="text-muted-foreground hover:text-foreground">
                    {selected.has(u.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <p className="font-medium truncate max-w-[160px]">{u.name ?? "—"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-[160px] md:hidden">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.role === "COMPANY" ? "default" : "secondary"} className="text-xs">
                    {u.role === "COMPANY" ? "Компания" : "Клиент"}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs truncate max-w-[200px]">
                  {u.email}
                  {!u.emailVerified && <span className="ml-1 text-amber-500">●</span>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                  {u._count.clientRequests} / {u._count.services}
                </td>
                <td className="px-4 py-3">
                  {u.isBlocked ? (
                    <Badge variant="destructive" className="text-xs">Заблокирован</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-300">Активен</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    {u.isBlocked ? (
                      <Button
                        size="icon" variant="ghost" className="h-7 w-7"
                        disabled={loadingId === u.id}
                        onClick={() => handleUnblock(u)}
                        title="Разблокировать"
                      >
                        <Unlock className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                    ) : (
                      <Button
                        size="icon" variant="ghost" className="h-7 w-7"
                        disabled={loadingId === u.id}
                        onClick={() => setBlockTarget(u)}
                        title="Заблокировать"
                      >
                        <Ban className="h-3.5 w-3.5 text-amber-600" />
                      </Button>
                    )}
                    <Button
                      size="icon" variant="ghost" className="h-7 w-7"
                      disabled={loadingId === u.id}
                      onClick={() => handleDelete(u)}
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

      <BlockUserDialog
        open={blockTarget !== null}
        onOpenChange={(open) => !open && setBlockTarget(null)}
        userName={blockTarget?.name ?? blockTarget?.email ?? ""}
        onConfirm={handleBlockConfirm}
      />
    </>
  );
}
