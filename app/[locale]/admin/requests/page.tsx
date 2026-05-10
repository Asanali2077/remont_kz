"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { RequestTable, AdminRequest } from "@/components/admin/RequestTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const STATUSES = ["NEW", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");

  const load = useCallback(async (p = page) => {
    if (!user?.token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (status !== "all") params.set("status", status);
    try {
      const res = await fetch(`/api/admin/requests?${params}`, { headers: { Authorization: `Bearer ${user.token}` } });
      const data = await res.json();
      setRequests(data.requests);
      setTotal(data.total);
      setPages(data.pages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [user, status, page]);

  useEffect(() => { load(1); }, [user, status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Заявки</h1>

      <div className="flex gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : (
        <RequestTable
          requests={requests}
          total={total}
          page={page}
          pages={pages}
          onPageChange={(p) => load(p)}
        />
      )}
    </div>
  );
}
