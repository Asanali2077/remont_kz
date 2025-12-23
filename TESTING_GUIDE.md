# Testing Guide - Remont.kz (Next.js 14 + Prisma + JWT)

Use this checklist to verify the full client and company flows. All commands run from repo root.

## 1) Environment Setup
- Copy `.env.example` (or create `.env`) with:
  - `DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/remont_kz"`
  - `JWT_SECRET="change-me-please"`
  - `NEXT_PUBLIC_API_URL="http://localhost:3000/api"`
  - Optional: `JWT_EXPIRES_IN="7d"`
- Ensure PostgreSQL is running and the database exists (`remont_kz`).

## 2) Install & Database
```bash
npm install
npm run db:push     # prisma db push
npm run db:seed     # loads test accounts & demo data
```

## 3) Test Accounts
Clients
- client1@remont.kz / Client123!
- client2@remont.kz / Client123!

Companies
- company1@remont.kz / Company123!
- company2@remont.kz / Company123!

Notes:
- Each company has a profile and 3 services with images, varied categories, cities, prices, ratings.
- Requests exist across cities with NEW / IN_PROGRESS / COMPLETED (green) statuses.
- Messages include text + image placeholder + audio placeholder.
- Subscriptions seeded for monthly / quarterly / semiannual / yearly equivalents.

## 4) How to Test – Client Flow
1) Login with a client (e.g., client1@remont.kz / Client123!).
2) Browse services; verify filtering by city, price, rating, category.
3) Open service cards; confirm images and ratings show.
4) Send a request to a company; expect status NEW.
5) Open chat for that request:
   - Send text; see it appear.
   - Verify seeded image/audio messages are shown.
6) Confirm translations (Kazakh/Russian) toggle via language switcher.

## 5) How to Test – Company CRM Flow
1) Login with a company (e.g., company1@remont.kz / Company123!).
2) Confirm redirect into CRM dashboard (protected route).
3) Analytics tab: charts show totals, requests by status, revenue by month, city breakdown.
4) Services tab:
   - See 3 seeded services with images.
   - Create, edit, delete a service; upload an image (local placeholder is fine).
5) Requests tab:
   - View incoming requests (multiple cities, mixed statuses).
   - Change status to COMPLETED (should render green).
6) Messages tab:
   - View conversation history (text, image, audio placeholders).
   - Reply as company.
7) Personal Account tab:
   - Subscription status visible (monthly/quarterly/semiannual/yearly).
   - Transactions list present.

## 6) Common Issues & Fixes
- Migrations: If schema changed, run `npm run db:push` again.
- Seed duplicates: Seed is idempotent for the test users; rerun `npm run db:seed`.
- JWT errors: Ensure `JWT_SECRET` is set and restart `npm run dev`.
- File upload 413: Use small placeholder files; adjust body size in Next config if needed.
- Wrong role redirect: Clear `localStorage` (session:user) and log in again.

## 7) Reset Database
```bash
npm run db:push     # Re-sync schema
npm run db:seed     # Recreate test data
```
If you need a full reset: drop/create the database, then rerun the two commands above.

## 8) Demo / Defense Prep
- Verify `npm run lint` and `npm run type-check` are clean.
- Start app: `npm run dev` (or `npm run build && npm run start`).
- Log in with company1 to demo CRM; client1 to demo public flow.
- Show protected routes (company-only CRM) and language switcher.
- Keep TESTING_GUIDE.md open as your walkthrough script.

