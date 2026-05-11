# Phase 1 — Trust & Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add company verification badge, reCAPTCHA v3 on auth forms, and private file access — improving trust and security for the remont_kz marketplace.

**Architecture:** Three independent improvements: (1) `isVerified` flag on User model surfaced through admin panel and OrgCard badge, (2) reCAPTCHA v3 token checked on every login/register request, (3) file uploads served through an authenticated API route instead of static `public/`.

**Tech Stack:** Prisma migrations, Next.js API routes, Google reCAPTCHA v3 (`react-google-recaptcha-v3`), Node.js `fs.createReadStream`.

---

## File Map

| Action | File |
|---|---|
| Modify | `prisma/schema.prisma` |
| Modify | `app/api/admin/users/[id]/route.ts` |
| Modify | `app/api/services/route.ts` |
| Modify | `app/api/services/[id]/route.ts` |
| Modify | `components/OrgCard.tsx` |
| Modify | `app/[locale]/repair/[id]/page.tsx` |
| Modify | `app/[locale]/admin/users/page.tsx` |
| Modify | `components/admin/UserTable.tsx` |
| Modify | `app/api/auth/login/route.ts` |
| Modify | `app/api/auth/register/route.ts` |
| Modify | `components/auth/AuthModal.tsx` |
| Create | `app/api/files/[...path]/route.ts` |
| Modify | `lib/upload.ts` |
| Modify | `lib/types.ts` |
| Modify | `.env.example` |

---

## Task 1: Add `isVerified` to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add field to User model**

Open `prisma/schema.prisma`. Find the `User` model. Add after `isBlocked Boolean @default(false)`:

```prisma
isVerified       Boolean   @default(false)
```

- [ ] **Step 2: Run migration**

```bash
npm run db:migrate
```

When prompted for migration name enter: `add_user_is_verified`

Expected output: `✔ Your database is now in sync with your schema.`

- [ ] **Step 3: Verify migration applied**

```bash
npm run db:studio
```

