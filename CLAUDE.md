# CLAUDE.md — Remont.kz Project Guide

Full-stack repair services marketplace for Kazakhstan. Diploma project 2026.
Stack: Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Prisma 7 · PostgreSQL · Framer Motion · next-intl

---

## Quick Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build
npm run type-check   # TypeScript check (must pass before commit)
npm run lint         # ESLint

npm run db:generate  # Regen Prisma client after schema changes (always run after schema edit)
npm run db:push      # Sync schema to DB (no migration history)
npm run db:seed      # Seed demo data (password: password123)
npm run db:studio    # Prisma Studio GUI
```

---

## Environment (.env)

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/remont_kz"
JWT_SECRET="remont-kz-jwt-secret-2024-diploma-project"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="/api"

# SMTP — Mailtrap sandbox (credentials in .env file)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=1e0f43111229f4
SMTP_PASS=2f93385123531d
SMTP_FROM="Remont.kz <noreply@remont.kz>"

# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdFsOcsAAAAAC7z2e_KFLgg8udvpD1yylu-WIW5
RECAPTCHA_SECRET_KEY=6LdFsOcsAAAAAH46d_F4d4tS8aByy_NcL_sOVY2p

# OpenRouter AI (free models)
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_BOT_MODEL="google/gemma-4-31b-it:free"
OPENROUTER_SUMMARY_MODEL="google/gemma-4-31b-it:free"
```

---

## Architecture

Single Next.js 14 monorepo — frontend + backend in one repo, App Router pattern.
All pages are under `app/[locale]/` — i18n via `next-intl` (RU, EN, KZ locales).

### Database
- **PostgreSQL** via `@prisma/adapter-pg` driver adapter (pool-based, NOT default engine)
- Prisma client singleton in `lib/db.ts` cached on `globalThis` to survive HMR
- After ANY schema change: run `npm run db:push && npm run db:generate`

### Auth
- **JWT stateless** — token stored in `localStorage` as `session:user: { token, id, email, role, name, phone }`
- `lib/auth.ts` — bcrypt (12 rounds), JWT sign/verify
- `lib/middleware.ts` — per-route guards: `requireAuth()`, `requireClient()`, `requireCompany()`, `assertEmailVerified()`
- All API routes extract token from `Authorization: Bearer <token>` header
- `components/auth/AuthProvider.tsx` — React context, `useAuth()` hook
- reCAPTCHA v3 on login + register via `react-google-recaptcha-v3`, verified server-side in `lib/recaptcha.ts`
- Email verification enforced on: POST /api/services (create), POST /api/requests/[id]/offer

### API Client (frontend)
All API calls go through `api` singleton from `lib/api.ts` (ApiClient class).
- Reads token from localStorage
- Normalises Prisma SCREAMING_SNAKE_CASE enums → frontend kebab-case
- 401 handler: only redirects to `/?session_expired=1` if there WAS an active session AND endpoint is not an auth endpoint

### Enum Mapping (critical — maintain when adding enum values)
```
DB enum            → Frontend type
AUTOMOBILES        → "automobiles"
REAL_ESTATE        → "real-estate"
PLUMBING           → "plumbing"
ELECTRICAL         → "electrical"
PAINTING           → "painting"
CLEANING           → "cleaning"
RENOVATION         → "renovation"
WELDING            → "welding"
ROOFING            → "roofing"
OTHER              → "other"
```
Conversion: `fromDbCategory()` in `lib/api.ts`. Update all three categoryMap objects in:
- `app/api/services/route.ts`
- `app/api/services/[id]/route.ts`
- `app/api/requests/route.ts`

---

## Database Schema (8 models)

```
User          — CLIENT | COMPANY | ADMIN roles. emailVerified, isBlocked, avatarUrl, etc.
Service       — Company's listing. category (10 values), priceFrom/priceTo, city, tags, active
ServiceImage  — Up to 10 images per service
Request       — Client request. status: NEW→ACCEPTED→IN_PROGRESS→COMPLETED. expiresAt (14 days)
RequestOffer  — Company bid on a request. status: PENDING|ACCEPTED|REJECTED. @@unique([requestId, companyId])
Message       — Chat message. type: TEXT|IMAGE|AUDIO. read boolean
Favorite      — Client saved service. @@unique([userId, serviceId])
Payment       — Mock payment tied to Request. status: PENDING|PAID|FAILED|REFUNDED
PortfolioPhoto — Company work photos
AuditLog      — Admin action tracking
PromoCode     — Discount codes for payments
```

