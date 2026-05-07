# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run type-check   # TypeScript check without emitting

npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:migrate   # Apply migrations (prisma migrate dev)
npm run db:push      # Push schema without migration (prisma db push)
npm run db:seed      # Seed with sample data (tsx prisma/seed.ts)
npm run db:studio    # Open Prisma Studio GUI
```

No test framework is configured.

## Architecture

Single Next.js 14 (App Router) application — frontend and backend in one repo.

### Database layer
- PostgreSQL via `@prisma/adapter-pg` (driver adapter pattern, not the default Prisma engine)
- Prisma client is instantiated once with a `pg.Pool` in [lib/db.ts](lib/db.ts) and cached on `globalThis` to survive HMR
- Schema: `User` (CLIENT | COMPANY roles) → `Service` → `ServiceImage`, `Request`, `Message`

### Auth
- JWT-based, stateless. Token is stored in `localStorage` under the key `session:user` as `{ token, ...user }`
- [lib/auth.ts](lib/auth.ts) handles hashing (bcryptjs) and JWT sign/verify
- API routes extract the token manually from `Authorization: Bearer <token>` — there is no Next.js middleware-level auth guard, only per-route checks

### API routes (`app/api/`)
| Route | Purpose |
|---|---|
| `auth/register`, `auth/login`, `auth/me` | Registration, login, current user |
| `auth/profile` | GET/PUT user profile |
| `auth/verify-email` | Email verification via token |
| `auth/forgot-password`, `auth/reset-password` | Password reset flow |
| `services/`, `services/[id]` | CRUD for services (company-only write) |
| `requests/`, `requests/[id]` | Client creates, company updates status |
| `requests/[id]/offer` | Company makes/deletes offer on a request |
| `requests/[id]/accept-offer` | Client accepts a company's offer |
| `requests/[id]/rate` | Client rates completed work |
| `requests/expire` | Mark expired requests (called by cron) |
| `messages/`, `messages/upload`, `messages/mark-read` | Chat + file upload + read receipts |
| `chat/`, `chat/[requestId]/stream` | Chat inbox + SSE real-time stream |
| `ai/request-bot`, `ai/summary` | AI assistant for requests + service summaries |
| `favorites/`, `favorites/[serviceId]` | Client's saved services |
| `notifications/count` | Unread messages + new offers count |
| `companies/` | List all companies |
| `health/` | DB health check |

### Frontend data access
All API calls go through the singleton `api` object from [lib/api.ts](lib/api.ts) (`ApiClient` class). It reads the token from `localStorage` and normalises Prisma SCREAMING_SNAKE_CASE enums to lowercase/kebab-case used in frontend types ([lib/types.ts](lib/types.ts)).

### Enum mapping
Prisma enums use `SCREAMING_SNAKE_CASE` (e.g. `REAL_ESTATE`, `IN_PROGRESS`). Frontend types use lowercase/kebab (`"real-estate"`, `"in_progress"`). Conversion happens in `normalizeService` / `normalizeRequest` in `lib/api.ts` and must be maintained when adding new enum values.

### Key components
- `components/auth/AuthProvider.tsx` — React context for current user session (`useAuth`)
- `components/auth/AuthModal.tsx` — Login/register modal
- `components/company/ProtectedRoute.tsx` — Client-side role guard
- `components/company/` — Company dashboard: `KanbanBoard`, `ServicesManagement`, `ServiceEditModal`, `CompanyStatistics`, `CompanyOverview`, `RequestsManagement`, `OnboardingChecklist`
- `components/nav/MainNavbar.tsx` — Sticky top nav with search, theme toggle, notifications bell
- `components/MobileNav.tsx` — Bottom nav for mobile
- `components/OrgCard.tsx` — Service listing card (favorite, compare, create request)
- `components/RequestCreateDialog.tsx` — Multi-step dialog for creating a request
- `components/AiRequestBot.tsx` — AI chat assistant for request creation
- `components/CompareContext.tsx` + `CompareBar.tsx` — Compare up to 3 services
- `components/filters/FilterBar.tsx` — Full filter panel for the services catalog
- `components/ClientSidebar.tsx` — Client dashboard sidebar

### Business logic
- **Request flow**: Client creates Request → Companies see unassigned requests matching their category/city → Company makes Offer → Client accepts → status: `new → accepted → in_progress → completed` → Client rates
- **Middleware guards**: `requireAuth()`, `requireClient()`, `requireCompany()`, `assertEmailVerified()`
- **Rate limiting**: In-memory (`lib/rate-limit.ts`), applied to login, register, forgot-password, messages, offers
- **Real-time chat**: SSE via `GET /api/chat/[requestId]/stream`, frontend uses `EventSource`
- **AI features**: Request creation bot (`/api/ai/request-bot`) + service AI summary (`/api/ai/summary`)
- **Email notifications**: Sent on register, offer made, offer accepted, job completed (Nodemailer)
- **Geocoding**: `lib/geocode.ts` — converts service address to lat/lng on create/update

### Pages (app router)
| URL | Purpose |
|---|---|
| `/` | Homepage with hero, animations, featured services |
| `/repair` | Services catalog with filters, sort, geolocation |
| `/repair/[id]` | Service detail with gallery, reviews, AI summary |
| `/company` | Company dashboard (protected: COMPANY only) |
| `/my-requests` | Client's requests with offers and timeline |
| `/chat`, `/chat/[requestId]` | Chat inbox and thread |
| `/favorites` | Saved services |
| `/compare` | Side-by-side service comparison |
| `/notifications` | Notifications center |
| `/guide` | FAQ / Help center |
| `/profile`, `/settings` | Profile and security settings |

### File uploads
Uploaded files are stored locally under `public/uploads/`. The upload API route is `app/api/messages/upload`. `UPLOAD_DIR`, `MAX_FILE_SIZE`, `ALLOWED_IMAGE_TYPES`, `ALLOWED_AUDIO_TYPES` are configured via env.

### CORS
`middleware.ts` adds CORS headers only to `/api/*`. The allowed origin is `CORS_ORIGIN` env var (defaults to `http://localhost:5173`).

## Documentation
Full project docs in `docs/`:
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Stack, auth, DB setup, patterns
- [docs/DATABASE.md](docs/DATABASE.md) — All models, enums, relations
- [docs/API.md](docs/API.md) — Every API endpoint with params and auth
- [docs/COMPONENTS.md](docs/COMPONENTS.md) — All components and hooks
- [docs/PAGES.md](docs/PAGES.md) — All pages and their structure
