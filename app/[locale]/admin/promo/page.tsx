"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPromoPage() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);

  const headers = { Authorization: `Bearer ${user?.token}`, "Content-Type": "application/json" };

  const load = async () => {
    if (!user?.token) return;
    setLoading(true);
    const res = await fetch("/api/admin/promo", { headers });
    const data = await res.json();
    setCodes(data);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async () => {
    if (!code || !discount) return;
    setCreating(true);
    const res = await fetch("/api/admin/promo", {
      method: "POST",
      headers,
      body: JSON.stringify({
        code: code.toUpperCase(),
        discount: Number(discount),
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      }),
    });
    if (res.ok) {
      toast.success("Промокод создан");
      setCode(""); setDiscount(""); setMaxUses(""); setExpiresAt("");
      void load();
    } else {
      const d = await res.json();
      toast.error(d.error ?? "Ошибка создания");
    }
    setCreating(false);
  };

  const deactivate = async (id: string) => {
    await fetch(`/api/admin/promo/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ isActive: false }),
    });
    void load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/promo/${id}`, { method: "DELETE", headers });
    void load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Промокоды</h1>

      <div className="bg-card border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Создать промокод</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input placeholder="Код (напр. SAVE20)" value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
          <Input placeholder="Скидка %" type="number" min={1} max={100} value={discount} onChange={e => setDiscount(e.target.value)} />
          <Input placeholder="Макс. использований" type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} />
          <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
        </div>
        <Button onClick={create} disabled={creating || !code || !discount} className="gap-2">
          <Plus className="h-4 w-4" />Создать
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Загрузка...</p>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="text-left p-3 font-medium">Код</th>
                <th className="text-left p-3 font-medium">Скидка</th>
                <th className="text-left p-3 font-medium">Использований</th>
                <th className="text-left p-3 font-medium">Истекает</th>
                <th className="text-left p-3 font-medium">Статус</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="p-3 font-mono font-bold">{c.code}</td>
                  <td className="p-3">{c.discount}%</td>
                  <td className="p-3">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="p-3 text-muted-foreground">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("ru") : "—"}</td>
                  <td className="p-3">
                    <Badge variant={c.isActive ? "default" : "secondary"}>{c.isActive ? "Активен" : "Деактивирован"}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      {c.isActive && (
                        <Button size="sm" variant="outline" onClick={() => deactivate(c.id)}>Деактивировать</Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {codes.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Промокодов нет</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
