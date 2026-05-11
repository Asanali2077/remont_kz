"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserTable, AdminUser } from "@/components/admin/UserTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [blocked, setBlocked] = useState("all");

  const load = useCallback(async (p = page) => {
    if (!user?.token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (search) params.set("search", search);
    if (role !== "all") params.set("role", role);
    if (blocked !== "all") params.set("blocked", blocked);
    try {
      const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${user.token}` } });
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [user, search, role, blocked, page]);

  const handleVerify = useCallback(async (id: string, value: boolean) => {
    if (!user?.token) return;
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ isVerified: value }),
    });
    load(page);
  }, [user, page, load]);

  useEffect(() => { load(1); }, [user, search, role, blocked]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Пользователи</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="client">Клиенты</SelectItem>
            <SelectItem value="company">Компании</SelectItem>
          </SelectContent>
        </Select>
        <Select value={blocked} onValueChange={setBlocked}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="false">Активные</SelectItem>
            <SelectItem value="true">Заблокированные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : (
        <UserTable
          users={users}
          total={total}
          page={page}
          pages={pages}
          onPageChange={(p) => load(p)}
          onRefresh={() => load(page)}
          onVerify={handleVerify}
          token={user?.token ?? ""}
        />
      )}
    </div>
  );
}
