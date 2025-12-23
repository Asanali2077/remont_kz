# Remont.kz Full-Stack Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/remont_kz?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/ogg

# App
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📋 Test Credentials (from seed)

**Clients:**
- Email: `client1@example.com` / Password: `password123`
- Email: `client2@example.com` / Password: `password123`

**Companies:**
- Email: `company1@example.com` / Password: `password123`
- Email: `company2@example.com` / Password: `password123`

## 🌐 Language Support

The application supports two languages:
- **Russian (RU)** - Default
- **Kazakh (KAZ)**

Switch languages using the language switcher in the navigation bar.

## 🔐 Authentication Flow

1. **Registration:**
   - User must select role: Client or Company
   - Email, password, name, and phone are required
   - JWT token is returned and stored

2. **Login:**
   - User must select role before login
   - System verifies role matches stored role
   - JWT token is returned and stored

3. **Role-Based Redirects:**
   - Clients → Stay on main site
   - Companies → Redirected to `/company/dashboard`

## 🏢 Company CRM Features

### Services Management
- Create, edit, delete services
- Upload multiple images per service
- Advanced filters: category, city, price, rating, license, availability, tags
- Custom attributes support

### Requests Management
- View incoming client requests
- Update request status (new → in_progress → completed)
- Completed status highlighted in green
- Filter by status

### Messages/Chat
- Text messages
- Image uploads
- Audio messages (upload or record)
- Chat history with pagination

### Analytics Dashboard
- Total services count
- Completed/pending requests
- Revenue tracking
- Charts: requests by status, by service, by city
- Revenue by month
- Filterable by date, category, city, rating

### Personal Account
- Subscription management
- Period selection: Monthly, Quarterly (3 months), Semiannual (6 months), Yearly
- Transaction history
- Plan selection: Free, Basic, Premium

## 🔌 API Integration

All frontend components are connected to backend APIs via `lib/api.ts`.

### Key API Endpoints:

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Services:** `/api/services`, `/api/services/[id]`, `/api/services/[id]/images`
- **Requests:** `/api/requests`, `/api/requests/[id]`
- **Messages:** `/api/messages`, `/api/messages/upload`
- **Analytics:** `/api/analytics`
- **Payments:** `/api/payments/subscription`, `/api/payments/transactions`

See [BACKEND.md](./BACKEND.md) for complete API documentation.

## 🎨 UI Features

- **Responsive Design:** Works on all screen sizes
- **Tailwind CSS + shadcn/ui:** Consistent design system
- **Language Support:** Kazakh and Russian translations
- **Role-Based UI:** Different navigation for Clients and Companies
- **Status Indicators:** Color-coded (Completed = green)

## 📝 Key Changes from Previous Version

1. ✅ Role selection required during login
2. ✅ "Submit Advertisement" button removed for companies
3. ✅ Full Kazakh/Russian translation support
4. ✅ Backend API integration throughout
5. ✅ Subscription periods: monthly, quarterly, semiannual, yearly
6. ✅ Enhanced analytics dashboard
7. ✅ File upload support (images and audio)
8. ✅ Real-time data from database

## 🛠️ Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema changes
npm run db:migrate     # Create migration
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed database

# Code Quality
npm run lint           # Check linting
npm run lint:fix       # Fix linting issues
npm run type-check     # TypeScript type checking
npm run format         # Format code
```

## 🔒 Security

- JWT authentication
- Role-based access control
- Password hashing (bcrypt)
- Input validation (Zod)
- File type/size validation
- SQL injection protection (Prisma)

## 📦 Production Checklist

- [ ] Set secure `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up cloud storage for file uploads
- [ ] Configure CORS for your domain
- [ ] Add rate limiting
- [ ] Set up error logging
- [ ] Integrate payment provider (Stripe/PayPal/Kaspi)
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure environment variables

## 🆘 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check database credentials

### Authentication Issues
- Clear browser localStorage
- Verify JWT_SECRET is set
- Check token expiration

### File Upload Issues
- Ensure `public/uploads` directory exists
- Check file size limits
- Verify file types are allowed

## 📚 Documentation

- [Backend API Documentation](./BACKEND.md)
- [Backend Quick Start](./README_BACKEND.md)
- [Main README](./README.md)

## 🤝 Support

For issues or questions, check the documentation files or review the code comments.


