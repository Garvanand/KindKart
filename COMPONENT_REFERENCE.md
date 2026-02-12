# KindKart Premium Components - Quick Reference

## Import All Components

```tsx
// From UI Kit
import {
  // Cards
  PremiumCard, StatCard, FeatureCard, TimelineCard,
  // Badges
  Badge, Chip, AnimatedBadge, StatusBadge, PriorityBadge, TrustScoreBadge,
  // Progress
  AnimatedProgressRing, AnimatedProgressBar, SkeletonLoader, EmptyState, Pulse,
  // Page Wrappers
  PageHeader, PageSection, HeroSection, ContainerGrid,
} from '@/components/ui-kit';

// From Feature Components
import { ChatMessage, ChatInput, TypingIndicator, ChatHeader } from '@/components/chat/ChatComponents';
import { WalletCard, EscrowTracker, TransactionHistoryItem } from '@/components/payment/EscrowComponents';
import { ReputationScore, LeaderboardEntry, AchievementBadge, ReputationStats } from '@/components/reputation/ReputationComponents';
import { CommunityCard, MemberCard, DirectoryFilter, AdminDashboardCard } from '@/components/community/CommunityComponents';
import { PremiumDemoBanner, DemoFeatureShowcase, DemoGuideStep, TourCompletionCelebration } from '@/components/PremiumDemoComponents';
```

---

## Component API Reference

### 📦 CARDS

#### PremiumCard
Base interactive card for all premium UIs.

**Props:**
```tsx
interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;          // Add hover animations
  interactive?: boolean;         // Cursor pointer
  gradient?: boolean;           // Apply gradient background
  children: ReactNode;
}
```

**Usage:**
```tsx
<PremiumCard hoverable interactive>
  <h3>Title</h3>
  <p>Content</p>
</PremiumCard>
```

---

#### StatCard
Display key performance indicators with trends.

**Props:**
```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'emergency';
  trend?: {
    direction: 'up' | 'down';
    value: number;
  };
  onClick?: () => void;
}
```

**Usage:**
```tsx
<StatCard
  label="Completed Tasks"
  value={42}
  icon={<CheckCircle2 />}
  color="success"
  trend={{ direction: 'up', value: 12 }}
/>
```

---

#### FeatureCard
Showcase features with description and action.

**Props:**
```tsx
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onClick?: () => void;
}
```

**Usage:**
```tsx
<FeatureCard
  icon={<Zap />}
  title="Fast Verification"
  description="Get verified in seconds"
  actionLabel="Learn More"
/>
```

---

#### TimelineCard
Display timeline events or statuses.

**Props:**
```tsx
interface TimelineCardProps {
  icon: ReactNode;
  status: string;
  timestamp: string;
  description: string;
  isActive?: boolean;
}
```

**Usage:**
```tsx
<TimelineCard
  icon={<Clock />}
  status="In Progress"
  timestamp="2 hours ago"
  description="Task started"
  isActive
/>
```

---

### 🎯 BADGES

#### Badge
Versatile badge component with multiple variants.

**Props:**
```tsx
interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'emergency' | 'info' | 'ghost';
  children: ReactNode;
  className?: string;
}
```

**Usage:**
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="emergency">Urgent</Badge>
```

---

#### Chip
Removable badge with close button.

**Props:**
```tsx
interface ChipProps {
  label: string;
  onRemove?: () => void;
  variant?: 'primary' | 'secondary';
}
```

**Usage:**
```tsx
<Chip
  label="React"
  onRemove={() => console.log('removed')}
/>
```

---

#### AnimatedBadge
Badge with unlock animation.

**Props:**
```tsx
interface AnimatedBadgeProps {
  label: string;
  unlocked: boolean;
  icon?: ReactNode;
}
```

**Usage:**
```tsx
<AnimatedBadge
  label="First Task Completed"
  unlocked={hasCompletedTask}
  icon={<Trophy />}
