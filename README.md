# Remont.kz Marketplace (MVP)

## Project Overview
Remont.kz is a marketplace that connects customers with local repair and service companies. The MVP focuses on a clean catalog, clear service offerings, and direct client-to-company communication.

## Problem Statement
Finding reliable ремонт/сервис providers is time‑consuming and fragmented. Clients struggle to compare options, and companies lack a simple channel to receive structured requests.

## Solution Concept
Provide a single platform where companies publish services and clients create requests, track status, and chat with providers in one place.

## Main Features (MVP)
- Public catalog with filters (category, city, price, rating, tags)
- Service cards with images, pricing, and company details
- Client requests with status workflow (new → in progress → completed)
- Client–company chat with file uploads (image/audio)
- Company dashboard to manage services, requests, and messages
- Role-based authentication (Client / Company)

## User Roles
- **Client**: browse catalog, create requests, chat with companies
- **Company**: manage services, respond to requests, communicate with clients

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes, JWT auth
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS + shadcn/ui

## Architecture Summary
Single Next.js application with App Router for UI and API routes for backend. Prisma handles database access. JWT-based auth secures protected endpoints. File uploads are stored locally under `public/uploads`.

## Folder Structure (Key)
```
app/                 # App Router pages and API routes
  api/               # REST endpoints (auth, services, requests, messages)
  company/           # Company dashboard pages
components/          # UI + feature components
lib/                 # Helpers, API client, auth utilities
prisma/              # Schema and seed script
```

## Screenshots (Placeholders)
- `![Home](docs/screenshots/home.png)`
- `![Catalog](docs/screenshots/catalog.png)`
- `![Request](docs/screenshots/request.png)`
- `![Chat](docs/screenshots/chat.png)`
- `![Company Dashboard](docs/screenshots/company-dashboard.png)`

## Future Improvements
- Real-time chat via WebSocket
- Request detail page with embedded chat thread
- Enhanced media gallery carousel on service/organization cards
- Favorites and reviews (post‑MVP)
- Deployment and monitoring tooling
