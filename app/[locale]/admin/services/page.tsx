"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ServiceTable, AdminService } from "@/components/admin/ServiceTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_CATEGORY_OPTIONS } from "@/lib/types";

export default function AdminServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<AdminService[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [active, setActive] = useState("all");

  const load = useCallback(async (p = page) => {
    if (!user?.token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (active !== "all") params.set("active", active);
    try {
      const res = await fetch(`/api/admin/services?${params}`, { headers: { Authorization: `Bearer ${user.token}` } });
      const data = await res.json();
      setServices(data.services);
      setTotal(data.total);
      setPages(data.pages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [user, search, category, active, page]);

  useEffect(() => { load(1); }, [user, search, category, active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Услуги</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Поиск по названию или компании..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {SERVICE_CATEGORY_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={active} onValueChange={setActive}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="true">Активные</SelectItem>
            <SelectItem value="false">Скрытые</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : (
        <ServiceTable
          services={services}
          total={total}
          page={page}
          pages={pages}
          onPageChange={(p) => load(p)}
          onRefresh={() => load(page)}
          token={user?.token ?? ""}
        />
      )}
    </div>
  );
}
