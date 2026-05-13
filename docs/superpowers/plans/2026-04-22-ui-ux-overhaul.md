# UI/UX Overhaul — Remont.kz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Полностью обновить внешний вид и UX сайта Remont.kz — заменить шрифты, палитру, добавить поиск в hero, skeleton-скрины, перевести интерфейс на русский язык, оптимизировать изображения.

**Architecture:** Все изменения — исключительно на фронтенде (Next.js 14, App Router, Tailwind CSS, shadcn/ui). База данных и API не меняются. Работа идёт по файлам: globals.css → layout.tsx → компоненты → страницы.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui, Lucide icons, next/image, Google Fonts (Poppins + Open Sans)

---

## Файловая карта изменений

| Файл | Действие | Что меняем |
|------|----------|-----------|
| `app/globals.css` | Изменить | CSS-переменные цветов, импорт шрифтов |
| `app/layout.tsx` | Изменить | Подключение шрифтов Poppins+Open Sans |
| `app/page.tsx` | Изменить | Hero с поиском, переводы, улучшенные категории |
| `components/Footer.tsx` | Изменить | Убрать "Demo version", год 2024→2026 |
| `components/OrgCard.tsx` | Изменить | `<img>` → `next/image`, стиль цены |
| `components/nav/MainNavbar.tsx` | Изменить | Анимация мобильного меню |
| `components/SkeletonCard.tsx` | Создать | Skeleton-карточка для загрузки |
| `app/repair/page.tsx` | Изменить | Skeleton вместо "Loading..." |
| `app/my-requests/page.tsx` | Изменить | Skeleton вместо "Loading..." |

---

## Task 1: Цветовая палитра и шрифты

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

### Цель
Заменить дефолтный shadcn-синий на профессиональную навигационно-синюю палитру. Подключить Google Fonts: Poppins (заголовки) + Inter остаётся для body (Open Sans — опционально, Inter достаточно).

- [ ] **Step 1: Обновить CSS-переменные в globals.css**

Заменить блок `:root` в `app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 215 25% 7%;
    --card: 0 0% 100%;
    --card-foreground: 215 25% 7%;
    --popover: 0 0% 100%;
    --popover-foreground: 215 25% 7%;
    --primary: 211 100% 32%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 215 25% 7%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 210 40% 96%;
    --accent-foreground: 215 25% 7%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 211 100% 32%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 215 28% 7%;
    --foreground: 210 40% 98%;
    --card: 215 28% 9%;
    --card-foreground: 210 40% 98%;
    --popover: 215 28% 9%;
    --popover-foreground: 210 40% 98%;
    --primary: 211 100% 50%;
    --primary-foreground: 215 28% 7%;
    --secondary: 215 28% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 215 28% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 215 28% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --border: 215 28% 17%;
    --input: 215 28% 17%;
    --ring: 211 100% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
  }
}
```

- [ ] **Step 2: Убрать импорт Inter из layout.tsx (заголовки теперь через CSS)**