/>
```

---

#### StatusBadge
Online/offline/away status indicator.

**Props:**
```tsx
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away';
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**
```tsx
<StatusBadge status="online" size="md" />
```

---

#### PriorityBadge
Display task/request priority.

**Props:**
```tsx
interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}
```

**Usage:**
```tsx
<PriorityBadge priority="high" />
```

---

#### TrustScoreBadge
Display trust/rating score.

**Props:**
```tsx
interface TrustScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**
```tsx
<TrustScoreBadge score={4.8} maxScore={5} />
```

---

### ⏳ PROGRESS & STATES

#### AnimatedProgressRing
Circular progress indicator.

**Props:**
```tsx
interface AnimatedProgressRingProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'info' | 'emergency';
  showLabel?: boolean;
  animated?: boolean;
}
```

**Usage:**
```tsx
<AnimatedProgressRing
  percentage={75}
  size="md"
  color="primary"
  showLabel
/>
```

---

#### AnimatedProgressBar
Linear progress bar.

**Props:**
```tsx
interface AnimatedProgressBarProps {
  percentage: number;
  label?: string;
  color?: 'primary' | 'success' | 'warning';
  showPercentage?: boolean;
}
```

**Usage:**
```tsx
<AnimatedProgressBar
  percentage={60}
  label="Completion"
  color="success"
  showPercentage
/>
```

---

#### SkeletonLoader
Loading placeholder component.

**Props:**
```tsx
interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'avatar' | 'table';
  count?: number;
}
```

**Usage:**
```tsx
<SkeletonLoader type="card" count={3} />
<SkeletonLoader type="text" />
<SkeletonLoader type="avatar" />
```

---

#### EmptyState
Beautiful empty state display.

**Props:**
```tsx
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Usage:**
```tsx
<EmptyState
  icon={<MessageCircle />}
  title="No messages yet"
  description="Start a conversation to begin"
  actionLabel="Send Message"
  onAction={() => {}}
/>
```

---

#### Pulse
Live activity indicator.

**Props:**
```tsx
interface PulseProps {
  color?: 'primary' | 'success' | 'warning' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
}
```

**Usage:**
```tsx
<Pulse color="success" size="md" /> Verifying...
```

---

### 📄 PAGE WRAPPERS

#### PageHeader
Section header with breadcrumbs and actions.

**Props:**
```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  backButton?: boolean;
  onBack?: () => void;
}
```

**Usage:**
```tsx
<PageHeader
  title="Dashboard"
  description="Welcome back!"
  icon={<LayoutDashboard />}
  actionLabel="New Request"
/>
```

---

#### PageSection
Consistent page section container.

**Props:**
```tsx
interface PageSectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}
```

**Usage:**
```tsx
<PageSection title="Statistics" columns={3}>
  {/* stat cards */}
</PageSection>
```

---

#### HeroSection
Large hero section with background.

**Props:**
```tsx
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}
```

**Usage:**
```tsx
<HeroSection
  title="Welcome to KindKart"
  subtitle="Help your neighbors, earn rewards"
  backgroundImage="/hero.jpg"
/>
```

---

#### ContainerGrid
Responsive grid container.

**Props:**
```tsx
interface ContainerGridProps {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
```

**Usage:**
```tsx
<ContainerGrid columns={3} gap="md">
  {cards.map(card => <Card key={card.id} {...card} />)}
</ContainerGrid>
```

---

### 💬 CHAT COMPONENTS

#### ChatMessage
Individual chat message display.

**Props:**
```tsx
interface ChatMessageProps {
  message: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
  reactions?: string[];
  onReact?: (emoji: string) => void;
}
```

---

#### ChatInput
Message input with attachments.

**Props:**
```tsx
interface ChatInputProps {
  placeholder?: string;
  onSend: (message: string) => void;
  onAttach?: () => void;
  onEmoji?: () => void;
  disabled?: boolean;
}
```

---

#### ChatHeader
Chat room header with info.