---

## All API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/register` | POST | — | Register (Zod, reCAPTCHA, rate-limit 5/hr) |
| `/api/auth/login` | POST | — | Login (rate-limit 10/15min), returns emailVerified |
| `/api/auth/me` | GET/DELETE | Any | Get current user / Delete account (password confirm) |
| `/api/auth/profile` | GET/PUT | Any | View/update profile |
| `/api/auth/password` | PUT | Any | Change password |
| `/api/auth/verify-email` | GET | — | Email verification via token |
| `/api/auth/forgot-password` | POST | — | Send reset email |
| `/api/auth/reset-password` | POST | — | Set new password (token required) |
| `/api/services` | GET/POST | POST=Company | List/create services |
| `/api/services/[id]` | GET/PUT/DELETE | PUT/DELETE=Company | Service CRUD |
| `/api/services/[id]/reviews` | GET | — | Service reviews |
| `/api/services/[id]/similar` | GET | — | Similar services |
| `/api/services/[id]/images` | GET/POST | POST=Company | Manage service images |
| `/api/requests` | GET/POST | POST=Client | List/create requests |
| `/api/requests/[id]` | GET/PUT/DELETE | — | Request detail/update/cancel |
| `/api/requests/[id]/offer` | POST/DELETE | Company | Submit/withdraw offer |
| `/api/requests/[id]/accept-offer` | POST | Client | Accept company offer |
| `/api/requests/[id]/rate` | POST | Client | Rate completed request (1-5 stars) |
| `/api/requests/[id]/reply` | PUT | Company | Reply to review |
| `/api/requests/expire` | GET | — | Mark expired requests (called by Vercel cron hourly) |
| `/api/messages` | GET/POST | Any | Chat messages |
| `/api/messages/upload` | POST | Any | Upload image/audio for chat |
| `/api/messages/mark-read` | POST | Any | Mark messages read |
| `/api/chat` | GET | Any | Chat inbox |
| `/api/chat/[requestId]/stream` | GET | Any | SSE real-time chat (3s polling, timestamp-based) |
| `/api/favorites` | GET/POST | Client | List/add favorites |
| `/api/favorites/[serviceId]` | DELETE | Client | Remove favorite |
| `/api/notifications/count` | GET | Any | Unread count (messages + offers) |
| `/api/companies` | GET | — | List all companies |
| `/api/company/[id]` | GET | — | Company public profile |
| `/api/company/stats` | GET | Company | Dashboard statistics |
| `/api/company/export` | GET | Company | CSV export |
| `/api/health` | GET | — | DB health check |
| `/api/payments/[requestId]` | GET/POST | Any | Get/create payment |
| `/api/payments/[requestId]/confirm` | POST | Any | Confirm payment |
| `/api/admin/*` | Various | Admin | User mgmt, audit logs, promo codes, services |
| `/api/portfolio` | GET/POST/DELETE | Company | Portfolio photos |
| `/api/promo/validate` | POST | Client | Validate promo code |

---

## All Pages (app/[locale]/)

| URL | Component | Notes |
|-----|-----------|-------|
| `/` | `page.tsx` | Full landing page with before/after slider, stats, categories, how-it-works, reviews, CTA |
| `/repair` | `repair/page.tsx` | Service catalog with filters, search, grid/list view |
| `/repair/[id]` | `repair/[id]/page.tsx` | Service detail, gallery, reviews, similar services |
| `/companies` | `companies/page.tsx` | Company directory |
| `/company/[id]` | `company/[id]/page.tsx` | Company public profile |
| `/company/dashboard` | `company/dashboard/page.tsx` | Company dashboard (Kanban, stats, services, portfolio) |
| `/company/catalog` | `company/catalog/page.tsx` | Company service catalog view |
| `/my-requests` | `my-requests/page.tsx` | Client request list with offers, timeline |
| `/chat` | `chat/page.tsx` | Chat inbox |
| `/chat/[requestId]` | `chat/[requestId]/page.tsx` | Chat thread with SSE |
| `/favorites` | `favorites/page.tsx` | Saved services |
| `/compare` | `compare/page.tsx` | Side-by-side service comparison |
| `/notifications` | `notifications/page.tsx` | Notification center |
| `/profile` | `profile/page.tsx` | User profile edit |
| `/settings` | `settings/page.tsx` | Password/security settings |
| `/billing` | `billing/page.tsx` | **COMPANY ONLY** — billing/plans (clients redirected away) |
| `/guide` | `guide/page.tsx` | FAQ / Help center with animated "how it works" |
| `/about` | `about/page.tsx` | About page with architecture diagram |
| `/verify-email` | `verify-email/page.tsx` | Email verification result |
| `/forgot-password` | `forgot-password/page.tsx` | Password reset request |
| `/reset-password` | `reset-password/page.tsx` | Set new password |
| `/admin/*` | `admin/` | Admin panel (users, services, requests, audit, promo) |
| `/payment/[requestId]` | `payment/[requestId]/page.tsx` | **COMPANY ONLY** — payment flow |

