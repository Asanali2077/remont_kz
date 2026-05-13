# API Reference

Все маршруты находятся в `app/api/`. Аутентификация через `Authorization: Bearer <token>`.

Обозначения: 🔓 публичный · 🔑 авторизован · 👤 CLIENT · 🏢 COMPANY · ✉️ нужен verified email

---

## Auth

### `POST /api/auth/register` 🔓
Регистрация нового пользователя.
```json
{ "email": "str", "password": "str", "role": "CLIENT|COMPANY", "name": "str?", "phone": "str?" }
```
Отправляет письмо верификации + приветственное письмо. Rate limited.

### `POST /api/auth/login` 🔓
```json
{ "email": "str", "password": "str" }
```
Возвращает `{ token, id, email, role, name, ... }`. Rate limited.

### `GET /api/auth/me` 🔑
Текущий пользователь. Также принимает `PATCH` для обновления `lastActiveAt`.

### `DELETE /api/auth/me` 🔑
Удалить аккаунт (нужен пароль в body).

### `GET /api/auth/profile` 🔑
### `PUT /api/auth/profile` 🔑
Профиль: `{ name?, phone?, avatarUrl?, address? }`

### `GET /api/auth/verify-email?token=` 🔓
Верифицировать email по токену из письма.

### `POST /api/auth/forgot-password` 🔓
```json
{ "email": "str" }
```
Отправляет письмо со ссылкой для сброса. Rate limited.

### `POST /api/auth/reset-password` 🔓
```json
{ "token": "str", "newPassword": "str" }
```

---

## Services (Услуги)

### `GET /api/services` 🔓
Список услуг с фильтрами:
```
?category=plumbing&city=Almaty&minPrice=0&maxPrice=100000
&sort=rating&search=текст&licensed=true&companyId=uuid
&lat=43.2&lng=76.8&radiusKm=10&tags=tag1,tag2
```

### `POST /api/services` 🏢 ✉️
Создать услугу. Мультипарт форма (поля + фото).

### `GET /api/services/[id]` 🔓
Детали услуги + компания + изображения + отзывы.

### `PUT /api/services/[id]` 🏢 ✉️
Обновить услугу (только своя).

### `DELETE /api/services/[id]` 🏢
Удалить услугу (только своя).

---

## Requests (Заявки)

### `GET /api/requests` 🔑
Список заявок. Поведение зависит от роли:
- **CLIENT**: свои заявки. Фильтры: `?status=new&serviceId=uuid`
- **COMPANY**: назначенные + неназначенные по категориям/городам компании

Параметры: `?status=new|accepted|in_progress|completed&unassigned=true&category=str&city=str`

### `POST /api/requests` 👤
Создать заявку.
```json
{
  "description": "str",
  "category": "plumbing",
  "city": "Almaty",
  "serviceId": "uuid?",
  "budgetFrom": 50000,
  "budgetTo": 150000,
  "imageUrl": "url?"
}
```

### `GET /api/requests/[id]` 🔑
Детали заявки + офферы + сообщения.

### `PUT /api/requests/[id]` 🔑
Обновить статус заявки:
- COMPANY: `IN_PROGRESS` → `COMPLETED`
- CLIENT: `ACCEPTED` → `IN_PROGRESS` (подтверждение начала работ)

### `DELETE /api/requests/[id]` 👤
Удалить свою заявку (только в статусе `NEW`).

### `POST /api/requests/[id]/offer` 🏢 ✉️
Сделать оффер на заявку.
```json
{ "price": 75000, "message": "str?" }
```
Rate limited. Отправляет email клиенту.

### `DELETE /api/requests/[id]/offer` 🏢
Отозвать свой оффер.

### `POST /api/requests/[id]/accept-offer` 👤
Принять оффер компании.
```json
{ "companyId": "uuid" }
```
Переводит заявку в статус `ACCEPTED`, отправляет email компании.

### `POST /api/requests/[id]/rate` 👤
Оставить рейтинг (только для `COMPLETED` заявок).
```json
{ "rating": 5, "review": "Отличная работа!" }
```

### `POST /api/requests/expire` 🔓
Перевести просроченные заявки в статус `expired`. Вызывается cron-джобом.

---

## Messages (Чат)

### `GET /api/messages` 🔑
Список сообщений.
```
?requestId=uuid   — сообщения конкретной заявки
(без параметров)  — инбокс (список диалогов)
```

### `POST /api/messages` 🔑
Отправить сообщение.
```json
{ "requestId": "uuid", "receiverId": "uuid", "content": "текст", "type": "text|image|audio" }
```
Rate limited.

### `POST /api/messages/mark-read` 🔑
Отметить сообщения прочитанными.
```json
{ "requestId": "uuid" }
```

### `POST /api/messages/upload` 🔑
Загрузить файл (изображение или аудио). Мультипарт `multipart/form-data`, поле `file`.
Возвращает `{ url, type: "image"|"audio" }`.

---

## Chat (SSE)

### `GET /api/chat` 🔑
Инбокс чатов — список диалогов с последним сообщением.

### `GET /api/chat/[requestId]/stream` 🔑
Server-Sent Events стрим новых сообщений для заявки.
Фронтенд подключается через `EventSource`.

---

## AI

### `POST /api/ai/request-bot` 👤
AI-ассистент для создания заявки. Диалог с ботом.
```json
{
  "messages": [{ "role": "user|assistant", "content": "str" }],
  "collectedData": {}
}
```
Возвращает `{ message, done?, data? }`. Когда `done: true` — возвращает готовый `CreateRequestPayload`.

### `POST /api/ai/summary` 🔑
Сгенерировать AI-резюме для услуги.
```json
{ "serviceId": "uuid" }
```

---

## Favorites (Избранное)

### `GET /api/favorites` 👤
Список избранных услуг.

### `POST /api/favorites` 👤
```json
{ "serviceId": "uuid" }
```

### `GET /api/favorites/[serviceId]` 👤
Проверить, в избранном ли услуга. Возвращает `{ favorited: bool }`.

### `DELETE /api/favorites/[serviceId]` 👤
Убрать из избранного.

---

## Notifications

### `GET /api/notifications/count` 🔑
Счётчик уведомлений.
Возвращает `{ unreadMessages: number, newOffers: number, total: number }`.

---

## Companies

### `GET /api/companies` 🔓
Список всех компаний (User с role=COMPANY) с их услугами.

---

## Health

### `GET /api/health` 🔓
Проверка состояния. Пингует БД. Возвращает `{ status: "ok"|"error" }`.

---

## Коды ошибок

| Статус | Причина |
|--------|---------|
| 400 | Невалидные данные (Zod) |
| 401 | Нет токена или токен невалиден |
| 403 | Нет прав (чужой ресурс, email не верифицирован) |
| 404 | Ресурс не найден |
| 409 | Конфликт (дубликат) |
| 429 | Rate limit exceeded |
| 500 | Внутренняя ошибка сервера |