**Props:**
```tsx
interface ChatHeaderProps {
  roomName: string;
  memberCount: number;
  onlineCount: number;
  avatar?: string;
}
```

---

#### TypingIndicator
Shows when user is typing.

**Props:**
```tsx
interface TypingIndicatorProps {
  users: string[];
}
```

---

### 💳 PAYMENT COMPONENTS

#### WalletCard
Wallet balance display.

**Props:**
```tsx
interface WalletCardProps {
  balance: number;
  available: number;
  locked: number;
  currency?: string;
}
```

---

#### EscrowTracker
Escrow status tracker with stepper.

**Props:**
```tsx
interface EscrowTrackerProps {
  amount: number;
  status: 'pending' | 'locked' | 'released' | 'disputed';
  daysRemaining?: number;
  onConfirm?: () => void;
  onDispute?: () => void;
}
```

---

#### TransactionHistoryItem
Individual transaction display.

**Props:**
```tsx
interface TransactionHistoryItemProps {
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  reference: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}
```

---

### 🏆 REPUTATION COMPONENTS

#### ReputationScore
Reputation level display.

**Props:**
```tsx
interface ReputationScoreProps {
  score: number;
  level: string;
  nextLevelScore: number;
  progressToNextLevel: number;
}
```

---

#### LeaderboardEntry
Leaderboard member display.

**Props:**
```tsx
interface LeaderboardEntryProps {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  trend?: 'up' | 'down' | 'stable';
  badges?: string[];
}
```

---

#### AchievementBadge
Achievement display with rarity.

**Props:**
```tsx
interface AchievementBadgeProps {
  title: string;
  icon: ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: number;
}
```

---

#### ReputationStats
Statistics grid display.

**Props:**
```tsx
interface ReputationStatsProps {
  completed: number;
  helpfulness: number;
  responseTime: number;
  completionRate: number;
}
```

---

### 🏘️ COMMUNITY COMPONENTS

#### CommunityCard
Community showcase card.

**Props:**
```tsx
interface CommunityCardProps {
  name: string;
  description: string;
  image: string;
  memberCount: number;
  onlineCount: number;
  verified?: boolean;
}
```

---

#### MemberCard
Community member display.

**Props:**
```tsx
interface MemberCardProps {
  name: string;
  avatar: string;
  role: string;
  reputation: number;
  status: 'online' | 'offline' | 'away';
}
```

---

#### DirectoryFilter
Search and filter component.

**Props:**
```tsx
interface DirectoryFilterProps {
  onSearch: (query: string) => void;
  filters: { label: string; value: string }[];
  onFilterChange: (filter: string) => void;
}
```

---

#### AdminDashboardCard
Admin action card.

**Props:**
```tsx
interface AdminDashboardCardProps {
  icon: ReactNode;
  metric: string | number;
  description: string;
  actionLabel: string;
  onAction: () => void;
}
```

---

### 🎉 DEMO COMPONENTS

#### PremiumDemoBanner
Demo mode banner.

**Props:**
```tsx
interface PremiumDemoBannerProps {
  onStartTour: () => void;
}
```

---

#### DemoFeatureShowcase
Feature showcase grid.

**Props:**
```tsx
interface DemoFeatureShowcaseProps {
  features: Array<{
    icon: ReactNode;
    title: string;
    description: string;
  }>;
}
```

---

#### DemoGuideStep
Interactive guide step.

**Props:**
```tsx
interface DemoGuideStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  image?: string;
  tips?: string[];
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}
```

---

#### TourCompletionCelebration
Celebration modal on completion.

**Props:**
```tsx
interface TourCompletionCelebrationProps {
  onClose: () => void;
  badgeUnlocked?: string;
}
```

---

## 🎨 Theme Colors

