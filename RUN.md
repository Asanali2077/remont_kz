# Setup & Run Guide

## Requirements
- Node.js 18+
- npm 9+
- PostgreSQL 14+

## Environment Variables
Create `.env` in the project root:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/remont_kz?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# File Uploads
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/ogg

# App
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## Install
```bash
npm install
```

## Database Setup (Prisma)
```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

## Run in Development
```bash
npm run dev
```
App will be available at `http://localhost:3000`.

## Build
```bash
npm run build
```

## Run in Production
```bash
npm run start
```

## Troubleshooting
- **DB connection error**: check `DATABASE_URL`, ensure PostgreSQL is running.
- **JWT errors**: set a valid `JWT_SECRET`, clear browser storage, re-login.
- **File upload issues**: ensure `UPLOAD_DIR` is writable. The app will create subfolders on upload.
- **Prisma errors**: run `npm run db:generate` after schema changes.
