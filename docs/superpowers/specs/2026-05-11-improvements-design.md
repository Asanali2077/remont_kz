# remont_kz — Improvements Design Spec

**Date:** 2026-05-11  
**Status:** Approved

---

## Overview

This spec covers 7 independent improvement phases for the remont_kz marketplace platform. Each phase can be implemented and deployed independently. Phases are ordered by diploma demo value and dependency constraints.

---

## Phase 1 — Trust & Safety

### Company Verification

- Add `isVerified Boolean @default(false)` field to the `User` model (Prisma)
- Admin manually toggles verification via the admin panel
- Verified badge (✓) displayed on `OrgCard` component and service detail page `/repair/[id]`
- Verified status shown in company dashboard

### Admin Panel (`app/[locale]/admin/`)

A full admin panel accessible only to users with role `ADMIN`. Route guard: redirect non-admins to `/`.

**Sections:**
1. **Dashboard** — total users, total services, total requests (counts), recent registrations chart
2. **Companies** — list with columns: name, email, city, registeredAt, isVerified, isBlocked. Actions: verify/unverify, block/unblock
3. **Users (clients)** — list with columns: name, email, city, registeredAt, isBlocked. Actions: block/unblock
4. **Requests** — list with status filter, company/client info, created date
5. **Statistics** — requests by category (bar chart), requests by status (pie chart), registrations over time (line chart)

**Prisma schema changes for Phase 1:**
- Add `ADMIN` to `UserRole` enum
- Add `isVerified Boolean @default(false)` to `User` model
- Add `isBlocked Boolean @default(false)` to `User` model

Seed one admin user with `role: ADMIN`.

### reCAPTCHA v3

- Integrate Google reCAPTCHA v3 on login and registration forms in `AuthModal`
- Frontend: load reCAPTCHA script, call `grecaptcha.execute()` before form submit to get token
- Backend: verify token with Google API (`https://www.google.com/recaptcha/api/siteverify`) in `/api/auth/login` and `/api/auth/register` routes
- Score threshold: 0.5 (reject if lower)
- Env vars: `RECAPTCHA_SITE_KEY` (public), `RECAPTCHA_SECRET_KEY` (server-only)

### Private File Access

- Move served uploads behind auth: create `/api/files/[...path]/route.ts`
- Route reads JWT from `Authorization` header, verifies it, streams the file from `public/uploads/`
- If no valid JWT → 401
- Update all `imageUrl`/`audioUrl` references in frontend to use `/api/files/` prefix instead of direct `/uploads/` paths
- Keep `public/uploads/` directory but configure it to not be served statically (or move to `private/uploads/` outside `public/`)

---

## Phase 2 — Requests & Payments

### Promo Codes

