# Компоненты

## Структура

```
components/
  auth/           # Аутентификация
  company/        # Дашборд компании
  filters/        # Фильтры поиска
  nav/            # Навигация
  ui/             # Базовые UI-компоненты (shadcn + кастомные)
  *.tsx           # Общие компоненты
```

---

## Auth

### `AuthProvider` · `components/auth/AuthProvider.tsx`
React Context для сессии пользователя. Оборачивает всё приложение.

```ts
const { user, login, logout, register, updateUser } = useAuth()
```

- `user` — текущий пользователь `{ id, email, role, name, ... }` или `null`
- `login(email, password)` — логин, сохраняет токен в localStorage
- `register(email, password, role, name?, phone?)` — регистрация
- `logout()` — чистит localStorage, редиректит на главную
- `updateUser(data)` — обновляет локальные данные без запроса к API

### `AuthModal` · `components/auth/AuthModal.tsx`
Модальное окно входа/регистрации.
```tsx
<AuthModal trigger={<Button>Войти</Button>} defaultMode="login" />
<AuthModal defaultMode="register" />
```

### `ProtectedRoute` · `components/company/ProtectedRoute.tsx`
Client-side guard по роли. Редиректит если нет нужной роли.
```tsx
<ProtectedRoute requiredRole="company">
  <CompanyDashboard />
</ProtectedRoute>
```

---

## Company Dashboard

### `CompanyOverview` · `components/company/CompanyOverview.tsx`
Главная вкладка дашборда компании. Показывает статистику, последние заявки, онбординг.
```tsx
<CompanyOverview onNavigate={(tab) => setActiveTab(tab)} />
```

### `ServicesManagement` · `components/company/ServicesManagement.tsx`
CRUD для услуг компании. Bulk delete, toggle active, создание/редактирование.

### `ServiceEditModal` · `components/company/ServiceEditModal.tsx`
Форма создания/редактирования услуги (фото, категория, цена, теги, геолокация).
```tsx
<ServiceEditModal service={service} open={open} onOpenChange={setOpen} onSave={handleSave} />
```

### `RequestsManagement` · `components/company/RequestsManagement.tsx`
Управление заявками компании. Два вида: список и kanban. Фильтрация по статусу.

### `KanbanBoard` · `components/company/KanbanBoard.tsx`
Kanban-доска заявок по колонкам: Новые → Принятые → В работе → Завершённые.
```tsx
<KanbanBoard userId={user.id} />
```

### `CompanyStatistics` · `components/company/CompanyStatistics.tsx`
Графики: выручка по месяцам (Recharts), метрики (кол-во услуг, заявок, рейтинг).

### `OnboardingChecklist` · `components/company/OnboardingChecklist.tsx`
Чеклист для новой компании: добавить услугу, загрузить аватар, завершить первую заявку.

---

## Навигация

### `MainNavbar` · `components/nav/MainNavbar.tsx`
Главный navbar. Поиск, переключатель темы, уведомления (колокол), меню пользователя.
Sticky, меняет стиль при скролле.

### `MobileNav` · `components/MobileNav.tsx`
Bottom navigation bar для мобильных (Home, Search, + заявка, Чат, Профиль).

### `ClientSidebar` · `components/ClientSidebar.tsx`
Боковая панель клиента (Мои заявки, Чат, Избранное, Настройки).

### `SettingsSidebar` · `components/SettingsSidebar.tsx`
Боковая панель настроек (Профиль, Безопасность, Биллинг).

---

## Поиск и Фильтры

### `FilterBar` · `components/filters/FilterBar.tsx`
Полная панель фильтров для страницы услуг. Категория, город, цена, теги, с фото.
```tsx
<FilterBar filters={filters} onChange={setFilters} sort={sort} onSortChange={setSort} />
```

### `CategoryFilter` · `components/filters/CategoryFilter.tsx`
Выбор категории с группировкой (группа → подкатегория).

### `CitySelect` · `components/ui/CitySelect.tsx`
Dropdown городов Казахстана из `lib/cities.ts`.
```tsx
<CitySelect value={city} onChange={setCity} allowAny />
```

---

## Карточки и Диалоги

### `OrgCard` · `components/OrgCard.tsx`
Карточка компании/услуги. Показывает рейтинг, цену, город, фото. Кнопки: избранное, сравнить, создать заявку.

### `RequestCreateDialog` · `components/RequestCreateDialog.tsx`
Многошаговый диалог создания заявки (категория → описание → фото → бюджет → город).
```tsx
<RequestCreateDialog trigger={<Button>Оставить заявку</Button>} service={service} onCreated={reload} />
```

### `OfferDialog` · `components/OfferDialog.tsx`
Диалог создания оффера для компании (цена + сообщение).

### `AiRequestBot` · `components/AiRequestBot.tsx`
AI-чат бот для создания заявки через диалог. Использует `/api/ai/request-bot`.

---

## Утилитарные компоненты

### `CompareContext` + `CompareBar` · `components/CompareContext.tsx`, `CompareBar.tsx`
Контекст для сравнения услуг (до 3). `CompareBar` — sticky bottom bar с кнопкой "Сравнить".
```ts
const { items, toggle, clear } = useCompare()
```

### `StatusBadge` · `components/StatusBadge.tsx`
Бейдж статуса заявки с цветом.
```tsx
<StatusBadge status="in_progress" />
```

### `Stars` · `components/Stars.tsx`
Звёздный рейтинг (SVG).
```tsx
<Stars value={4.7} className="text-yellow-400" />
```

### `Currency` · `components/Currency.tsx`
Форматирование цены в тенге.
```tsx
<Currency value={75000} />  // → "75 000 ₸"
```

### `OfflineToast` · `components/OfflineToast.tsx`
Toast уведомление при потере/восстановлении интернета.

### `Footer` · `components/Footer.tsx`
Подвал сайта с ссылками.

---

## Провайдеры

### `ClientProviders` · `components/ClientProviders.tsx`
Оборачивает всё приложение. Содержит: `AuthProvider`, `ThemeProvider`, `CompareProvider`, `Toaster`, `MobileNav`, `OfflineToast`.

---

## Хуки

### `useAuth()` · `components/auth/AuthProvider.tsx`
Текущий пользователь и методы аутентификации.

### `useCompare()` · `components/CompareContext.tsx`
Управление списком сравниваемых услуг.

### `useNotifications()` · `lib/use-notifications.ts`
Polling счётчика уведомлений (unread messages + new offers). Используется в `MainNavbar`.

---

## UI (shadcn/ui)

Все базовые компоненты в `components/ui/` — shadcn/ui стандарт:
`Button`, `Card`, `Dialog`, `Input`, `Label`, `Select`, `Slider`, `Textarea`, `Checkbox`, `Badge`, `Tabs`, `Avatar`, `Skeleton`, `Tooltip`, `DropdownMenu`, `Separator`.

Кастомные UI: `CitySelect`.
