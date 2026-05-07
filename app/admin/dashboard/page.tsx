"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, ClipboardList, CheckCircle, UserX, Activity } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { StatsCard } from "@/components/admin/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  users: { total: number; clients: number; companies: number; blocked: number };
  services: { total: number; active: number };
  requests: { total: number; completed: number; new: number };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${user.token}` } })
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Обзор платформы remont.kz</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard label="Всего пользователей" value={stats.users.total} icon={Users} color="blue" sub={`Клиентов: ${stats.users.clients} · Компаний: ${stats.users.companies}`} />
          <StatsCard label="Заблокировано" value={stats.users.blocked} icon={UserX} color="red" />
          <StatsCard label="Услуг на платформе" value={stats.services.total} icon={Briefcase} color="default" sub={`Активных: ${stats.services.active}`} />
          <StatsCard label="Всего заявок" value={stats.requests.total} icon={ClipboardList} color="amber" />
          <StatsCard label="Завершённых заявок" value={stats.requests.completed} icon={CheckCircle} color="green" />
          <StatsCard label="Новых заявок" value={stats.requests.new} icon={Activity} color="blue" />
        </div>
      )}
    </div>
  );
}
