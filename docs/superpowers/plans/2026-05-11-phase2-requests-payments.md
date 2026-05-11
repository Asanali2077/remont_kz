# Phase 2 — Requests & Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add promo codes, payment history page, request editing with offer reset, client-set deadlines with countdown, and repeat request button.

**Architecture:** Five independent improvements built on existing Payment/Request models. PromoCode is a new Prisma model. Payment model gets `promoCodeId` + `discountAmount`. Request editing reuses the existing PUT endpoint with offer reset logic. Deadline is a new `deadline` field on Request. `/my-payments` is a new page.

**Tech Stack:** Prisma migrations, Next.js API routes, shadcn/ui components, existing email infrastructure.

**Note on Kaspi Pay:** The existing payment flow already supports `kaspi` as a method. This plan improves the UI and flow without requiring real Kaspi merchant credentials (which require a live business account). The diploma demo shows the complete payment UX.

---

## File Map

| Action | File |
|---|---|
| Modify | `prisma/schema.prisma` |
| Create | `app/api/promo/validate/route.ts` |
| Create | `app/api/admin/promo/route.ts` |
| Create | `app/api/admin/promo/[id]/route.ts` |
| Modify | `app/api/payments/[requestId]/route.ts` |
| Modify | `app/api/requests/[id]/route.ts` |
| Modify | `app/api/requests/route.ts` |
| Create | `app/[locale]/my-payments/page.tsx` |
| Modify | `app/[locale]/payment/[requestId]/page.tsx` |
| Modify | `app/[locale]/admin/dashboard/page.tsx` (add promo section link) |
| Create | `app/[locale]/admin/promo/page.tsx` |
| Modify | `app/[locale]/admin/layout.tsx` (add promo nav link) |
| Modify | `components/RequestCreateDialog.tsx` |
| Modify | `app/[locale]/my-requests/page.tsx` |
| Modify | `components/nav/MainNavbar.tsx` (add My Payments link) |
| Modify | `lib/types.ts` |

---

## Task 1: Prisma schema — PromoCode + Payment + Request deadline

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add PromoCode model**

Add to `prisma/schema.prisma` after the `AuditLog` model:

```prisma
model PromoCode {
  id          String    @id @default(uuid())
  code        String    @unique
  discount    Float     // percentage 0-100
  maxUses     Int?      // null = unlimited
  usedCount   Int       @default(0)
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  payments    Payment[]

  @@index([code])
}
```

- [ ] **Step 2: Add fields to Payment model**

In `prisma/schema.prisma`, find the `Payment` model. Add after `method String @default("card")`:

```prisma
discountAmount Float     @default(0)
promoCodeId    String?
promoCode      PromoCode? @relation(fields: [promoCodeId], references: [id])
kaspiOrderId   String?
```

- [ ] **Step 3: Add deadline field to Request model**

In the `Request` model, add after `expiresAt DateTime?`:

```prisma
deadline       DateTime?
```

- [ ] **Step 4: Run migration**

```bash
npx prisma migrate dev --name phase2_promo_payment_deadline
```

Expected: migration created and applied.

- [ ] **Step 5: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add PromoCode model, payment discount fields, request deadline"
```

---

## Task 2: Promo code validation API

**Files:**
- Create: `app/api/promo/validate/route.ts`

- [ ] **Step 1: Create directory and file**

Create `app/api/promo/validate/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