```tsx
// Primary Colors
--primary: #6366f1 (Indigo)
--primary-light: #818cf8
--primary-dark: #4f46e5

// Semantic Colors
--success: #10b981 (Green)
--warning: #f59e0b (Amber)
--info: #3b82f6 (Blue)
--emergency: #ef4444 (Red)

// Neutral Colors
--muted: #6b7280 (Gray)
--border: #e5e7eb (Light Gray)
--background: #ffffff (Light)

// Dark Mode
--dark-background: #0f172a (Slate 900)
--dark-surface: #1e293b (Slate 800)
```

---

## 📐 Spacing Scale

```tsx
--space-xs: 0.25rem (4px)
--space-sm: 0.5rem (8px)
--space-md: 1rem (16px)
--space-lg: 1.5rem (24px)
--space-xl: 2rem (32px)
--space-2xl: 2.5rem (40px)
--space-3xl: 3rem (48px)
```

---

## 📏 Typography

```tsx
// Headings
--heading-xl: 2.25rem / 2.5rem (36px)
--heading-lg: 1.875rem / 2.25rem (30px)
--heading-md: 1.5rem / 2rem (24px)
--heading-sm: 1.25rem / 1.75rem (20px)

// Body
--body-md: 1rem / 1.5rem (16px)
--body-sm: 0.875rem / 1.25rem (14px)
--caption: 0.75rem / 1rem (12px)
```

---

## 🎬 Animations

```tsx
// Duration
Animation Duration: 300ms (smooth)
Stagger Delay: 100ms per item

// Types
- fade-in: Opacity 0 → 1
- slide-up: Transform Y +20px → 0
- scale-in: Transform scale 0.95 → 1
- float: Transform Y up/down
- shimmer: Background shimmer effect
- pulse-soft: Scale 1 → 1.1 → 1
```

---

## 🚀 Usage Examples

### Dashboard Page
```tsx
import { PageHeader, PageSection, StatCard, PremiumCard } from '@/components/ui-kit';

export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back!"
        icon={<LayoutDashboard />}
      />
      <PageSection title="Key Metrics" columns={3}>
        <StatCard label="Active" value={42} color="primary" />
        <StatCard label="Completed" value={128} color="success" />
        <StatCard label="In Progress" value={7} color="warning" />
      </PageSection>
    </>
  );
}
```

### Request Card
```tsx
import { PremiumCard, Badge, PriorityBadge } from '@/components/ui-kit';

export default function RequestList() {
  return (
    <PremiumCard hoverable interactive>
      <h3>Fix kitchen door lock</h3>
      <PriorityBadge priority="high" />
      <Badge variant="info">In Progress</Badge>
    </PremiumCard>
  );
}
```

### Chat Page
```tsx
import { ChatMessage, ChatInput, TypingIndicator } from '@/components/chat/ChatComponents';

export default function Chat() {
  return (
    <>
      <ChatMessage
        message="Hey, are you available?"
        sender={{ id: '1', name: 'John', avatar: '/john.jpg' }}
        timestamp={new Date()}
        status="read"
      />
      <TypingIndicator users={['Jane']} />
      <ChatInput onSend={(msg) => console.log(msg)} />
    </>
  );
}
```

---

## ✨ Tips & Best Practices

1. **Use ContainerGrid for layouts** - Automatically responsive
2. **Combine cards with StatCard** - For dashboards
3. **Use AnimatedProgressRing** - For achievement displays
4. **Stack PageSection** - For consistent layouts
5. **Use EmptyState** - For no-data scenarios
6. **Apply Badge variants** - For status indicators
7. **Use Pulse** - For real-time indicators
8. **Combine components** - They work together!

---

## 🔗 File Locations

All components in: `src/components/ui-kit/`

Individual feature components:
- Chat: `src/components/chat/ChatComponents.tsx`
- Payment: `src/components/payment/EscrowComponents.tsx`
- Reputation: `src/components/reputation/ReputationComponents.tsx`
- Community: `src/components/community/CommunityComponents.tsx`
- Demo: `src/components/PremiumDemoComponents.tsx`

---

**Version:** 1.0.0  
**Last Updated:** February 12, 2026
