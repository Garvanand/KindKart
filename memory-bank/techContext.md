# KindKart Technical Context

## Technology Stack

### Frontend Technologies
- **Framework**: Next.js 14+ with React 18+
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom components
- **UI Library**: shadcn/ui for consistent design system
- **State Management**: Zustand for global state
- **Forms**: React Hook Form with Zod validation
- **Real-time**: Socket.IO client
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library + Cypress

### Backend Technologies
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Auth (OTP-based)
- **Real-time**: Socket.IO server
- **File Storage**: AWS S3 or Firebase Storage
- **Payments**: Razorpay integration
- **Caching**: Redis
- **Validation**: Joi or Zod
- **Testing**: Jest + Supertest

### Infrastructure & Hosting
- **Frontend**: Vercel (automatic deployments)
- **Backend**: Railway or Render
- **Database**: PostgreSQL (Railway/Supabase)
- **CDN**: Cloudflare for static assets
- **Monitoring**: Built-in Vercel/Railway analytics

## Development Setup

### Environment Requirements
- Node.js 18+ 
- PostgreSQL 14+
- Redis (for caching)
- Git for version control

### Development Tools
- **Code Editor**: VS Code with TypeScript support
- **Package Manager**: npm or yarn
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Git Hooks**: Husky for pre-commit checks
- **Environment**: dotenv for configuration

### Build & Deployment
- **Frontend**: Next.js build → Vercel deployment
- **Backend**: TypeScript compilation → Railway deployment
- **Database**: Prisma migrations → Automated deployment
- **Environment Variables**: Secure configuration management

## Technical Constraints

### Free Tier Limitations
- **Supabase Database**: 500MB storage, 2GB bandwidth/month
- **Supabase Auth**: Unlimited users on free tier
- **Supabase Storage**: 1GB storage, 2GB bandwidth/month
- **Vercel Hosting**: 100GB bandwidth, unlimited deployments
- **Railway**: 500 hours/month, $5 credit

### Performance Requirements
- **Page Load**: < 3 seconds on mobile
- **API Response**: < 500ms for most endpoints
- **Real-time**: < 100ms latency for messages
- **Image Upload**: < 5MB file size limit
- **Database**: Optimized queries with proper indexing

### Security Requirements
- **HTTPS**: All communications encrypted
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Prevent abuse and spam
- **CORS**: Proper cross-origin configuration
- **Authentication**: Secure JWT token management

## Dependencies

### Frontend Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@radix-ui/react-*": "Latest",
    "zustand": "^4.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "socket.io-client": "^4.0.0",
    "lucide-react": "^0.300.0"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^5.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "socket.io": "^4.0.0",
    "firebase-admin": "^11.0.0",
    "razorpay": "^2.0.0",
    "redis": "^4.0.0",
    "bcryptjs": "^2.4.0",
    "jsonwebtoken": "^9.0.0"
  }
}
```

## Development Workflow

### Git Workflow
- Feature branches for new development
- Pull request reviews before merging
- Meaningful commit messages
- Automated testing on pull requests

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Component testing for UI elements

### Code Quality
- TypeScript strict mode
- ESLint with TypeScript rules
- Prettier for code formatting
- Husky for pre-commit hooks
- Regular dependency updates
