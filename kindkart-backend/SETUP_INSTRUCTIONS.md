# Backend Setup Instructions

## Quick Start

1. **Create .env file** (if it doesn't exist):
   ```bash
   cp env.example .env
   ```

2. **Set minimum required variables in .env**:
   ```env
   DATABASE_URL="file:../data/kindkart.db"
   JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

3. **For development, minimum setup**:
   ```env
   DATABASE_URL="file:../data/kindkart.db"
   JWT_SECRET="dev-secret-key-for-development-only"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

## Current .env File

Your .env file should have at minimum:
- `DATABASE_URL` - SQLite file URL (recommended: `file:../data/kindkart.db`)
- `JWT_SECRET` - A secret key for JWT tokens

The backend uses SQLite and auto-initializes schema on startup.

## Start Backend

```bash
npm run dev
```

The server starts on `PORT` (default 3001).
If that port is already used, it automatically retries on the next available port.

## Validate DB + Prisma Setup

```bash
npm run db:check
```

This verifies:
- TypeScript backend build
- Prisma schema validity for SQLite datasource