---

## Key Components

| File | Purpose |
|------|---------|
| `components/auth/AuthProvider.tsx` | React context, `useAuth()`, session persistence |
| `components/auth/AuthModal.tsx` | Login/register modal with reCAPTCHA, email verify screen |
| `components/nav/MainNavbar.tsx` | Sticky navbar: search (Cmd+K), theme, i18n, notifications, user dropdown |
| `components/MobileNav.tsx` | Bottom nav for mobile |
| `components/ClientSidebar.tsx` | Client dashboard sidebar (My Requests, Chat, Favorites, Notifications, Profile) |
| `components/SettingsSidebar.tsx` | Settings sidebar (Profile, Security only — no billing for clients) |
| `components/Footer.tsx` | 4-column footer with all page links |
| `components/OrgCard.tsx` | Service card (favorite, compare, request button) |
| `components/RequestCreateDialog.tsx` | Multi-step request creation dialog |
| `components/CompareContext.tsx` + `CompareBar.tsx` | Compare up to 3 services |
| `components/filters/FilterBar.tsx` | Full filter panel (category, city, price, rating) |
| `components/company/KanbanBoard.tsx` | Kanban for company request management |
| `components/company/ServicesManagement.tsx` | Service CRUD in dashboard |
| `components/company/ServiceEditModal.tsx` | Service create/edit form |
| `components/company/CompanyStatistics.tsx` | Charts and stats |
| `components/StatusBadge.tsx` | Unified request status badge |
| `components/OfferDialog.tsx` | Offer submission dialog |
| `components/OfflineToast.tsx` | Network status indicator |

---

## Business Logic

### Request Lifecycle
```
Client creates Request (NEW, expires in 14 days)
  → Companies see unassigned requests matching their category + city
  → Company submits Offer (PENDING)
  → Client accepts best Offer → Request becomes ACCEPTED, other offers → REJECTED
  → Company updates: ACCEPTED → IN_PROGRESS → COMPLETED
  → Client rates (1-5 stars) → Company average rating recalculated across all services
```

### Notifications
- `lib/use-notifications.ts` — polls `GET /api/requests` every 30s, builds notification items
- `GET /api/notifications/count` — fast endpoint for badge count
- Guard: only fires if `localStorage.getItem("session:user")` exists (prevents 401 loop)

### File Uploads
- `lib/upload.ts` — magic-byte validation, local disk OR S3-compatible (via S3_* env vars)
- Local: `public/uploads/images/` and `public/uploads/audio/`
- Served via `GET /api/files/[...path]/route.ts`
- Before/After photos: stored in `public/slides/` (apartment-before.jpg, car-after.jpg, etc.)

### Real-time Chat
- SSE at `GET /api/chat/[requestId]/stream`
- Polls DB every 3 seconds for new messages since last timestamp
- Auto-marks received messages as read
- Cleans up on `request.signal` abort

### Email Flow
- `lib/email.ts` — 6 templates via Nodemailer
- Mailtrap SMTP for dev (credentials in .env)
- Triggers: register, verify-email, forgot-password, new-offer, offer-accepted, job-completed

### i18n
- `next-intl` with `app/[locale]/` routing
- Locales: ru, en, kk
- Config: `i18n/routing.ts`, `i18n/request.ts`, `i18n/config.ts`
- Language switcher in navbar

---

## What Was REMOVED (don't add back)

