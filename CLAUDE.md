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
| `services/`, `services/[id]` | CRUD for services (company-only write) |
| `requests/`, `requests/[id]` | Client creates, company updates status |
| `messages/`, `messages/upload` | Chat messages + file upload (image/audio) |

### Frontend data access
All API calls go through the singleton `api` object from [lib/api.ts](lib/api.ts) (`ApiClient` class). It reads the token from `localStorage` and normalises Prisma SCREAMING_SNAKE_CASE enums to lowercase/kebab-case used in frontend types ([lib/types.ts](lib/types.ts)).

### Enum mapping
Prisma enums use `SCREAMING_SNAKE_CASE` (e.g. `REAL_ESTATE`, `IN_PROGRESS`). Frontend types use lowercase/kebab (`"real-estate"`, `"in_progress"`). Conversion happens in `normalizeService` / `normalizeRequest` in `lib/api.ts` and must be maintained when adding new enum values.

### Key components
- `components/auth/AuthProvider.tsx` — React context for current user session
- `components/auth/AuthModal.tsx` — Login/register modal
- `components/auth/ProtectedRoute.tsx` — Client-side role guard
- `components/company/` — Company dashboard panels (services, requests management)
- `components/nav/` — Main and secondary navbars

### File uploads
Uploaded files are stored locally under `public/uploads/`. The upload API route is `app/api/messages/upload`. `UPLOAD_DIR`, `MAX_FILE_SIZE`, `ALLOWED_IMAGE_TYPES`, `ALLOWED_AUDIO_TYPES` are configured via env.

### CORS
`middleware.ts` adds CORS headers only to `/api/*`. The allowed origin is `CORS_ORIGIN` env var (defaults to `http://localhost:5173`).