const schema = z.object({ code: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()(request);
    if ("error" in authResult) return authResult.error;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: parsed.data.code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ error: "Invalid or inactive promo code" }, { status: 404 });
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json({ error: "Promo code has expired" }, { status: 410 });
    }
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: "Promo code usage limit reached" }, { status: 410 });
    }

    return NextResponse.json({ id: promo.id, code: promo.code, discount: promo.discount });
  } catch (error) {
    console.error("POST promo validate error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npm run type-check
git add app/api/promo/
git commit -m "feat: add promo code validation API"
```

---

## Task 3: Admin promo code management API

**Files:**
- Create: `app/api/admin/promo/route.ts`
- Create: `app/api/admin/promo/[id]/route.ts`

- [ ] **Step 1: Create list/create route**

Create `app/api/admin/promo/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

const createSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discount: z.number().min(1).max(100),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(codes);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.promoCode.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      code: parsed.data.code,
      discount: parsed.data.discount,
      maxUses: parsed.data.maxUses ?? null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });
  return NextResponse.json(promo, { status: 201 });
}
```

- [ ] **Step 2: Create deactivate route**

Create `app/api/admin/promo/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/middleware";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const promo = await prisma.promoCode.update({
    where: { id },
    data: { isActive: body.isActive ?? false },
  });
  return NextResponse.json(promo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin()(request);
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Type-check + commit**

```bash
npm run type-check
git add app/api/admin/promo/
git commit -m "feat: add admin promo code management API"
```

---

## Task 4: Update payment API to support promo codes

**Files:**
- Modify: `app/api/payments/[requestId]/route.ts`

- [ ] **Step 1: Read the current file**

Read `app/api/payments/[requestId]/route.ts` to understand the POST handler structure.

- [ ] **Step 2: Add promo code support to POST**

In the POST handler, after extracting `amount`, add promo code logic:

```ts
const body = await request.json().catch(() => ({}));
const promoCode = typeof body.promoCode === "string" ? body.promoCode.toUpperCase() : null;

let discountAmount = 0;
let promoCodeId: string | null = null;

if (promoCode) {
  const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
  if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date()) &&
      (promo.maxUses === null || promo.usedCount < promo.maxUses)) {
    discountAmount = Math.round((amount * promo.discount) / 100);
    promoCodeId = promo.id;
    // Increment usedCount
    await prisma.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
  }
}

const payment = await prisma.payment.create({
  data: {
    requestId: params.requestId,
    clientId: authResult.user.userId,
    amount,
    discountAmount,
    promoCodeId,
  },
});
```

- [ ] **Step 3: Type-check + commit**

```bash
npm run type-check
git add app/api/payments/
git commit -m "feat: apply promo code discount when creating payment"
```

---

## Task 5: Admin promo codes UI page

**Files:**
- Create: `app/[locale]/admin/promo/page.tsx`
- Modify: `app/[locale]/admin/layout.tsx`

- [ ] **Step 1: Read admin layout to understand nav structure**

Read `app/[locale]/admin/layout.tsx` to find where nav links are defined.

- [ ] **Step 2: Add promo link to admin nav**

In `app/[locale]/admin/layout.tsx`, find the nav links array (e.g., Dashboard, Users, Services, Requests, Audit). Add:

```tsx
{ href: "/admin/promo", label: "Промокоды", icon: Tag }
```

Import `Tag` from `lucide-react` if not already imported.

- [ ] **Step 3: Create promo admin page**

Create `app/[locale]/admin/promo/page.tsx`:

```tsx
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
```

- [ ] **Step 4: Type-check + commit**

```bash
npm run type-check
git add "app/[locale]/admin/promo/" "app/[locale]/admin/layout.tsx"
git commit -m "feat: add admin promo codes management page"
```

---

## Task 6: My Payments page

**Files:**
- Create: `app/[locale]/my-payments/page.tsx`
- Modify: `components/nav/MainNavbar.tsx` (add link, optional)

- [ ] **Step 1: Check what API data is available**

Read `app/api/payments/[requestId]/route.ts` to understand available Payment fields.

- [ ] **Step 2: Create payments list API**

Note: the existing payment API is per-request. Need a list endpoint. Create `app/api/payments/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireClient } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireClient()(request);
    if ("error" in authResult) return authResult.error;

    const payments = await prisma.payment.findMany({
      where: { clientId: authResult.user.userId },
      include: {
        request: {
          select: {
            id: true, description: true, category: true,
            service: { select: { id: true, name: true } },
            company: { select: { id: true, name: true } },
          },
        },
        promoCode: { select: { code: true, discount: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET payments list error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create my-payments page**

Create `app/[locale]/my-payments/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ClientSidebar } from "@/components/ClientSidebar";
import { ProtectedRoute } from "@/components/company/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, XCircle, Clock, Tag } from "lucide-react";
import { Link } from "@/i18n/routing";
import { fmtNum } from "@/lib/utils";

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
    <ProtectedRoute role="CLIENT">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 flex gap-6">
          <ClientSidebar />
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
                        <p className="font-bold text-lg">{fmtNum(net)} ₸</p>
                        {p.discountAmount > 0 && (
                          <p className="text-xs text-muted-foreground line-through">{fmtNum(p.amount)} ₸</p>
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
```

- [ ] **Step 4: Add My Payments to ClientSidebar**

Read `components/ClientSidebar.tsx`. Find the nav links array. Add:
```tsx
{ href: "/my-payments", label: "Мои платежи", icon: CreditCard }
```
Import `CreditCard` from lucide-react if not already there.

- [ ] **Step 5: Type-check + commit**

```bash
npm run type-check
git add "app/[locale]/my-payments/" app/api/payments/route.ts components/ClientSidebar.tsx
git commit -m "feat: add My Payments page and payments list API"
```

---

## Task 7: Payment page — add promo code input

**Files:**
- Modify: `app/[locale]/payment/[requestId]/page.tsx`

- [ ] **Step 1: Read current payment page**

Read `app/[locale]/payment/[requestId]/page.tsx` to understand the existing form structure.

- [ ] **Step 2: Add promo code state and validation**

Add promo code UI before the Pay button. The page already has a `method` state and `initAndPay` function.

Add state:
```tsx
const [promoInput, setPromoInput] = useState("");
const [promoApplied, setPromoApplied] = useState<{ id: string; code: string; discount: number } | null>(null);
const [promoLoading, setPromoLoading] = useState(false);
```

Add `applyPromo` function:
```tsx
async function applyPromo() {
  if (!promoInput || !user?.token) return;
  setPromoLoading(true);
  const res = await fetch("/api/promo/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
    body: JSON.stringify({ code: promoInput }),
  });
  const data = await res.json();
  if (res.ok) {
    setPromoApplied(data);
    toast.success(`Промокод применён: скидка ${data.discount}%`);
  } else {
    toast.error(data.error ?? "Неверный промокод");
  }
  setPromoLoading(false);
}
```

Update `initAndPay` to pass `promoCode` in the POST body:
```tsx
// When creating payment, include promoCode:
body: JSON.stringify({ promoCode: promoApplied?.code }),
```

Add UI (insert before the Pay button section):
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Промокод</label>
  {promoApplied ? (
    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl">
      <Tag className="h-4 w-4 text-green-600" />
      <span className="text-green-700 dark:text-green-400 font-medium">{promoApplied.code} — скидка {promoApplied.discount}%</span>
      <button onClick={() => setPromoApplied(null)} className="ml-auto text-muted-foreground hover:text-foreground">✕</button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Input
        placeholder="Введите промокод"
        value={promoInput}
        onChange={e => setPromoInput(e.target.value.toUpperCase())}
        className="font-mono"
      />
      <Button variant="outline" onClick={applyPromo} disabled={promoLoading || !promoInput}>
        {promoLoading ? "..." : "Применить"}
      </Button>
    </div>
  )}
</div>
```

Show discounted total if promo applied (find where amount is displayed and update to show discount).

- [ ] **Step 3: Import `Tag` and `Input`**

Add `Tag` to lucide-react import. Import `Input` from `@/components/ui/input`.

- [ ] **Step 4: Type-check + commit**

```bash
npm run type-check
git add "app/[locale]/payment/"
git commit -m "feat: add promo code input to payment page"
```

---

## Task 8: Request editing — allow client to edit NEW requests

**Files:**
- Modify: `app/api/requests/[id]/route.ts`

- [ ] **Step 1: Read the full requests/[id]/route.ts**

Read `app/api/requests/[id]/route.ts` to understand the existing PUT/PATCH handler.

- [ ] **Step 2: Add client edit endpoint**

The current route only allows status changes. Add a new PATCH handler (or extend PUT) for client editing. Find where request updates are handled and add:

```ts
// In PUT or PATCH handler, add client editing branch:
// If requester is the CLIENT and request status is NEW:
if (authResult.user.role === "CLIENT") {
  const request = await prisma.request.findUnique({
    where: { id: params.id },
    select: { clientId: true, status: true },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (request.clientId !== authResult.user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (request.status !== "NEW") {
    return NextResponse.json({ error: "Can only edit requests with status NEW" }, { status: 400 });
  }

  const editSchema = z.object({
    description: z.string().min(10).optional(),
    budgetFrom: z.number().positive().optional().nullable(),
    budgetTo: z.number().positive().optional().nullable(),
    city: z.string().optional(),
    deadline: z.string().datetime().optional().nullable(),
  });

  const body = await request.json().catch(() => ({}));
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 400 });
  }

  // Count existing offers
  const offerCount = await prisma.requestOffer.count({ where: { requestId: params.id } });

  // Delete all offers if any (they were made on old conditions)
  if (offerCount > 0) {
    await prisma.requestOffer.deleteMany({ where: { requestId: params.id } });
    // TODO: send email notifications to companies whose offers were deleted
    // (would require fetching company emails before deletion)
  }

  const updated = await prisma.request.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.description && { description: parsed.data.description }),
      ...(parsed.data.budgetFrom !== undefined && { budgetFrom: parsed.data.budgetFrom }),
      ...(parsed.data.budgetTo !== undefined && { budgetTo: parsed.data.budgetTo }),
      ...(parsed.data.city !== undefined && { city: parsed.data.city }),
      ...(parsed.data.deadline !== undefined && { deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null }),
    },
  });

  return NextResponse.json({ ...updated, offersReset: offerCount > 0 });
}
```

Note: read the actual file structure carefully — the above is a template. Integrate it properly with the existing code.

- [ ] **Step 3: Type-check + commit**

```bash
npm run type-check
git add app/api/requests/
git commit -m "feat: allow client to edit NEW requests, resets offers"
```

---

## Task 9: Deadline field + countdown + repeat button in my-requests

**Files:**
- Modify: `components/RequestCreateDialog.tsx`
- Modify: `app/[locale]/my-requests/page.tsx`

- [ ] **Step 1: Add deadline to RequestCreateDialog**

Read `components/RequestCreateDialog.tsx` to understand the current step 1 (Details) fields.

Add deadline state:
```tsx
const [deadline, setDeadline] = useState<string>("");
```

In step 1 (Details step), after the budget inputs add:

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Дедлайн (когда нужно выполнить)</label>
  <Input
    type="date"
    value={deadline}
    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
    max={new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]}
    onChange={e => setDeadline(e.target.value)}
  />
