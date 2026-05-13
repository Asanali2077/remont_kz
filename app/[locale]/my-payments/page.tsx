"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, XCircle, Clock, Tag } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" }> = {
  PAID:     { label: "Оплачено",   icon: CheckCircle2, variant: "default" },
  PENDING:  { label: "Ожидание",   icon: Clock,        variant: "secondary" },
  FAILED:   { label: "Ошибка",     icon: XCircle,      variant: "destructive" },
  REFUNDED: { label: "Возврат",    icon: CreditCard,   variant: "secondary" },
};

const METHOD_LABELS: Record<string, string> = {
  card: "Карта",
  kaspi: "Kaspi Pay",
  transfer: "Перевод",
};

export default function MyPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    fetch("/api/payments", { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json())
      .then(setPayments)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ProtectedRoute requiredRole="client">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 flex gap-6">
          <main className="flex-1 min-w-0 space-y-4">
            <h1 className="text-2xl font-bold">Мои платежи</h1>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center text-muted-foreground gap-3">
                <CreditCard className="h-12 w-12 opacity-30" />
                <p className="font-medium">У вас пока нет платежей</p>
                <p className="text-sm">Платежи появятся после оплаты услуги</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                  const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.PENDING;
                  const Icon = cfg.icon;
                  const net = p.amount - (p.discountAmount ?? 0);
                  return (
                    <div key={p.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {p.request?.service?.name ?? p.request?.description?.slice(0, 60) ?? "Заявка"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {p.request?.company?.name ?? "Компания"} · {METHOD_LABELS[p.method] ?? p.method} · {new Date(p.createdAt).toLocaleDateString("ru")}
                        </p>
                        {p.promoCode && (
                          <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                            <Tag className="h-3 w-3" />
                            {p.promoCode.code} −{p.promoCode.discount}%
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg">{net.toLocaleString("ru")} ₸</p>
                        {p.discountAmount > 0 && (
                          <p className="text-xs text-muted-foreground line-through">{p.amount.toLocaleString("ru")} ₸</p>
                        )}
                        <Badge variant={cfg.variant} className="text-xs mt-1">{cfg.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