New Prisma model:
```
model PromoCode {
  id          Int      @id @default(autoincrement())
  code        String   @unique
  discount    Float    // percentage 0-100
  maxUses     Int?     // null = unlimited
  usedCount   Int      @default(0)
  expiresAt   DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

- Admin creates/deactivates promo codes in admin panel
- Client enters promo code on payment page → `POST /api/promo/validate` returns discount amount
- Applied discount stored in `Payment` record

### Payment System (Kaspi Pay)

New Prisma model:
```
model Payment {
  id            Int           @id @default(autoincrement())
  requestId     Int
  request       Request       @relation(fields: [requestId], references: [id])
  clientId      Int
  client        User          @relation(fields: [clientId], references: [id])
  amount        Float
  discountAmount Float        @default(0)
  promoCodeId   Int?
  promoCode     PromoCode?    @relation(fields: [promoCodeId], references: [id])
  status        PaymentStatus @default(PENDING)
  kaspiOrderId  String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

- Integration: Kaspi Pay REST API
- Flow: client clicks "Pay" → `POST /api/payments/create` → redirect to Kaspi checkout → Kaspi webhooks `POST /api/payments/webhook` → update Payment status
- Page: `/my-payments` — list of all client payments with status, amount, service name, date

### Request Editing

- Client can edit request only when status is `NEW`
- `PUT /api/requests/[id]` — add check: if `offersCount > 0`, delete all offers for this request and send email notification to each company that had an offer
- Frontend: "Редактировать заявку" button visible in `/my-requests` only when status is `new`
- Edit opens the existing `RequestCreateDialog` pre-filled with current data

### Request Deadline

- Add `deadline DateTime?` field to `Request` model in Prisma
- `RequestCreateDialog` step 5: date picker for deadline (min: tomorrow, max: 90 days)
- Display countdown timer on request card in `/my-requests`: "Осталось 3 дня" (red if ≤ 1 day)
- `/api/requests/expire` updated to use `deadline` field if set, otherwise fallback to `createdAt + 14 days`

### Repeat Request

- "Повторить заявку" button on completed request cards in `/my-requests`
- Opens `RequestCreateDialog` pre-filled with: category, description, budget, city from original request
- Creates a brand new request (new id, status `NEW`, new deadline)

---

## Phase 3 — Notifications & Chat

### Web Push Notifications

- Generate VAPID key pair (stored in env: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`)
- New Prisma model:
```
model PushSubscription {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
}
```
- Service Worker: `public/sw.js` handles `push` events and shows notifications
- API: `POST /api/push/subscribe` (save subscription), `DELETE /api/push/subscribe` (remove)
- Push events: new offer received, offer accepted, new chat message, request expiring in 24h, new service from followed company

### Typing Indicator

- In-memory store on server: `Map<requestId, Map<userId, timestamp>>`
- `POST /api/chat/[requestId]/typing` — called every 2 seconds while user is typing, sets timestamp
- SSE stream extended: emits `event: typing` with `{ userId, userName }` when a new typing event is stored
- Cleanup: entries older than 3 seconds are ignored on read
- Frontend: show "Пользователь печатает..." below message list when typing event received, hide after 3 seconds of no new event

### Message Quoting

- Add `replyToId Int?` and `replyTo Message? @relation("MessageReplies", fields: [replyToId], references: [id])` to `Message` model
- Frontend: "Reply" button on each message → sets `replyingTo` state → shows quoted preview above input → sends `replyToId` with new message
- Display: quoted message shown as indented block above the reply message

### Read Status in UI

- Field `read Boolean @default(false)` already exists on `Message` model
- Frontend chat: show ✓✓ (double checkmark) next to sent messages when `read: true`
- `POST /api/messages/mark-read` already exists — call it when chat window is opened and when new messages arrive

---

## Phase 4 — Search & Filtering

### Radius Filter

- `FilterBar` component: add radius slider (10km, 25km, 50km, 100km, "Без ограничений")
- Requires user's geolocation (already available via `useMyLocation` hook)
- Backend `GET /api/services`: add optional `lat`, `lng`, `radius` query params
- SQL: add Haversine formula filter using raw query:
  ```sql
  (6371 * acos(cos(radians($lat)) * cos(radians(lat)) * cos(radians(lng) - radians($lng)) + sin(radians($lat)) * sin(radians(lat)))) <= $radius
  ```
- Only apply if all three params present and service has non-null lat/lng

### Sorting

- `FilterBar`: add sort dropdown — "По рейтингу", "По цене (↑)", "По цене (↓)", "Сначала новые"
- Backend: `sortBy` query param — values: `rating`, `price_asc`, `price_desc`, `newest`
- Rating sort: `ORDER BY (SELECT AVG(rating) FROM Request WHERE companyId = Service.userId AND rating IS NOT NULL) DESC`

### New Filters

- "Только с портфолио" checkbox: filters `WHERE (SELECT COUNT(*) FROM ServiceImage WHERE serviceId = Service.id) > 0`
- "Только верифицированные" checkbox: filters `WHERE user.isVerified = true` (requires Phase 1)

---

## Phase 5 — Companies & Rating

### Client Rating by Company

New Prisma model:
```
model ClientRating {
  id         Int      @id @default(autoincrement())
  requestId  Int      @unique
  request    Request  @relation(fields: [requestId], references: [id])
  clientId   Int
  client     User     @relation("ClientRatings", fields: [clientId], references: [id])
  companyId  Int
  company    User     @relation("CompanyRatings", fields: [companyId], references: [id])
  rating     Int      // 1-5
  comment    String?
  createdAt  DateTime @default(now())
}
```

- Company sees "Оценить клиента" button on completed request in their dashboard (KanbanBoard)
- `POST /api/requests/[id]/rate-client` — company submits rating
- Client profile `/profile` shows average client rating received from companies

### Company Follow (Favorite Companies)

- Add `CompanyFollow` model:
```
model CompanyFollow {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation("Followers", fields: [userId], references: [id])
  companyId Int
  company   User     @relation("Following", fields: [companyId], references: [id])
  createdAt DateTime @default(now())
  @@unique([userId, companyId])
}
```
- "Подписаться" button on service detail page `/repair/[id]`
- API: `POST /api/companies/[id]/follow`, `DELETE /api/companies/[id]/follow`
- Page `/favorites`: add "Компании" tab alongside existing "Услуги" tab
- When company adds a new service → send Push notification to all followers

---

## Phase 6 — UI/UX Polish

### Mobile Responsiveness

- Audit all pages on 375px viewport
- Fix known issues: horizontal scroll on tables in company dashboard, card overflow in `/my-requests`
- `KanbanBoard`: switch to vertical stack on mobile (one column, scroll by status tabs)
- Admin panel tables: add horizontal scroll wrapper `overflow-x: auto`

### Dark Theme

- Audit all new components from Phases 1-5 for dark mode
- Check: admin panel, payment page, promo code input, verification badge, typing indicator, read receipts, quoted messages, radius slider, client rating stars

### Skeleton Loading

- `/repair/[id]`: add skeleton for service detail (image gallery, title, description, stats, AI summary block)
- Use `shadcn/ui` Skeleton component matching actual layout dimensions

### Empty States

- Company dashboard → no services: illustration + "Добавьте первую услугу" CTA
- `/my-requests` → no requests: illustration + "Создайте первую заявку" CTA
- `/favorites` → no favorites: illustration + "Найдите услуги и добавьте в избранное"
- `/my-payments` → no payments: illustration + "У вас пока нет платежей"
- Chat inbox → no chats: illustration + "Чаты появятся после принятия заявки"

---

## Phase 7 — Infrastructure & Security (Last)

### JWT → httpOnly Cookie

- Replace `localStorage` token storage with `httpOnly` cookie
- Login/register API routes: set `Set-Cookie: session=<token>; HttpOnly; Secure; SameSite=Strict; Path=/`
- `AuthProvider`: remove localStorage reads/writes, read user from `/api/auth/me` on mount
- All API routes: read token from `cookies()` (Next.js) instead of `Authorization` header
- Logout: clear cookie via `Set-Cookie` with `Max-Age=0`

### Redis Rate Limiting

- Replace in-memory `Map` in `lib/rate-limit.ts` with Redis via `ioredis`
- Env: `REDIS_URL`
- Key format: `rate:<endpoint>:<ip>`, TTL matches window

### Soft Delete

- Add `deletedAt DateTime?` to `User`, `Service`, `Request` models
- Replace `prisma.*.delete()` calls with `prisma.*.update({ data: { deletedAt: new Date() } })`
- Add global query filter: `where: { deletedAt: null }` to all find operations
- Cascade: deleting a company soft-deletes their services but preserves client request history

### AI Summary Invalidation

- Add `aiSummaryUpdatedAt DateTime?` to `Service` model (already has `aiSummaryAt`)
- After service update or new rating → set `aiSummary = null`, `aiSummaryAt = null`
- `/repair/[id]` page: if `aiSummary` is null, show "Generating..." and trigger regeneration via `POST /api/ai/summary`

### SMTP Fallback Page

- On register: if email send fails (SMTP not configured), don't throw 500
- Return `{ user, token, emailSent: false }` from register API
- Frontend: if `emailSent: false` → show info modal "Письмо не отправлено — проверьте настройки SMTP или войдите напрямую"

### Request Expiry Cron

- Add Vercel Cron or system cron config: call `POST /api/requests/expire` every hour
- `vercel.json`:
```json
{
  "crons": [{ "path": "/api/requests/expire", "schedule": "0 * * * *" }]
}
```
- Protect endpoint with `CRON_SECRET` env var check

---

## Implementation Order Summary

| Phase | Name | Est. Days | Depends On |
|---|---|---|---|
| 1 | Trust & Safety | 2–3 | — |
| 2 | Requests & Payments | 3–4 | — |
| 3 | Notifications & Chat | 3–4 | — |
| 4 | Search & Filtering | 2–3 | Phase 1 (verified filter) |
| 5 | Companies & Rating | 1–2 | — |
| 6 | UI/UX Polish | 2–3 | All previous |
| 7 | Infrastructure | 3–5 | All previous |