Open Prisma Studio, check `User` table has `isVerified` column. Close Studio (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add isVerified field to User model"
```

---

## Task 2: Expose `isVerified` in admin users API

**Files:**
- Modify: `app/api/admin/users/[id]/route.ts`

- [ ] **Step 1: Add `isVerified` to GET select**

In `app/api/admin/users/[id]/route.ts`, find the `select` object inside `prisma.user.findUnique`. Add `isVerified: true` to the select:

```ts
select: {
  id: true, email: true, role: true, name: true, phone: true,
  avatarUrl: true, address: true, emailVerified: true,
  isBlocked: true, blockReason: true, isVerified: true,
  lastActiveAt: true, createdAt: true,
  _count: { select: { clientRequests: true, services: true } },
},
```

- [ ] **Step 2: Add `isVerified` to allowed PATCH fields**

In the same file, find the `allowed` array in the PATCH handler:

```ts
const allowed = ["isBlocked", "blockReason", "name", "emailVerified", "isVerified"] as const;
```

- [ ] **Step 3: Update audit action for verify**

After the `action` variable assignment in PATCH, add the verify case:

```ts
const action =
  body.isBlocked === true ? "block_user" :
  body.isBlocked === false ? "unblock_user" :
  body.isVerified === true ? "verify_company" :
  body.isVerified === false ? "unverify_company" :
  "edit_user";
```

- [ ] **Step 4: Add `isVerified` to admin/users list GET select**

Open `app/api/admin/users/route.ts`. Find the `select` inside `prisma.user.findMany`. Add `isVerified: true`:

```ts
select: {
  id: true, email: true, role: true, name: true, phone: true,
  avatarUrl: true, emailVerified: true, isBlocked: true, blockReason: true,
  isVerified: true, createdAt: true, lastActiveAt: true,
  _count: { select: { clientRequests: true, services: true } },
},
```

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/users/
git commit -m "feat: add isVerified to admin users API"
```

---

## Task 3: Add `isVerified` to services API responses

**Files:**
- Modify: `app/api/services/route.ts`
- Modify: `app/api/services/[id]/route.ts`

- [ ] **Step 1: Update company select in services list API**

Open `app/api/services/route.ts`. Find the `company` include (around line 134):

```ts
company: { select: { id: true, name: true, email: true, phone: true, isVerified: true } },
```

- [ ] **Step 2: Update company select in service detail API**

Open `app/api/services/[id]/route.ts`. Find the `company` select block and add `isVerified: true`:

```ts
company: {
  select: {
    id: true, name: true, email: true, phone: true, avatarUrl: true,
    address: true, isVerified: true,
    // keep existing fields
  },
},
```

- [ ] **Step 3: Update `Service` type in `lib/types.ts`**

Open `lib/types.ts`. Find the `Service` type (or interface). Add `isVerified` to the nested company object:

```ts
company?: {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isVerified: boolean;
  // keep existing fields
};
```

- [ ] **Step 4: Commit**

```bash
git add app/api/services/ lib/types.ts
git commit -m "feat: include isVerified in service API company data"
```

---

## Task 4: Add verification badge to OrgCard

**Files:**
- Modify: `components/OrgCard.tsx`

- [ ] **Step 1: Add verified badge next to company name**

Open `components/OrgCard.tsx`. Find the line that renders `service.company?.name` (around line 156). Replace that section with:

```tsx
import { BadgeCheck } from "lucide-react";

// Inside the component, find the company name line and update to:
<div className="flex items-center gap-1">
  <span>{service.company?.name}</span>
  {service.company?.isVerified && (
    <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" aria-label="Верифицированная компания" />
  )}
</div>
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000/repair`. Confirm cards render correctly (no badge for unverified, badge for verified). Stop server.

- [ ] **Step 3: Commit**

```bash
git add components/OrgCard.tsx
git commit -m "feat: add verified badge to OrgCard"
```

---

## Task 5: Add verification badge to service detail page

**Files:**
- Modify: `app/[locale]/repair/[id]/page.tsx`

- [ ] **Step 1: Add badge next to company name on detail page**

Open `app/[locale]/repair/[id]/page.tsx`. Find where `company.name` is rendered in the company section. Add badge:

```tsx
import { BadgeCheck } from "lucide-react";

// Next to company name:
<div className="flex items-center gap-1.5">
  <span className="font-semibold">{service.company?.name}</span>
  {service.company?.isVerified && (
    <BadgeCheck className="h-5 w-5 text-blue-500" aria-label="Верифицированная компания" />
  )}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add "app/[locale]/repair/[id]/page.tsx"
git commit -m "feat: add verified badge to service detail page"
```

---

## Task 6: Add verify/unverify button in admin panel

**Files:**
- Modify: `components/admin/UserTable.tsx`
- Modify: `app/[locale]/admin/users/page.tsx`

- [ ] **Step 1: Add `isVerified` to `AdminUser` type**

Open `components/admin/UserTable.tsx`. Find the `AdminUser` type/interface. Add:

```ts
export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBlocked: boolean;
  blockReason: string | null;
  isVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
  // keep existing fields
}
```

- [ ] **Step 2: Add verify/unverify action column**

In `UserTable.tsx`, find the actions dropdown (where block/unblock button is). Add verify toggle after it:

```tsx
{row.role === "COMPANY" && (
  <DropdownMenuItem onClick={() => onVerify(row.id, !row.isVerified)}>
    {row.isVerified ? (
      <><BadgeCheck className="h-4 w-4 mr-2 text-blue-500" />Снять верификацию</>
    ) : (
      <><BadgeCheck className="h-4 w-4 mr-2" />Верифицировать</>
    )}
  </DropdownMenuItem>
)}
```

Add `onVerify: (id: string, value: boolean) => void` to the `UserTable` props interface.

- [ ] **Step 3: Implement `onVerify` handler in admin users page**

Open `app/[locale]/admin/users/page.tsx`. Add handler function:

```ts
const handleVerify = useCallback(async (id: string, value: boolean) => {
  if (!user?.token) return;
  await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
    body: JSON.stringify({ isVerified: value }),
  });
  load(page);
}, [user, page, load]);
```

Pass it to `UserTable`: `<UserTable ... onVerify={handleVerify} />`

- [ ] **Step 4: Show verified badge in user table**

In `UserTable.tsx`, add a verified column or inline badge in the name cell:

```tsx
<TableCell>
  <div className="flex items-center gap-1">
    {row.name ?? row.email}
    {row.isVerified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
  </div>
</TableCell>
```

- [ ] **Step 5: Test in browser**

```bash
npm run dev
```

Log in as admin (seed an admin user if needed: `npm run db:seed`). Go to `/admin/users`. Find a company, use dropdown to verify. Confirm badge appears on OrgCard at `/repair`. Stop server.

- [ ] **Step 6: Commit**

```bash
git add components/admin/UserTable.tsx "app/[locale]/admin/users/page.tsx"
git commit -m "feat: add verify/unverify company action in admin panel"
```

---

## Task 7: Integrate reCAPTCHA v3 — frontend

**Files:**
- Modify: `components/auth/AuthModal.tsx`
- Modify: `.env.example`

- [ ] **Step 1: Install `react-google-recaptcha-v3`**

```bash
npm install react-google-recaptcha-v3
```

Expected: package added to `package.json`.

- [ ] **Step 2: Add env vars**

Open `.env.example`. Add:

```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

Add the same keys with real values to your local `.env` file (get them from https://www.google.com/recaptcha/admin — register site with type "Score based (v3)", add `localhost` as allowed domain).

- [ ] **Step 3: Wrap app with `GoogleReCaptchaProvider`**

Open `app/[locale]/layout.tsx`. Import and wrap `children` with the provider:

```tsx
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

// In the JSX, wrap the children:
<GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
  {children}
</GoogleReCaptchaProvider>
```

- [ ] **Step 4: Execute reCAPTCHA in AuthModal before submit**

Open `components/auth/AuthModal.tsx`. Add hook and execute before API call:

```tsx
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

// Inside AuthModal component:
const { executeRecaptcha } = useGoogleReCaptcha();

// In submit() function, before the login/register call:
async function submit() {
  if (!executeRecaptcha) return;
  const recaptchaToken = await executeRecaptcha(mode === "login" ? "login" : "register");

  // Pass token to login/register:
  if (mode === "login") {
    await login(email, password, recaptchaToken);
  } else {
    const result = await register(email, password, role, name, phone, recaptchaToken);
    // ...rest of existing code
  }
}
```

- [ ] **Step 5: Update `login` and `register` in `AuthProvider` to accept and pass `recaptchaToken`**

Open `components/auth/AuthProvider.tsx`. Find the `login` and `register` functions. Add `recaptchaToken: string` parameter and include it in the request body:

```ts
// login function signature:
async function login(email: string, password: string, recaptchaToken: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, recaptchaToken }),
  });
  // ...rest unchanged
}

