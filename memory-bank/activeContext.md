# KindKart Active Context

## Current Work Focus
**Phase**: Project Initialization and Planning
**Status**: Setting up memory bank and creating development roadmap

## Recent Changes
- Created memory bank structure with core documentation files
- Analyzed project requirements from detailed prompt
- Established technical foundation and architecture patterns

## Next Steps
1. Complete memory bank documentation (progress.md)
2. Create detailed development plan for Phase 1
3. Set up project structure with frontend and backend folders
4. Initialize Next.js frontend with required dependencies
5. Set up Express.js backend with TypeScript
6. Configure development environment and tooling

## Active Decisions and Considerations

### Technology Stack Confirmation
- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with TypeScript, PostgreSQL, Prisma ORM
- **Authentication**: Firebase Auth with OTP verification
- **Real-time**: Socket.IO for live features
- **Payments**: Razorpay for escrow system
- **Hosting**: Vercel (frontend) + Railway (backend)

### Development Approach
- **Mobile-first design** with responsive web interface
- **Progressive Web App (PWA)** capabilities
- **Component-based architecture** for maintainability
- **Type-safe development** with strict TypeScript
- **Real-time features** for community engagement

### Project Structure Decision
```
kindkart/
├── frontend/          # Next.js application
├── backend/           # Express.js API server
├── shared/            # Shared types and utilities
├── docs/              # Documentation
└── memory-bank/       # Project memory and context
```

## Current Blockers
- None currently - ready to begin development setup

## Key Requirements to Address
1. **Authentication System**: OTP-based login/signup with Firebase
2. **User Profile Management**: Photo upload, qualifications, certifications
3. **Community Management**: Room creation, invite codes, admin approval
4. **Help Request System**: Request creation, real-time feed, helper assignment
5. **Communication**: In-app chat with Socket.IO
6. **Payment System**: Razorpay integration with escrow functionality
7. **Reputation System**: Gamified points, leaderboards, badges

## Development Priorities
1. **Phase 1**: Authentication & User Management (Weeks 1-2)
2. **Phase 2**: Community Management (Weeks 3-4)
3. **Phase 3**: Help Request System (Weeks 5-6)
4. **Phase 4**: Communication & Chat (Weeks 7-8)
5. **Phase 5**: Payment & Escrow System (Weeks 9-10)
6. **Phase 6**: Reputation & Gamification (Weeks 11-12)