</div>
```

In the `submit` function, include deadline in the request body:
```tsx
deadline: deadline ? new Date(deadline).toISOString() : undefined,
```

Pass `deadline` to the `api.createRequest()` call. Read `lib/api.ts` to find `createRequest` and add `deadline?: string` to its params and forward it.

Also update `api/requests/route.ts` POST handler: find the `z.object` schema for request creation and add `deadline: z.string().datetime().optional()`. In the `prisma.request.create` call, include `deadline: validatedData.deadline ? new Date(validatedData.deadline) : null`.

Reset `deadline` in `handleClose`.

- [ ] **Step 2: Add countdown timer to my-requests**

Read `app/[locale]/my-requests/page.tsx` to find where request cards are rendered.

Add a countdown display on request cards when status is `new` and `request.deadline` is set:

```tsx
// Add this helper function:
function DeadlineCountdown({ deadline }: { deadline: string }) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return <span className="text-xs text-destructive font-medium">Просрочен</span>;
  if (days === 0) return <span className="text-xs text-destructive font-medium">Сегодня</span>;
  if (days === 1) return <span className="text-xs text-orange-500 font-medium">Завтра</span>;
  return <span className="text-xs text-muted-foreground">Осталось {days} д.</span>;
}
```

Show it near the request status badge where `status === "new"` and `request.deadline` exists.

- [ ] **Step 3: Add repeat request button**

In `app/[locale]/my-requests/page.tsx`, on completed request cards, add a "Повторить заявку" button.

The button opens a new `RequestCreateDialog` pre-filled with the completed request's data. Find where `RequestCreateDialog` is used/triggered. Pass initial values or add a `defaultValues` prop to it.

If adding a prop is complex, a simpler approach: store the "repeat data" in state, and when the user clicks "Повторить", open the dialog and pre-populate the description/city/budget fields.

Add state:
```tsx
const [repeatData, setRepeatData] = useState<{ description: string; city?: string; budgetFrom?: number; budgetTo?: number } | null>(null);
```

On completed request card:
```tsx
<Button
  size="sm"
  variant="outline"
  onClick={() => setRepeatData({
    description: req.description,
    city: req.city ?? undefined,
    budgetFrom: req.budgetFrom ?? undefined,
    budgetTo: req.budgetTo ?? undefined,
  })}
>
  Повторить заявку
</Button>
```

Pass `repeatData` and `onClear={() => setRepeatData(null)}` to `RequestCreateDialog`. Read `RequestCreateDialog` to see how to add initial values — add optional `defaultValues` prop and populate the state on mount when provided.

- [ ] **Step 4: Type-check + commit**

```bash
npm run type-check
git add components/RequestCreateDialog.tsx "app/[locale]/my-requests/page.tsx" lib/api.ts app/api/requests/route.ts
git commit -m "feat: add deadline picker, countdown, and repeat request button"
```

---

## Verification Checklist

- [ ] `npm run type-check` — no errors
- [ ] Admin can create, view, deactivate promo codes at `/admin/promo`
- [ ] Client can apply promo code on `/payment/[requestId]` — discount shown
- [ ] `/my-payments` shows payment history with promo discount applied
- [ ] Client can edit a NEW request (description/budget/city) — offers reset
- [ ] Client can set deadline in RequestCreateDialog — countdown shows in `/my-requests`
- [ ] Completed request has "Повторить заявку" button — opens dialog pre-filled
