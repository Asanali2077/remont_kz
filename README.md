# Remont.kz — Repair & Renovation Marketplace

A full-stack marketplace connecting clients with verified repair and renovation contractors across Kazakhstan. Diploma project 2026.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY, SMTP_*

# 3. Push schema to database
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

After running `npm run db:seed` (password: `password123`):

| Role | Email |
|------|-------|
| Company | stroymast@remont.kz |
| Company | autocity@remont.kz |
| Client | asel@remont.kz |
| Client | dmitry@remont.kz |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma 7 (driver adapter pattern) |
| Auth | JWT + bcrypt |
| AI | Anthropic Claude API |
| Email | Nodemailer (Mailtrap / Gmail) |
| Real-time | Server-Sent Events (SSE) |
| Animation | Framer Motion |
| Charts | Recharts |

---

## Architecture

```
remont_kz/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (35+ endpoints)
│   ├── repair/             # Service catalog
│   ├── company/            # Company pages + dashboard
│   ├── my-requests/        # Client dashboard
│   ├── chat/               # Messaging
│   └── ...
├── components/             # React components
│   ├── company/            # Company-specific
│   ├── auth/               # Authentication
│   └── ...
├── lib/                    # Shared utilities
│   ├── api.ts              # API client (singleton)
│   ├── auth.ts             # JWT + bcrypt
│   ├── db.ts               # Prisma client
│   ├── email.ts            # Email templates
│   ├── middleware.ts        # Auth middleware
│   ├── utils.ts            # Shared utilities
│   └── use-notifications.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

**Key patterns:**
- Stateless JWT — tokens in `localStorage`, verified per-request
- Prisma with `@prisma/adapter-pg` driver adapter
- SSE for real-time chat (Vercel-compatible)
- `sanitizeText()` strips HTML on all user input
- Rate limiting on auth endpoints (in-memory Map)

---

## Available Scripts

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run test          # Unit tests (Vitest)
npm run db:push       # Push schema (no migration)
npm run db:seed       # Seed demo data
npm run db:studio     # Prisma Studio GUI
```

---

## Environment Variables

See `.env.example` for full reference.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (32+ chars) |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL |
| `SMTP_HOST/PORT/USER/PASS` | Optional | Email sending |

> **File uploads:** Stored in `public/uploads/`. On Vercel, this resets per deploy. For production, use Cloudinary or S3.

---

## Database Schema

8 models: `User`, `Service`, `ServiceImage`, `Request`, `RequestOffer`, `Message`, `Favorite`, `AdminCompany`

---

## Key Features

- JWT auth, email verification, password reset, rate limiting
- Service catalog: filters, sorting, list/grid view, comparison
- Multi-step request wizard, offer system, status timeline
- Real-time chat via SSE, file attachments, read receipts
- AI: service summaries, request bot (Claude API)
- Company dashboard: Kanban, statistics, CSV export
- Email notifications for key events
- PWA manifest, dynamic sitemap, SEO metadata
- 14/14 unit tests passing