// register function signature:
async function register(email: string, password: string, role: string, name: string, phone: string, recaptchaToken: string) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role, name, phone, recaptchaToken }),
  });
  // ...rest unchanged
}
```

- [ ] **Step 6: Commit**

```bash
git add components/auth/AuthModal.tsx components/auth/AuthProvider.tsx "app/[locale]/layout.tsx" .env.example package.json package-lock.json
git commit -m "feat: add reCAPTCHA v3 to auth forms frontend"
```

---

## Task 8: Verify reCAPTCHA token on backend

**Files:**
- Modify: `app/api/auth/login/route.ts`
- Modify: `app/api/auth/register/route.ts`
- Create: `lib/recaptcha.ts`

- [ ] **Step 1: Create reCAPTCHA verification helper**

Create `lib/recaptcha.ts`:

```ts
export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (process.env.NODE_ENV === "development" && !token) return true;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY!,
      response: token,
    }),
  });

  const data = await res.json() as { success: boolean; score: number };
  return data.success && data.score >= 0.5;
}
```

- [ ] **Step 2: Add verification to login route**

Open `app/api/auth/login/route.ts`. After parsing the request body, add:

```ts
import { verifyRecaptcha } from "@/lib/recaptcha";

// Inside POST handler, after body parsing:
const { email, password, recaptchaToken } = body;

const captchaOk = await verifyRecaptcha(recaptchaToken ?? "");
if (!captchaOk) {
  return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
}
```

- [ ] **Step 3: Add verification to register route**

Open `app/api/auth/register/route.ts`. Same pattern:

```ts
import { verifyRecaptcha } from "@/lib/recaptcha";

const { email, password, role, name, phone, recaptchaToken } = body;

const captchaOk = await verifyRecaptcha(recaptchaToken ?? "");
if (!captchaOk) {
  return NextResponse.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
}
```

- [ ] **Step 4: Test login works end-to-end**

```bash
npm run dev
```

Open `http://localhost:3000`. Try logging in. Confirm no errors in console. Stop server.

- [ ] **Step 5: Commit**

```bash
git add lib/recaptcha.ts app/api/auth/login/route.ts app/api/auth/register/route.ts
git commit -m "feat: verify reCAPTCHA v3 token on login and register API routes"
```

---

## Task 9: Private file access route

**Files:**
- Create: `app/api/files/[...path]/route.ts`
- Modify: `lib/upload.ts`

- [ ] **Step 1: Create authenticated file serving route**

Create `app/api/files/[...path]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".mp3": "audio/mpeg",
  ".wav": "audio/wav", ".ogg": "audio/ogg", ".m4a": "audio/mp4",
  ".pdf": "application/pdf",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { path: pathParts } = await params;
  const filePath = path.resolve(UPLOAD_DIR, ...pathParts);

  if (!filePath.startsWith(UPLOAD_DIR)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME[ext] ?? "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: { "Content-Type": mimeType, "Cache-Control": "private, max-age=3600" },
  });
}
```

- [ ] **Step 2: Update `lib/upload.ts` to return `/api/files/` URLs**

Open `lib/upload.ts`. Find line 156:

```ts
url: `/uploads/${subfolder}/${filename}`,
```

Change to:

```ts
url: `/api/files/${subfolder}/${filename}`,
```

- [ ] **Step 3: Test file serving**

```bash
npm run dev
```

Upload a file in chat. Confirm the returned URL starts with `/api/files/`. Try accessing it directly in browser without auth → should return 401. Access it from the app (with auth) → should render correctly. Stop server.

- [ ] **Step 4: Commit**

```bash
git add "app/api/files/[...path]/route.ts" lib/upload.ts
git commit -m "feat: serve uploads through authenticated /api/files route"
```

---

## Verification Checklist

After all tasks complete, run through this checklist manually:

- [ ] `npm run type-check` — no TypeScript errors
- [ ] `npm run lint` — no lint errors
- [ ] Admin user with role COMPANY can be verified/unverified in `/admin/users`
- [ ] Verified company shows ✓ badge on `/repair` (OrgCard) and `/repair/[id]`
- [ ] Login and register work with reCAPTCHA in dev (token sent, no errors)
- [ ] `POST /api/auth/login` without `recaptchaToken` returns 400 in production (skip check in dev)
- [ ] Uploaded files return 401 when accessed without Authorization header
- [ ] Uploaded files serve correctly when accessed with valid JWT
