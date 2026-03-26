# KindKart

KindKart is a neighborhood collaboration platform for trusted local help, task coordination, emergency alerts, messaging, reputation, and payments.

This README reflects what is currently implemented in this repository as of March 2026.

## Current Implementation Status

### Backend API modules implemented
- Authentication: OTP send/verify, token refresh, guest login, logout.
- Users: profile read/update, profile photo URL update, user community listing.
- Communities: create, join via invite code, member listing, admin approval/rejection hooks.
- Help requests: create, browse by community, respond, accept response, status and completion flow.
- Messaging: request-level chat threads and conversation listing.
- Payments and wallet: order creation, payment verification, transaction history, escrow hold/release/dispute.
- Reputation: user reputation, badges, achievements endpoint, leaderboard, community reputation updates.
- Notifications: list, unread count, mark one/all read.
- Emergency: alert creation, responses, resolve flow, responder notifications.
- Tasks: create tasks, apply, review applications, update status.
- Extended module (`/api/ext`): skills, gamification challenges/streaks/karma shop, global search, community analytics, events, announcements, onboarding tour completion.
- AI route (`/api/ai/chat`): API contract endpoint is present; Gemini response execution currently happens on frontend.

### Frontend modules implemented
- Authentication and onboarding flows with guest mode support.
- Core product pages: dashboard, communities, requests, chat, wallet, reputation, safety.
- Additional product surfaces: events, analytics, mission, karma shop, help center.
- AI assistant UI integrated in product pages using Gemini client-side key.
- App tour and demo-mode fallbacks when APIs are unavailable.
- Reusable UI kit (`PremiumCard`, `PageHeader`, badges, stat cards) and app shell layout.

### Platform and runtime
- Monorepo with separate frontend and backend applications.
- Express 5 API with TypeScript, route-level middleware, rate limiting, and security middleware.
- SQLite runtime database via `better-sqlite3`; Prisma schema and validation scripts retained.
- Socket.IO server initialized for real-time chat handling.
- Optional Redis, Razorpay, Firebase service account, and S3 environment hooks.
- Health and readiness endpoints: `/health` and `/health/ready`.

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, Framer Motion.
- Backend: Node.js, Express 5, TypeScript, JWT, better-sqlite3, Socket.IO, Redis client.
- Payments and integrations: Razorpay, optional Firebase service credentials, optional AWS S3.

## Repository Structure

```text
kindkart/
  kindkart-frontend/   # Next.js application (App Router)
  kindkart-backend/    # Express API server
  memory-bank/         # project documentation and notes
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm 9+
- Redis (optional, for OTP caching/rate flows)

### 1) Backend setup

PowerShell:

```powershell
cd kindkart-backend
npm install
Copy-Item env.example .env
npm run dev
```

Backend starts on `PORT` (default `3001`). If occupied, it auto-retries on the next port.

### 2) Frontend setup

PowerShell:

```powershell
cd kindkart-frontend
npm install
Copy-Item env.local.example .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Environment Configuration

### Frontend (`kindkart-frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### Backend (`kindkart-backend/.env`)

```env
DATABASE_URL="file:../data/kindkart.db"
JWT_SECRET="change-this-to-a-long-random-secret"
PORT=3001
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"

# Optional
REDIS_URL="redis://localhost:6379"
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
S3_BUCKET_NAME=""
AWS_REGION=""
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account"}'
```

Notes:
- In development, backend can run with defaults if some values are missing.
- In production, set a strong `JWT_SECRET` (32+ characters) and explicit env values.

## API Surface Summary

All routes are mounted under `/api` except health checks.

- `/api/auth`: send OTP, verify OTP, refresh token, guest login, logout.
- `/api/users`: profile and user community endpoints.
- `/api/communities`: create/join communities and member operations.
- `/api/requests`: help request lifecycle and responses.
- `/api/messages`: request chat threads and conversations.
- `/api/payments`: payment order/verify/release/dispute plus wallet and transactions.
- `/api/reputation`: score, badges, achievements, leaderboard, updates.
- `/api/notifications`: feed and read state endpoints.
- `/api/emergency`: create/respond/resolve emergency alerts.
- `/api/tasks`: community task creation, application and moderation.
- `/api/ext`: skills, gamification, search, analytics, events, announcements, tour completion.
- `/api/ai/chat`: AI chat API contract endpoint.

## NPM Scripts

### Backend (`kindkart-backend/package.json`)

```bash
npm run dev             # start dev server with nodemon
npm run build           # compile TypeScript to dist
npm run start           # run compiled server
npm run prisma:validate # validate Prisma schema
npm run prisma:generate # generate Prisma client
npm run db:check        # build + prisma validate
```

### Frontend (`kindkart-frontend/package.json`)

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Production Readiness Notes

Implemented today:
- Structured API layers with middleware, auth, and error handling.
- Health endpoints and graceful shutdown.
- Security middleware (XSS/sanitization) and rate limiting.
- Feature-complete domain modules for core product surfaces.

Still recommended before production launch:
- Add automated tests (unit/integration/e2e) and CI pipeline.
- Move Gemini calls to backend proxy to avoid exposing client key.
- Harden observability (central logs, metrics, alerting) and backup strategy.
- Add migration and release runbooks for zero-downtime deploys.

## Deployment Baseline

- Frontend: Vercel or equivalent Next.js host.
- Backend: container or Node host (Render, Railway, Fly.io, ECS, etc.).
- Database: managed relational DB migration plan if moving beyond SQLite for scale.
- Cache/queue: managed Redis for OTP/session/cache workloads.

## License

ISC
