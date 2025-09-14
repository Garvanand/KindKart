# KindKart - Neighborhood Community App

A hyper-local community platform that connects neighbors for peer-to-peer help and services. Think of it as a "society WhatsApp group" but organized, with built-in trust mechanisms, reputation systems, and secure payments.

## 🚀 Current Status

### ✅ Completed Phases
- [x] **Phase 1: Authentication & User Management** - Foundation setup and user onboarding
  - [x] Project setup with Next.js 14+ and Express.js
  - [x] Database schema with Prisma and PostgreSQL
  - [x] Authentication system with OTP verification
  - [x] User profile management
  - [x] Basic UI components with shadcn/ui

### 🚧 Current Phase: Phase 1 - Authentication & User Management (Weeks 1-2)

#### Completed Tasks
- [x] Initialize Next.js project with TypeScript and App Router
- [x] Set up Tailwind CSS and shadcn/ui components
- [x] Configure Express.js backend with TypeScript
- [x] Initialize Prisma with PostgreSQL schema
- [x] Implement Firebase Auth integration (basic OTP flow)
- [x] Create user profile creation and editing functionality
- [x] Set up authentication store with Zustand
- [x] Create responsive mobile-first UI components

#### Next Steps
- [ ] Set up PostgreSQL database connection
- [ ] Implement Firebase Auth for real OTP sending
- [ ] Add profile photo upload functionality
- [ ] Create community management system (Phase 2)
- [ ] Implement help request system (Phase 3)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ with React 18+ and TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: shadcn/ui for consistent design system
- **State Management**: Zustand for global state
- **Forms**: React Hook Form with Zod validation
- **Real-time**: Socket.IO client (ready for Phase 4)

### Backend
- **Framework**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Auth (OTP-based)
- **Real-time**: Socket.IO for live features
- **File Storage**: AWS S3 (ready for implementation)
- **Payments**: Razorpay integration (Phase 5)
- **Caching**: Redis (Phase 6)

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway or Render
- **Database**: PostgreSQL (Railway/Supabase)
- **CDN**: Cloudflare for static assets

## 📁 Project Structure

```
kindkart/
├── kindkart-frontend/          # Next.js application
│   ├── src/
│   │   ├── app/               # App router pages
│   │   ├── components/        # Reusable components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   └── auth/         # Authentication components
│   │   ├── lib/              # Utilities and API client
│   │   ├── store/            # Zustand state management
│   │   └── types/            # TypeScript type definitions
│   └── package.json
├── kindkart-backend/           # Express.js API server
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   └── index.ts          # Main server file
│   ├── prisma/               # Database schema and migrations
│   └── package.json
├── memory-bank/               # Project documentation
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (for caching)
- Git

### Frontend Setup

```bash
cd kindkart-frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd kindkart-backend
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database and service credentials

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

The backend will be available at `http://localhost:3001`

### Environment Variables

#### Frontend (`kindkart-frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"..."}
```

#### Backend (`kindkart-backend/.env`)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/kindkart"
JWT_SECRET=your-super-secret-key
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=kindkart-uploads
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 📊 Development Phases

### Phase 1: Authentication & User Management ✅
- Project setup and configuration
- Firebase Auth integration with OTP
- User profile management
- Database schema implementation
- Basic UI components and mobile responsiveness

### Phase 2: Community Management (Weeks 3-4)
- Community creation and management
- Invite code system
- Admin approval workflow
- Member directory and search

### Phase 3: Help Request System (Weeks 5-6)
- Request creation and categorization
- Real-time feed with Socket.IO
- Helper assignment and tracking
- Request status management

### Phase 4: Communication & Chat (Weeks 7-8)
- One-on-one messaging system
- Real-time notifications
- Message persistence and history
- Optional WhatsApp integration

### Phase 5: Payment & Escrow System (Weeks 9-10)
- Razorpay integration
- Escrow payment holding
- Work verification system
- Dispute resolution mechanism

### Phase 6: Reputation & Gamification (Weeks 11-12)
- Reputation scoring system
- Leaderboards with Redis caching
- Badge and achievement system
- Community analytics dashboard

## 🔧 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

## 📱 Features Implemented

### Authentication System
- OTP-based login/signup flow
- Mobile and email verification
- JWT token management with refresh
- Protected route middleware
- User profile creation and editing

### User Interface
- Mobile-first responsive design
- Modern UI with shadcn/ui components
- Form validation with React Hook Form and Zod
- State management with Zustand
- Type-safe development with TypeScript

### Database Schema
- Users with profile information
- Communities with invite codes
- Community members with roles
- Help requests and responses
- Messages and conversations
- Transactions and escrow holds
- User reputation and badges
- Leaderboards

## 🐛 Known Issues
- Firebase Auth integration needs real OTP implementation
- Profile photo upload needs AWS S3 integration
- Database connection needs to be configured

## 📊 Free Tier Limitations & Monitoring
- **Supabase Database**: 500MB storage, 2GB bandwidth/month
- **Supabase Auth**: Unlimited users on free tier
- **Supabase Storage**: 1GB storage, 2GB bandwidth/month  
- **Vercel Hosting**: 100GB bandwidth, unlimited deployments
- **Railway Backend**: 500 hours/month, $5 credit

### Cost Optimization Tips
- Implement image compression before upload
- Use database queries efficiently with proper indexing
- Cache frequently accessed data in localStorage
- Monitor usage in Supabase dashboard weekly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Next Milestone**: Complete Phase 1 by setting up database connection and implementing real Firebase Auth integration.
