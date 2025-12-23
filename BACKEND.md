# Remont.kz Backend Documentation

## Overview

This backend is built with Next.js 14 API Routes, Prisma ORM, and PostgreSQL. It provides a complete RESTful API for the Remont.kz platform with role-based authentication and authorization.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **File Upload**: Native Node.js (with cloud storage support ready)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Update `.env` file with your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/remont_kz?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### 3. Run Migrations

```bash
npm run db:push
# or for production
npm run db:migrate
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

This will create:
- 2 client users (client1@example.com, client2@example.com)
- 2 company users (company1@example.com, company2@example.com)
- Sample services, requests, messages, reviews, subscriptions, and transactions

All passwords are: `password123`

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "client" | "company",
  "name": "User Name",
  "phone": "+7 701 123 45 67"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CLIENT" | "COMPANY",
    "name": "User Name",
    "phone": "+7 701 123 45 67"
  },
  "token": "jwt-token"
}
```

#### POST `/api/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### GET `/api/auth/me`
Get current user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

### Services

#### GET `/api/services`
List services with optional filters.

**Query Parameters:**
- `companyId` - Filter by company
- `category` - Filter by category (automobiles, real-estate, other)
- `city` - Filter by city
- `active` - Filter by active status
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `minRating` - Minimum rating
- `licensed` - Only licensed services
- `tags` - Comma-separated tags

#### POST `/api/services`
Create a new service (Company only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Service Name",
  "category": "real-estate",
  "description": "Service description",
  "priceFrom": 10000,
  "priceTo": 50000,
  "city": "Алматы",
  "rating": 4.5,
  "licensed": true,
  "availabilityDays": 5,
  "urgency": "medium",
  "tags": ["tag1", "tag2"],
  "customAttributes": {
    "key": "value"
  },
  "active": true
}
```

#### GET `/api/services/[id]`
Get a single service by ID.

#### PUT `/api/services/[id]`
Update a service (Company only, owner only).

#### DELETE `/api/services/[id]`
Delete a service (Company only, owner only).

#### POST `/api/services/[id]/images`
Upload service image (Company only, owner only).

**Request:** FormData with `file` field

#### DELETE `/api/services/[id]/images/[imageId]`
Delete service image (Company only, owner only).

### Requests

#### GET `/api/requests`
List requests (filtered by user role).

**Query Parameters:**
- `status` - Filter by status (new, in_progress, completed)
- `serviceId` - Filter by service

#### POST `/api/requests`
Create a new request (Client only).

**Request Body:**
```json
{
  "serviceId": "uuid",
  "message": "Request message"
}
```

#### GET `/api/requests/[id]`
Get a single request by ID.

#### PUT `/api/requests/[id]`
Update request status (Company only).

**Request Body:**
```json
{
  "status": "completed"
}
```

### Messages

#### GET `/api/messages`
List messages/conversations.

**Query Parameters:**
- `requestId` - Filter by request
- `receiverId` - Filter by receiver
- `page` - Page number
- `limit` - Items per page

#### POST `/api/messages`
Send a message.

**Request Body:**
```json
{
  "requestId": "uuid",
  "receiverId": "uuid",
  "content": "Message content",
  "type": "text" | "image" | "audio",
  "imageUrl": "url",
  "audioUrl": "url"
}
```

#### POST `/api/messages/upload`
Upload file for message (image or audio).

**Query Parameters:**
- `type` - "image" or "audio"

**Request:** FormData with `file` field

### Payments & Subscriptions

#### GET `/api/payments/subscription`
Get current subscription.

#### POST `/api/payments/subscription`
Create/update subscription (Company only).

**Request Body:**
```json
{
  "plan": "premium",
  "autoRenew": true
}
```

#### GET `/api/payments/transactions`
List transactions.

**Query Parameters:**
- `type` - Filter by type
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

#### GET `/api/payments/invoices`
List invoices.

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number
- `limit` - Items per page

### Analytics

#### GET `/api/analytics`
Get analytics data (Company only).

**Query Parameters:**
- `startDate` - Start date filter
- `endDate` - End date filter
- `category` - Filter by service category
- `city` - Filter by city

**Response:**
```json
{
  "totalServices": 12,
  "completedRequests": 45,
  "pendingRequests": 8,
  "revenue": 1250000,
  "requestsByStatus": [...],
  "requestsByService": [...],
  "revenueByMonth": [...],
  "requestsByCity": [...]
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained from `/api/auth/login` or `/api/auth/register`.

## Role-Based Access Control

- **CLIENT**: Can create requests, send messages, view services
- **COMPANY**: Can manage services, update request status, view analytics, manage subscriptions

## File Uploads

Files are uploaded to `./public/uploads/images` or `./public/uploads/audio` by default.

For production, configure:
- `UPLOAD_DIR` - Upload directory
- `MAX_FILE_SIZE` - Maximum file size in bytes
- `ALLOWED_IMAGE_TYPES` - Comma-separated allowed image MIME types
- `ALLOWED_AUDIO_TYPES` - Comma-separated allowed audio MIME types

For cloud storage (AWS S3, Firebase), modify `lib/upload.ts` to use the appropriate SDK.

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

Key models:
- **User**: Clients and Companies
- **Service**: Company services/ads
- **ServiceImage**: Service images
- **Request**: Client requests to companies
- **Message**: Chat messages (text, image, audio)
- **Review**: Client reviews
- **Subscription**: Company subscriptions
- **Transaction**: Payment transactions
- **Invoice**: Invoices

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message",
  "details": [...] // Optional validation details
}
```

## Security

- Passwords are hashed using bcrypt (12 rounds)
- JWT tokens with expiration
- Role-based access control
- Input validation with Zod
- File type and size validation
- SQL injection protection via Prisma

## Development

### Prisma Studio

View and edit database data:
```bash
npm run db:studio
```

### Type Checking

```bash
npm run type-check
```

## Production Considerations

1. **Environment Variables**: Set secure `JWT_SECRET` and `DATABASE_URL`
2. **File Storage**: Configure cloud storage (AWS S3, Firebase Storage)
3. **Rate Limiting**: Add rate limiting middleware
4. **CORS**: Configure CORS for your frontend domain
5. **Error Logging**: Set up error logging service
6. **Database**: Use connection pooling for production
7. **HTTPS**: Always use HTTPS in production
8. **Payment Integration**: Integrate with Stripe/PayPal for real payments

## Next Steps

- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Integrate payment provider (Stripe/PayPal)
- [ ] Set up cloud file storage
- [ ] Add email notifications
- [ ] Add SMS notifications
- [ ] Implement caching
- [ ] Add API documentation (Swagger/OpenAPI)


