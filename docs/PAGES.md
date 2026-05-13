# Страницы

Все страницы в `app/`. Next.js App Router — каждая папка = маршрут.

## Карта маршрутов

| URL | Файл | Доступ | Описание |
|-----|------|--------|---------|
| `/` | `app/page.tsx` | 🔓 | Главная страница |
| `/repair` | `app/repair/page.tsx` | 🔓 | Каталог услуг |
| `/repair/[id]` | `app/repair/[id]/page.tsx` | 🔓 | Карточка услуги |
| `/my-requests` | `app/my-requests/page.tsx` | 👤 | Мои заявки |
| `/chat` | `app/chat/page.tsx` | 🔑 | Инбокс чатов |
| `/chat/[requestId]` | `app/chat/[requestId]/page.tsx` | 🔑 | Чат по заявке |
| `/favorites` | `app/favorites/page.tsx` | 👤 | Избранные услуги |
| `/compare` | `app/compare/page.tsx` | 🔓 | Сравнение услуг |
| `/notifications` | `app/notifications/page.tsx` | 👤 | Уведомления |
| `/profile` | `app/profile/page.tsx` | 🔑 | Профиль пользователя |
| `/settings` | `app/settings/page.tsx` | 🔑 | Смена пароля |
| `/companies` | `app/companies/page.tsx` | 🔓 | Список компаний |
| `/guide` | `app/guide/page.tsx` | 🔓 | FAQ / Help Center |
| `/about` | `app/about/page.tsx` | 🔓 | О проекте |
| `/verify-email` | `app/verify-email/page.tsx` | 🔓 | Верификация email |
| `/forgot-password` | `app/forgot-password/page.tsx` | 🔓 | Запрос сброса пароля |
| `/reset-password` | `app/reset-password/page.tsx` | 🔓 | Новый пароль |
| `/billing` | `app/billing/page.tsx` | 🔑 | Биллинг (заглушка) |
| `/company` | `app/company/page.tsx` | 🏢 | Дашборд компании |

Обозначения: 🔓 публичный · 🔑 авторизован · 👤 CLIENT · 🏢 COMPANY

---

## Главные страницы

### `/` — Главная · `app/page.tsx` (714 строк)

Hero-секция с анимациями (Framer Motion):
- `TypewriterHero` — типрайтер-эффект в заголовке
- `ActivityTicker` — лента активности в реальном времени
- `BeforeAfterSlider` — слайдер до/после
- `CompanyMarquee` — бегущая строка компаний
- `HeroSearch` — поиск с редиректом на `/repair`
- Счётчики (`Counter`) — анимированная статистика
- Блок избранных услуг — топ по рейтингу
- CTA секции для клиентов и компаний

### `/repair` — Каталог · `app/repair/page.tsx` (621 строка)

Основной каталог услуг:
- `FilterBar` — полные фильтры (категория, город, цена, теги)
- Быстрые фильтры (`QUICK_FILTERS`) — популярные запросы
- Переключатель вид: сетка / список
- `ShimmerCard` — skeleton во время загрузки
- `ActiveChips` — активные фильтры с кнопкой удаления
- Геолокация — `useMyLocation` для поиска рядом
- `AiRequestBot` — AI-бот для создания заявки
- Сортировка: релевантность / рейтинг / цена

### `/repair/[id]` — Карточка услуги · `app/repair/[id]/page.tsx` (434 строки)

Детальная страница услуги:
- Галерея фото с лайтбоксом (`Lightbox`)
- `LocationCard` — карта адреса (Yandex Maps embed)
- Рейтинг и отзывы клиентов с ответами компании
- Похожие услуги
- AI Summary блок
- Кнопки: "Оставить заявку", "В избранное", "Сравнить"
- SEO: `generateMetadata` для Open Graph

### `/company` — Дашборд компании · `app/company/page.tsx`

Защищён `ProtectedRoute` (только `COMPANY`). Табы:
1. **Обзор** — `CompanyOverview` + `OnboardingChecklist`
2. **Услуги** — `ServicesManagement`
3. **Заявки** — `RequestsManagement` (список + kanban)
4. **Статистика** — `CompanyStatistics`

### `/my-requests` — Мои заявки · `app/my-requests/page.tsx` (503 строки)

Дашборд клиента:
- Список своих заявок с `RequestTimeline` (прогресс-бар статуса)
- `OfferCard` — карточка оффера с кнопками принять/отклонить
- Срок действия заявки (`getExpiry`)
- Рейтинг выполненной работы (звёзды + отзыв)
- Фильтрация по статусу

### `/chat/[requestId]` — Чат · `app/chat/[requestId]/page.tsx` (278 строк)

Чат в рамках заявки:
- SSE подписка на новые сообщения
- Отправка текста, изображений, аудио
- Отображение контактов второй стороны (телефон, email)
- Auto-scroll к новым сообщениям

---

## Layout структура

```
app/layout.tsx              ← RootLayout (Inter font, ClientProviders, MainNavbar)
  app/repair/layout.tsx     ← RepairLayout (metadata)
  app/chat/layout.tsx       ← ChatLayout (metadata)
  app/my-requests/layout.tsx
  ... (каждый маршрут имеет свой layout только для metadata)
```

`RootLayout` оборачивает всё в `ClientProviders` и добавляет `MainNavbar`.

---

## Паттерны страниц

### Client компоненты (CSR)
Большинство страниц — `"use client"`. Данные загружаются через `api.*` в `useEffect`.

### Server компоненты
`repair/[id]/layout.tsx` — единственный server component с `generateMetadata` для SEO.

### Защита по роли
```tsx
// Клиентская защита через ProtectedRoute
<ProtectedRoute requiredRole="company">
  ...
</ProtectedRoute>

// Или через useAuth + useRouter
const { user } = useAuth()
if (!user || user.role !== "client") router.push("/")
```

### Sidebar layouts
Страницы клиента (`/my-requests`, `/notifications`, `/favorites`) используют `ClientSidebar`.
Страницы настроек (`/profile`, `/settings`) используют `SettingsSidebar`.
