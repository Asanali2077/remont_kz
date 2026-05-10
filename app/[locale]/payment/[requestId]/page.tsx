"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Smartphone, ArrowLeftRight, CheckCircle2, Loader2 } from "lucide-react";

type Method = "card" | "kaspi" | "transfer";

export default function PaymentPage() {
  const t = useTranslations("payment");
  const tCommon = useTranslations("common");
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const METHODS: { id: Method; label: string; icon: React.ReactNode }[] = [
    { id: "card", label: t("card"), icon: <CreditCard className="h-5 w-5" /> },
    { id: "kaspi", label: "Kaspi Pay", icon: <Smartphone className="h-5 w-5" /> },
    { id: "transfer", label: t("method"), icon: <ArrowLeftRight className="h-5 w-5" /> },
  ];

  const [payment, setPayment] = useState<{ id: string; amount: number; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<Method>("card");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user?.token) return;
    fetch(`/api/payments/${requestId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.status === "PAID") setDone(true);
        setPayment(data);
      })
      .catch(() => toast.error("Failed to load payment info"))
      .finally(() => setLoading(false));
  }, [requestId, user]);

  async function initAndPay() {
    if (!user?.token) return;
    setPaying(true);
    try {
      // Create payment if it doesn't exist
      if (!payment) {
        const r = await fetch(`/api/payments/${requestId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!r.ok) {
          const d = await r.json();
          throw new Error(d.error ?? "Failed to create payment");
        }
      }
      // Confirm (mock)
      const r2 = await fetch(`/api/payments/${requestId}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      if (!r2.ok) {
        const d = await r2.json();
        throw new Error(d.error ?? "Payment failed");
      }
      setDone(true);
      toast.success("Payment successful!");
      setTimeout(() => router.push("/my-requests"), 1500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment error");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <p className="font-bold text-xl">{t("success")}</p>
          <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">Mock payment — no real money charged</p>
        </div>

        {payment && (
          <div className="rounded-xl border bg-muted/40 px-5 py-4">
            <p className="text-sm text-muted-foreground">{t("amount")}</p>
            <p className="text-3xl font-bold mt-0.5">
              {payment.amount.toLocaleString("ru-KZ")} ₸
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold">{t("method")}</p>
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                method === m.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        <Button onClick={initAndPay} disabled={paying} className="w-full h-11 rounded-xl font-semibold">
          {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {paying ? t("processing") : t("pay")}
        </Button>

        <Button variant="ghost" className="w-full" onClick={() => router.back()}>
          {tCommon("cancel")}
        </Button>
      </div>
    </div>
  );
}
