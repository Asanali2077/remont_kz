# Remont.kz — Repair & Renovation Marketplace

Full-stack marketplace connecting clients with verified repair and renovation contractors across Kazakhstan. Diploma project 2026.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, SMTP_PASS (Resend API key), reCAPTCHA keys

# 3. Push schema to database (no migration history)
npm run db:push

# 4. Generate Prisma client
npm run db:generate

# 5. Seed demo data (optional)
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

After running `npm run db:seed` (password for all: `password123`):

| Role | Email | Company |
|------|-------|---------|
| Company | stroymast@remont.kz | StroiMaster — REAL_ESTATE, Almaty |
| Company | autocity@remont.kz | AutoCity KZ — AUTOMOBILES, Astana |
| Company | electroserv@remont.kz | ElectroServ — ELECTRICAL, Almaty |
| Company | plumbing@remont.kz | PlumbingKZ — PLUMBING, Astana |
| Company | cleanpro@remont.kz | CleanPro — CLEANING, Almaty |
| Company | kazweld@remont.kz | KazWeld — WELDING, Almaty |
| Company | roofpro@remont.kz | RoofPro KZ — ROOFING, Astana |
| Company | paintmaster@remont.kz | PaintMaster — PAINTING, Almaty |
| Company | renovkz@remont.kz | RenovKZ — RENOVATION, Shymkent |
| Company | techmaster@remont.kz | TechMaster KZ — OTHER, Almaty |
| Client | asel@remont.kz | — |
| Client | dmitry@remont.kz | — |
| Client | zarina@remont.kz | — |
| Client | arman@remont.kz | — |
| Client | aibek@remont.kz | — |
| Client | nurgul@remont.kz | — |
| Admin | admin@remont.kz | password: `Admin123!` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma 7 (driver adapter + pool) |
| Auth | JWT stateless + bcrypt (12 rounds) |
| i18n | next-intl (ru / en / kk) |
| Email | Resend HTTP SDK |
| Real-time | Server-Sent Events (SSE) |
| Animation | Framer Motion |
| Charts | Recharts |
| Maps | Leaflet (react-leaflet) |
| Security | reCAPTCHA v3, rate limiting, Zod validation |

---

## Architecture

```
remont_kz/
├── app/
│   ├── [locale]/               # All pages (i18n routing)
│   │   ├── page.tsx            # Landing page
│   │   ├── repair/             # Service catalog + detail
│   │   ├── company/            # Company profile + dashboard
│   │   ├── companies/          # Company directory
│   │   ├── my-requests/        # Client dashboard
│   │   ├── chat/               # Messaging (SSE)
│   │   ├── favorites/          # Saved services
│   │   ├── compare/            # Side-by-side comparison
│   │   ├── profile/            # User profile
│   │   ├── settings/           # Security settings
│   │   ├── billing/            # Company billing (plans)
│   │   ├── guide/              # FAQ / Help center
│   │   ├── about/              # About page
│   │   └── admin/              # Admin panel
│   └── api/                    # 40+ API routes
├── components/                 # React components
│   ├── auth/                   # AuthProvider, AuthModal
│   ├── company/                # Dashboard, Kanban, charts
│   ├── nav/                    # Navbar, MobileNav
│   └── filters/                # FilterBar
├── lib/                        # Shared utilities
│   ├── api.ts                  # API client singleton
│   ├── auth.ts                 # JWT + bcrypt helpers
│   ├── db.ts                   # Prisma client (cached)
│   ├── email.ts                # Email templates (6 types)
│   ├── middleware.ts            # Auth guards per route
│   ├── types.ts                # All TypeScript types
│   ├── utils.ts                # cn(), fmtNum(), timeAgo()
│   ├── upload.ts               # File upload (local / S3)
│   └── use-notifications.ts    # Notification polling
├── prisma/
│   ├── schema.prisma           # 10 models
│   └── seed.ts                 # Demo data
└── messages/                   # i18n: ru.json, en.json, kk.json
```

**Key patterns:**
- Stateless JWT — tokens in `localStorage` as `session:user`
- Prisma with `@prisma/adapter-pg` driver adapter (pool-based)
- SSE for real-time chat (Vercel-compatible, no WebSockets)
- `sanitizeText()` strips HTML on all user input
- Rate limiting on auth endpoints (in-memory Map, cleanup every 5 min)
- Enum mapping: Prisma SCREAMING_SNAKE_CASE → frontend kebab-case via `fromDbCategory()`

---

## Available Scripts

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npm run type-check    # TypeScript check (run before commit)
npm run test          # Unit tests (Vitest)

npm run db:push       # Sync schema to DB (no migration history)
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:seed       # Seed demo data
npm run db:studio     # Prisma Studio GUI
```

> **After any schema change:** always run `npm run db:push && npm run db:generate`

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/remont_kz"

# Auth
JWT_SECRET="remont-kz-jwt-secret-2024-diploma-project"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="/api"

# Email — Resend HTTP SDK (SMTP_PASS = Resend API key)
SMTP_PASS=re_xxxxxxxxxxxx
SMTP_FROM="Remont.kz <onboarding@resend.dev>"

# reCAPTCHA v3 (login + register)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<site_key>
RECAPTCHA_SECRET_KEY=<secret_key>

# File uploads (optional S3, defaults to local disk)
# S3_ENDPOINT=
# S3_BUCKET=
# S3_KEY=
# S3_SECRET=
```

---

## Database Schema

10 models:

| Model | Purpose |
|-------|---------|
| `User` | CLIENT / COMPANY / ADMIN. Email verify, block, isVerified, avatarUrl, description |
| `Service` | Company listing. 10 categories, priceFrom/priceTo, city, tags, images, geo |
| `ServiceImage` | Up to 10 images per service, ordered |
| `Request` | Client request. Status: NEW→ACCEPTED→IN_PROGRESS→COMPLETED |
| `RequestOffer` | Company bid on a request. Unique per (request, company) |
| `Message` | Chat message. TEXT / IMAGE / AUDIO, read receipt |
| `Favorite` | Saved service. Unique per (user, service) |
| `Payment` | Mock payment tied to request. Supports promo codes |
| `AuditLog` | Admin action tracking |
| `PromoCode` | Discount codes (% off, maxUses, expiry) |

---

## Key Features

- JWT auth, email verification, password reset, reCAPTCHA v3, rate limiting
- Service catalog: category/city/price/rating filters, sort, list/grid/map view
- Side-by-side service comparison (up to 3)
- Multi-step request wizard, offer system, status timeline
- Real-time chat via SSE, image/audio attachments, read receipts
- Company dashboard: Kanban board, statistics charts, CSV export
- Favorites, notification center, activity heatmap
- Email notifications: new offer, offer accepted, job completed
- Admin panel: user management, audit logs, promo codes, service moderation
- PWA manifest, dynamic sitemap, SEO metadata
- i18n: Russian, English, Kazakh
- Leaflet map on service detail page

---

## Deployment

- `Dockerfile` + `docker-compose.yml` — containerised deployment
- `vercel.json` — hourly cron for `GET /api/requests/expire`
- `.github/workflows/ci.yml` — lint, type-check, test, build (with Postgres service)
- `next.config.js` — `output: "standalone"`

> **File uploads on Vercel:** local `public/uploads/` resets per deploy. Configure S3-compatible storage via `S3_*` env vars for production.
