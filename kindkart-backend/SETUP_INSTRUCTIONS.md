# Backend Setup Instructions

## Quick Start

1. **Create .env file** (if it doesn't exist):
   ```bash
   cp env.example .env
   ```

2. **Set minimum required variables in .env**:
   ```env
   DATABASE_URL="your-database-url-here"
   JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

3. **For development, minimum setup**:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/kindkart"
   JWT_SECRET="dev-secret-key-for-development-only"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

## Current .env File

Your .env file should have at minimum:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secret key for JWT tokens (can use default in dev)

The backend will use development defaults if JWT_SECRET is missing, but DATABASE_URL is required.

## Start Backend

```bash
npm run dev
```

The server will start on port 3001.