| Feature | Why Removed |
|---------|-------------|
| `AiRequestBot.tsx` | OpenRouter free tier rate limits made it unreliable |
| `app/api/ai/` (both routes) | Same reason — AI features removed from frontend |
| AI service summary | Removed |
| Billing for clients | Remont.kz is **free for clients**. Billing page only for companies. |
| `/my-payments` for clients | Same reason |
| Payment button in my-requests | Same reason |
| Billing link in client navbar | Same reason |
| Billing in SettingsSidebar | Same reason |
| Admin role visible to users | Admin panel exists at `/admin/*` but no UI link for regular users |
| reCAPTCHA badge | Hidden via CSS (`.grecaptcha-badge { visibility: hidden }`). Disclosure in footer. |

---

## Key Files & Patterns

### `lib/api.ts`
ApiClient singleton. Key methods: `getServices`, `createRequest`, `makeOffer`, `acceptOffer`, `rateRequest`, `getChatInbox`, `uploadAvatar`, `deleteAccount`, `getNotificationCount`.
After any API change, add the corresponding method here.

### `lib/types.ts`
All frontend TypeScript types. `ServiceCategory` has 10 values. `OfferStatus: "pending"|"accepted"|"rejected"`. `RequestStatus: "new"|"accepted"|"in_progress"|"completed"`.

### `lib/utils.ts`
`cn()`, `fmtNum()`, `formatBudget()`, `timeAgo()`, `sanitizeText()`, `CATEGORY_COLORS`, `CATEGORY_SHORT`.

### `lib/categories.ts`
`TopCategory = "AUTOMOBILES"|"REAL_ESTATE"|"OTHER"` (for CategoryFilter component hierarchy).
New ServiceCategory values (plumbing, electrical, etc.) map to these 3 top-level categories via `CATEGORY_REVERSE_MAP` in `ServiceEditModal.tsx`.

### Homepage (`app/[locale]/page.tsx`)
Full landing page — ALL animations use `FadeUp`, `FadeLeft`, `FadeRight`, `ScaleIn`, `AnimatedBar` components defined at top of file.
Side navigation: `SectionNav` component with `IntersectionObserver` per section.
Sections with IDs: `hero`, `before-after`, `stats`, `categories`, `services`, `how-it-works`, `why-us`, `testimonials`, `cta`.
Before/After slider auto-cycles every 5s, pauses on hover. Images from `public/slides/`.

---

## Demo Accounts (after `npm run db:seed`)
Password for all: `password123`

| Role | Email |
|------|-------|
| Company | stroymast@remont.kz |
| Company | autocity@remont.kz |
| Client | asel@remont.kz |
| Client | dmitry@remont.kz |

---

## Cron & Deployment

- `vercel.json` — hourly cron for `GET /api/requests/expire`
- `Dockerfile` + `docker-compose.yml` — for containerised deployment
- `.github/workflows/ci.yml` — lint, type-check, test, build with Postgres service
- `next.config.js` — `output: "standalone"`, remotePatterns for images (no wildcard `**`)

---

## Common Gotchas

1. **After schema changes**: always run `npm run db:push && npm run db:generate` or TypeScript errors will be confusing.
2. **New ServiceCategory**: update the enum in schema + `lib/types.ts` + `fromDbCategory()` in `lib/api.ts` + all three `categoryMap` objects in service/request routes + `CATEGORY_COLORS` in utils + `CATEGORY_SHORT` in utils + `ServiceEditModal.tsx` CATEGORY_REVERSE_MAP.
3. **401 redirect loop**: the 401 handler in `lib/api.ts` only redirects when `hadSession` is true AND endpoint is not `/auth/login|register|forgot-password|reset-password`.
4. **useNotifications race condition**: the hook checks `localStorage.getItem("session:user")` before firing. Has a 300ms delay on first load to let AuthProvider write the token.
5. **Billing/Payment pages** redirect clients to home. Don't add payment UI for clients anywhere.
6. **reCAPTCHA badge** is intentionally hidden via globals.css. Required disclosure is in Footer.tsx.
7. **Before/After slider** images live in `public/slides/` with naming: `apartment-before.jpg`, `apartment-after.jpg`, `car-before.jpg`, `car-after.jpg`, `bag-before.jpg`, `bag-after.jpg`, `headphones-before.jpg`, `headphones-after.jpg`, `watch-before.jpg`, `watch-after.jpg`.
8. **Password requirements**: min 8 chars + at least 1 digit (enforced in register, change-password, reset-password routes AND reset-password page).
