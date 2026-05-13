# База данных

## Модели

### User

Единая таблица для клиентов и компаний. Роль определяет поведение.

```prisma
model User {
  id                  String    @id @default(uuid())
  email               String    @unique
  password            String               # bcrypt hash
  role                UserRole             # CLIENT | COMPANY | ADMIN
  name                String?
  phone               String?
  avatarUrl           String?
  address             String?
  lastActiveAt        DateTime?
  emailVerified       Boolean   @default(false)
  emailVerifyToken    String?   @unique
  resetToken          String?   @unique
  resetTokenExpiresAt DateTime?
}
```

Компания = User с `role = COMPANY` у которого есть `Service`-ы.

### Service

Услуга компании (объявление).

```prisma
model Service {
  id              String
  name            String
  category        ServiceCategory
  description     String          @db.Text
  priceFrom       Float
  priceTo         Float
  active          Boolean         @default(true)
  city            String?
  rating          Float?           # агрегированный рейтинг
  licensed        Boolean
  tags            String[]
  customAttributes Json?
  address         String?
  lat             Float?           # координаты для геокодинга
  lng             Float?
  aiSummary       String?          # AI-сгенерированное резюме
  companyId       String           # FK → User
}
```

### Request

Заявка клиента на услугу.

```prisma
model Request {
  id          String
  clientId    String           # FK → User (CLIENT)
  serviceId   String?          # FK → Service (если через конкретную услугу)
  companyId   String?          # FK → User (COMPANY, после назначения)
  description String
  category    ServiceCategory?
  city        String?
  imageUrl    String?
  status      RequestStatus    # NEW → ACCEPTED → IN_PROGRESS → COMPLETED
  rating      Int?             # 1-5, оставляет клиент
  review      String?
  companyReply String?
  budgetFrom  Float?
  budgetTo    Float?
  expiresAt   DateTime?
}
```

**Жизненный цикл заявки:**
```
NEW          → компания делает оффер
ACCEPTED     → клиент принял оффер, companyId назначен
IN_PROGRESS  → компания начала работу
COMPLETED    → работа завершена, клиент может оставить рейтинг
```

### RequestOffer

Оффер компании на заявку клиента.

```prisma
model RequestOffer {
  requestId String
  companyId String
  price     Int
  message   String?
  status    OfferStatus   # PENDING | ACCEPTED | REJECTED
  @@unique([requestId, companyId])  # одна компания — один оффер на заявку
}
```

### Message

Сообщение в чате (привязано к заявке).

```prisma
model Message {
  requestId  String?
  senderId   String
  receiverId String
  content    String
  type       MessageType   # TEXT | IMAGE | AUDIO
  imageUrl   String?
  audioUrl   String?
  read       Boolean @default(false)
}
```

### ServiceImage

Фотографии услуги.

```prisma
model ServiceImage {
  serviceId String
  url       String
  order     Int @default(0)
}
```

### Favorite

Избранные услуги клиента.

```prisma
model Favorite {
  userId    String
  serviceId String
  @@unique([userId, serviceId])
}
```

## Enum-ы (Prisma / Frontend)

### UserRole
| Prisma | Описание |
|--------|---------|
| `CLIENT` | Клиент — создаёт заявки |
| `COMPANY` | Компания — предоставляет услуги |
| `ADMIN` | Администратор (базовая поддержка) |

### ServiceCategory
| Prisma | Frontend | Название |
|--------|----------|---------|
| `AUTOMOBILES` | `"automobiles"` | Авто |
| `REAL_ESTATE` | `"real-estate"` | Недвижимость |
| `PLUMBING` | `"plumbing"` | Сантехника |
| `ELECTRICAL` | `"electrical"` | Электрика |
| `PAINTING` | `"painting"` | Покраска |
| `CLEANING` | `"cleaning"` | Клининг |
| `RENOVATION` | `"renovation"` | Ремонт |
| `WELDING` | `"welding"` | Сварка |
| `ROOFING` | `"roofing"` | Кровля |
| `OTHER` | `"other"` | Другое |

### RequestStatus
| Prisma | Frontend |
|--------|----------|
| `NEW` | `"new"` |
| `ACCEPTED` | `"accepted"` |
| `IN_PROGRESS` | `"in_progress"` |
| `COMPLETED` | `"completed"` |

### OfferStatus
| Prisma | Frontend |
|--------|----------|
| `PENDING` | `"pending"` |
| `ACCEPTED` | `"accepted"` |
| `REJECTED` | `"rejected"` |

### MessageType
| Prisma | Frontend |
|--------|----------|
| `TEXT` | `"text"` |
| `IMAGE` | `"image"` |
| `AUDIO` | `"audio"` |

## Индексы

Ключевые составные индексы для производительности:
- `Request`: `(category, city, status)` — фильтрация заявок компанией
- `Request`: `(clientId)`, `(companyId)`, `(serviceId)`, `(expiresAt)`
- `Service`: `(companyId)`, `(category)`, `(city)`, `(active)`
- `Message`: `(requestId)`, `(senderId)`, `(receiverId)`

## Схема на диаграмме

```
User (CLIENT) ──── clientRequests ────→ Request ←── companyRequests ─── User (COMPANY)
                                           │                                    │
                                           ├── RequestOffer ──────────────────→ │
                                           └── Message (senderId/receiverId)    │
                                                                                │
                                        Service ←──────────────────────────────┘
                                           └── ServiceImage
                                           └── Favorite ←── User (CLIENT)
```