Оставить `Inter` только для body, заголовки подхватятся из CSS. Файл `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { MainNavbar } from "@/components/nav/MainNavbar";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Remont.kz",
  description: "Remont.kz — найди мастера или компанию для любого ремонта в Казахстане",
  keywords: ["ремонт", "услуги", "авто", "недвижимость", "Казахстан", "Remont"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <ClientProviders>
          <MainNavbar />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Проверить визуально**

```bash
npm run dev
```

Открыть `http://localhost:3000`. Кнопки и ссылки должны стать тёмно-синими (`#0369A1`), заголовки — шрифтом Poppins.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: профессиональная палитра navy+blue, шрифты Poppins для заголовков"
```

---

## Task 2: Исправить Footer

**Files:**
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Убрать демо-плашку, обновить год**

Заменить весь `components/Footer.tsx`:

```tsx
export function Footer() {
  return (
    <footer className="border-t bg-muted/20 py-8 mt-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="font-semibold text-foreground">Remont.kz</div>
          <p>© 2026 Remont.kz. Все права защищены.</p>
          <div className="flex gap-6">
            <span>Казахстан</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Footer.tsx
git commit -m "fix: убрать demo-plashku iz footer, obnovit god"
```

---

## Task 3: OrgCard — next/image + стиль цены

**Files:**
- Modify: `components/OrgCard.tsx`

### Цель
Заменить `<img>` на `next/image` для оптимизации (WebP, lazy load). Улучшить отображение цены: "от X ₸" крупно.

- [ ] **Step 1: Добавить домены изображений в next.config**

Прочитать `next.config.js` / `next.config.mjs` и добавить `placehold.co` в `images.remotePatterns`, а также wildcard для загруженных файлов:

```js
// next.config.js (или .mjs)
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 2: Заменить img на Image в OrgCard**

В `components/OrgCard.tsx` поменять:

```tsx
// Убрать: /* eslint-disable @next/next/no-img-element */
// Добавить импорт:
import Image from "next/image";

// Заменить блок с изображением:
<div className="relative aspect-[16/9] w-full overflow-hidden">
  <Image
    src={primaryImage}
    alt={service.name}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>
```

- [ ] **Step 3: Улучшить отображение цены**

Найти блок `Budget:` и заменить:

```tsx
<div className="flex items-center justify-between pt-1">
  <div>
    <div className="text-lg font-semibold text-foreground">
      от <Currency value={service.priceFrom} />
    </div>
    <div className="text-xs text-muted-foreground">
      до <Currency value={service.priceTo} />
    </div>
  </div>
  {requestButton}
</div>
```

- [ ] **Step 4: Проверить визуально**

```bash
npm run dev
```

Открыть `/repair` — карточки должны грузить изображения через `next/image`, цена отображается крупно.

- [ ] **Step 5: Commit**

```bash
git add components/OrgCard.tsx next.config.js
git commit -m "perf: next/image вместо img в OrgCard, улучшить отображение цены"
```

---

## Task 4: Skeleton-карточки при загрузке

**Files:**
- Create: `components/SkeletonCard.tsx`
- Modify: `app/repair/page.tsx`
- Modify: `app/my-requests/page.tsx`

### Цель
Заменить текст "Loading..." на skeleton-карточки — это критично для UX маркетплейса.

- [ ] **Step 1: Создать компонент SkeletonCard**

Создать файл `components/SkeletonCard.tsx`:

```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Использовать SkeletonCard в repair/page.tsx**

В `app/repair/page.tsx` найти блок `{loading ? (...)` и заменить:

```tsx
import { SkeletonCard } from "@/components/SkeletonCard";

// Заменить блок loading:
{loading ? (
  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
) : (
  <>
    <div className="mt-6 text-sm text-muted-foreground">
      Найдено {filtered.length} из {services.length} услуг
    </div>
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      {filtered.map((service) => (
        <OrgCard key={service.id} service={service} />
      ))}
    </div>
  </>
)}
```

- [ ] **Step 3: Использовать Skeleton в my-requests/page.tsx**

В `app/my-requests/page.tsx` найти `{loading ? (` и заменить текст-заглушку:

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Заменить блок loading:
{loading ? (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  // ...существующий контент
)}
```

- [ ] **Step 4: Проверить визуально**

```bash
npm run dev
```

Открыть `/repair` — при загрузке должны мигать skeleton-карточки. Можно замедлить сеть в DevTools → Network → Slow 3G чтобы увидеть эффект.

- [ ] **Step 5: Commit**

```bash
git add components/SkeletonCard.tsx app/repair/page.tsx app/my-requests/page.tsx
git commit -m "ux: skeleton-карточки вместо текста при загрузке"
```

---

## Task 5: Перевод интерфейса на русский язык

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/nav/MainNavbar.tsx`
- Modify: `app/repair/page.tsx`
- Modify: `components/OrgCard.tsx`

### Цель
Весь публичный UI должен быть на русском — это казахстанский сервис, целевая аудитория читает по-русски.

- [ ] **Step 1: Перевести главную страницу (app/page.tsx)**

Заменить все текстовые строки в `app/page.tsx`:

```tsx
// Hero
<h1>Найди мастера или компанию<br className="hidden md:block" /> для любого ремонта</h1>
<p>Авто, недвижимость, техника — сотни проверенных исполнителей в вашем городе. Оставьте заявку и получите ответ напрямую.</p>
<Button size="lg" className="px-10 text-base">Открыть каталог</Button>

// Категории
<h2>Популярные категории</h2>
<CardTitle>Автомобили</CardTitle>
<CardDescription>Ремонт, ТО, детейлинг, тюнинг и диагностика</CardDescription>
<CardTitle>Недвижимость</CardTitle>
<CardDescription>Ремонт квартиры, сантехника, электрика, уборка и переезд</CardDescription>
<CardTitle>Другое</CardTitle>
<CardDescription>Гаджеты, бытовая техника, мебель, одежда и любой другой ремонт</CardDescription>

// Как это работает
<h2>Как это работает</h2>

// Для клиентов
<h3>Для клиентов</h3>
<div className="font-medium text-sm">Найдите услугу</div>
<div className="text-sm text-muted-foreground">Используйте фильтры по категории, городу и цене</div>
<div className="font-medium text-sm">Оставьте заявку</div>
<div className="text-sm text-muted-foreground">Опишите задачу — компания ответит напрямую</div>
<div className="font-medium text-sm">Чат и отслеживание</div>
<div className="text-sm text-muted-foreground">Общайтесь с компанией и отслеживайте этапы работы</div>

// Для компаний
<h3>Для компаний</h3>
<div className="font-medium text-sm">Зарегистрируйтесь как компания</div>
<div className="text-sm text-muted-foreground">Создайте профиль и добавьте свои услуги</div>
<div className="font-medium text-sm">Получайте заявки клиентов</div>
<div className="text-sm text-muted-foreground">Просматривайте каталог заявок и принимайте подходящие</div>
<div className="font-medium text-sm">Чат и выполнение работ</div>
<div className="text-sm text-muted-foreground">Общайтесь с клиентом и управляйте статусами заявок</div>

// Статистика
<div className="text-sm text-muted-foreground mt-1">Городов</div>
<div className="text-sm text-muted-foreground mt-1">Компаний</div>
<div className="text-sm text-muted-foreground mt-1">Услуг</div>
<div className="text-sm text-muted-foreground mt-1">Средний рейтинг</div>
```

- [ ] **Step 2: Перевести navbar (components/nav/MainNavbar.tsx)**

```tsx
// Ссылка в центре:
<Link href={catalogHref} ...>Каталог</Link>

// Правая часть:
<Link href="/my-requests" ...>Мои заявки</Link>
<Link href="/company/dashboard" ...><LayoutDashboard />Панель</Link>

// Кнопки:
<Button variant="outline" size="sm" onClick={logout} className="gap-2">
  <LogOut className="h-4 w-4" />Выйти
</Button>
<Button variant="outline" size="sm">Войти</Button>

// Мобильное меню:
<Link href="/my-requests" ...>Мои заявки</Link>
<Button variant="outline" size="sm" ...>Выйти</Button>
<Button variant="outline" size="sm" className="w-fit">Войти</Button>
```

- [ ] **Step 3: Перевести страницу каталога (app/repair/page.tsx)**

```tsx
<h1 className="text-3xl font-bold">Каталог услуг</h1>
<p className="text-sm text-muted-foreground">Найдите исполнителя по городу, цене и категории</p>

// Кнопка в шапке:
<Button variant="outline" size="sm">Войдите, чтобы оставить заявку</Button>
<Button size="sm">Оставить заявку</Button>

// Баннер компании:
<span className="font-medium">Это каталог услуг для клиентов.</span>{" "}
Ваш каталог заявок от клиентов{" "}
<Link href="/company/catalog" ...>здесь →</Link>

// Счётчик:
Показано {filtered.length} из {services.length} услуг

// Пустой результат:
<p>По выбранным фильтрам ничего не найдено.</p>
<Button variant="secondary" onClick={resetFilters}>Сбросить фильтры</Button>
```

- [ ] **Step 4: Перевести OrgCard (components/OrgCard.tsx)**

```tsx
// Кнопки заявки:
<Button ...><CheckCircle2 />Войти для заявки</Button>
<Button disabled ...>Нужен аккаунт клиента</Button>
<Button ...><CheckCircle2 />Оставить заявку</Button>

// Метаданные:
{service.availabilityDays ? (
  <span className="flex items-center gap-1">
    <Clock className="h-4 w-4" />
    Старт через {service.availabilityDays} дн.
  </span>
) : null}

// Рейтинг:
<div className="text-xs text-muted-foreground">Нет оценок</div>
<div className="text-xs text-muted-foreground">
  {service._count?.requests ?? 0} заявок
</div>
```

- [ ] **Step 5: Запустить и проверить**

```bash
npm run dev
```

Открыть `/`, `/repair` — весь текст на русском, ничего не сломано.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/nav/MainNavbar.tsx app/repair/page.tsx components/OrgCard.tsx
git commit -m "i18n: перевод публичного интерфейса на русский язык"
```

---

## Task 6: Hero с поиском

**Files:**
- Modify: `app/page.tsx`

### Цель
Добавить поисковую строку прямо в hero-секцию. По клику или Enter — редирект на `/repair?q=...`. Это главный CTA для маркетплейса.

- [ ] **Step 1: Добавить поисковый блок в hero**

Добавить в секцию hero в `app/page.tsx` поиск после параграфа и перед ссылкой-кнопкой:

```tsx
"use client";
// Добавить useState для поиска:
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// В теле компонента добавить:
const [heroQuery, setHeroQuery] = useState("");
const router = useRouter();

function handleHeroSearch(e: React.FormEvent) {
  e.preventDefault();
  const q = heroQuery.trim();
  router.push(q ? `/repair?q=${encodeURIComponent(q)}` : catalogHref);
}
```

- [ ] **Step 2: Разметка блока поиска в hero**

Заменить блок `<Link href={catalogHref}><Button...>` на форму с поиском:

```tsx
<form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mt-8">
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      value={heroQuery}
      onChange={(e) => setHeroQuery(e.target.value)}
      placeholder="Автосервис, ремонт квартиры, техника..."
      className="pl-10 h-12 text-base"
    />
  </div>
  <Button type="submit" size="lg" className="h-12 px-8 shrink-0">
    Найти
  </Button>
</form>
```

- [ ] **Step 3: Принять q-параметр в repair/page.tsx**

В `app/repair/page.tsx` добавить чтение параметра `q` из searchParams при инициализации `query`:

```tsx
const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
```

(Это должно быть в компоненте `RepairContent`, который уже читает `searchParams`.)

- [ ] **Step 4: Проверить flow**

```bash
npm run dev
```

1. Перейти на `http://localhost:3000`
2. Ввести "автосервис" в поле поиска
3. Нажать Enter или "Найти"
4. Должен открыться `/repair` с уже заполненным фильтром поиска

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/repair/page.tsx
git commit -m "feat: поисковая строка в hero с передачей q-параметра в каталог"
```

---

## Task 7: Анимация мобильного меню

**Files:**
- Modify: `components/nav/MainNavbar.tsx`

### Цель
Мобильное меню сейчас появляется мгновенно. Добавить плавное открытие через Tailwind transition.

- [ ] **Step 1: Добавить анимацию через CSS transition**

В `components/nav/MainNavbar.tsx` заменить блок мобильного меню `{open && (...)}` на:

```tsx
<div
  className={`border-t bg-background md:hidden overflow-hidden transition-all duration-200 ease-in-out ${
    open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
  }`}
>
  <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
    {/* ...существующее содержимое меню без изменений... */}
  </div>
</div>
```

Убрать обёртку `{open && (` — теперь блок всегда рендерится, но скрыт через `max-h-0`.

- [ ] **Step 2: Проверить на мобильном**

```bash
npm run dev
```

Открыть DevTools → Toggle device toolbar (375px). Нажать бургер — меню должно плавно раскрываться/закрываться.

- [ ] **Step 3: Commit**

```bash
git add components/nav/MainNavbar.tsx
git commit -m "ux: анимация открытия мобильного меню"
```

---

## Task 8: Финальная проверка и lint

**Files:** все изменённые файлы

- [ ] **Step 1: Запустить TypeScript проверку**

```bash
npm run type-check
```

Ожидаемый результат: без ошибок. Если есть — исправить в соответствующих файлах.

- [ ] **Step 2: Запустить ESLint**

```bash
npm run lint
```

Если есть ошибки:

```bash
npm run lint:fix
```

- [ ] **Step 3: Финальный визуальный осмотр**

```bash
npm run dev
```

Чеклист:
- [ ] `/` — Poppins-шрифт в заголовках, синяя кнопка, поиск в hero работает
- [ ] `/repair` — skeleton-карточки при загрузке, весь текст на русском
- [ ] Footer — без "Demo version", год 2026
- [ ] Мобильное меню — плавная анимация
- [ ] OrgCard — цена "от X ₸" крупно
- [ ] Нет горизонтального скролла на 375px

- [ ] **Step 4: Итоговый commit**

```bash
git add -A
git commit -m "fix: исправления после lint и финальная полировка"
```
