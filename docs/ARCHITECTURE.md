# Архитектура

## Стек

| Слой | Технология |
|------|-----------|
| Фреймворк | Next.js 14 (App Router) |
| Язык | TypeScript |
| База данных | PostgreSQL |
| ORM | Prisma + `@prisma/adapter-pg` (driver adapter) |
| Аутентификация | JWT (stateless), bcryptjs |
| UI | shadcn/ui + Tailwind CSS |
| Email | Nodemailer |
| AI | Claude API (request-bot + AI summary) |
| Анимации | Framer Motion |
| Уведомления | Sonner (toast) |
| Геокодинг | `lib/geocode.ts` |

## Монорепо — один проект

Фронтенд и бэкенд живут в одном Next.js приложении. Нет отдельного сервера.

```
app/api/**          → Backend (route.ts файлы = REST API)
app/**/page.tsx     → Frontend (React компоненты, SSR/CSR)
lib/                → Общий код (типы, утилиты, DB-клиент)
```

## База данных

Prisma используется с **driver adapter** (не стандартный Prisma engine):

```ts
// lib/db.ts — singleton с pg.Pool
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })
```

Клиент кэшируется на `globalThis` чтобы пережить HMR в dev-режиме.

## Аутентификация

Полностью stateless JWT:

- Токен хранится в `localStorage` под ключом `session:user`
- Формат: `{ token, id, email, role, name, ... }`
- API роуты извлекают токен из `Authorization: Bearer <token>`
- **Нет** Next.js middleware-level auth guard — только per-route проверки

```ts
// lib/middleware.ts
requireAuth()       // любой авторизованный
requireClient()     // только CLIENT
requireCompany()    // только COMPANY
assertEmailVerified()  // email должен быть подтверждён
```

## Данные — Frontend → Backend

Весь API-доступ идёт через singleton `api` из `lib/api.ts`:

```ts
import { api } from "@/lib/api"

await api.getServices({ category: "plumbing", city: "Almaty" })
await api.createRequest({ description: "...", category: "plumbing" })
```

`ApiClient` автоматически подставляет JWT из localStorage и нормализует enum-ы.

## Enum нормализация

Prisma хранит enum-ы в `SCREAMING_SNAKE_CASE`, фронтенд использует `lowercase/kebab`:

| Prisma | Frontend |
|--------|----------|
| `REAL_ESTATE` | `"real-estate"` |
| `IN_PROGRESS` | `"in_progress"` |
| `COMPLETED` | `"completed"` |

Конвертация: `fromDbCategory()` и `fromDbStatus()` в `lib/api.ts`.
При добавлении новых enum-значений — обновлять эти функции и `lib/types.ts`.

## Загрузка файлов

- Хранятся локально в `public/uploads/`
- API: `POST /api/messages/upload`
- Конфиг: `UPLOAD_DIR`, `MAX_FILE_SIZE`, `ALLOWED_IMAGE_TYPES`, `ALLOWED_AUDIO_TYPES` в env

## Rate Limiting

`lib/rate-limit.ts` — in-memory rate limiting (сбрасывается при рестарте сервера).
Применяется в: login, register, forgot-password, messages, offers.

## Real-time (SSE)

Чат использует Server-Sent Events:
- `GET /api/chat/[requestId]/stream` — SSE стрим новых сообщений
- Фронтенд подключается через `EventSource`

## Email

`lib/email.ts` — Nodemailer. Письма:
- Верификация email (`sendVerificationEmail`)
- Сброс пароля (`sendPasswordResetEmail`)
- Приветствие (`sendWelcomeEmail`)
- Новый оффер (`sendNewOfferEmail`)
- Заявка принята (`sendRequestAcceptedEmail`)
- Новая заявка (для компании) (`sendNewRequestEmail`)
- Работа завершена (`sendJobCompletedEmail`)

## CORS

`middleware.ts` добавляет CORS-заголовки только к `/api/*`.
`CORS_ORIGIN` env var (по умолчанию `http://localhost:5173`).

## Переменные окружения (основные)

```env
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET            # JWT signing secret
SMTP_HOST/PORT/USER/PASS  # Email
CORS_ORIGIN           # Allowed frontend origin
UPLOAD_DIR            # Path for file uploads
NEXT_PUBLIC_API_URL   # Public API base URL
```
