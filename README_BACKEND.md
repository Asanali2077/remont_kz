# Remont.kz Backend - Quick Start

## 🚀 Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/remont_kz?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   ```

3. **Set up database:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Seed database (optional):**
   ```bash
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

See [BACKEND.md](./BACKEND.md) for complete API documentation.

## 🔑 Test Credentials (from seed)

**Clients:**
- Email: `client1@example.com` / Password: `password123`
- Email: `client2@example.com` / Password: `password123`

**Companies:**
- Email: `company1@example.com` / Password: `password123`
- Email: `company2@example.com` / Password: `password123`

## 📁 Project Structure

```
app/api/
├── auth/              # Authentication endpoints
│   ├── register/      # POST - Register user
│   ├── login/         # POST - Login user
│   └── me/            # GET - Get current user
├── services/          # Service management
│   ├── route.ts       # GET, POST - List/Create services
│   └── [id]/          # GET, PUT, DELETE - Service operations
│       └── images/    # POST, DELETE - Image upload
├── requests/          # Request management
│   ├── route.ts       # GET, POST - List/Create requests
│   └── [id]/          # GET, PUT - Request operations
├── messages/          # Chat/messaging
│   ├── route.ts       # GET, POST - List/Send messages
│   └── upload/        # POST - Upload files
├── payments/          # Payments & subscriptions
│   ├── subscription/  # GET, POST - Subscription management
│   ├── transactions/  # GET - Transaction history
│   └── invoices/      # GET - Invoice list
└── analytics/         # GET - Analytics data (Company only)

lib/
├── auth.ts            # JWT & password utilities
├── db.ts              # Prisma client
├── middleware.ts      # Auth & role middleware
└── upload.ts          # File upload handling

prisma/
├── schema.prisma      # Database schema
└── seed.ts            # Seed script
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (Client/Company)
- ✅ Password hashing (bcrypt, 12 rounds)
- ✅ Input validation (Zod)
- ✅ File type and size validation
- ✅ SQL injection protection (Prisma)

## 📝 Next Steps

1. Configure cloud storage for file uploads (AWS S3/Firebase)
2. Integrate payment provider (Stripe/PayPal)
3. Add rate limiting
4. Set up error logging
5. Configure CORS for production
6. Add email/SMS notifications

For detailed documentation, see [BACKEND.md](./BACKEND.md).

