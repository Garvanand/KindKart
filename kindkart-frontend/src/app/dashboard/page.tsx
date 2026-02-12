'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useHydration } from '@/hooks/useHydration';
import { api } from '@/lib/api';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, HelpCircle, MessageCircle, Trophy, Wallet, ArrowRight, TrendingUp, Activity, Heart, Zap, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AIAssistant } from '@/components/AIAssistant';
import { DemoMode } from '@/components/DemoMode';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { StatCard, PremiumCard, Pulse, PageHeader, PageSection, ContainerGrid, Badge } from '@/components/ui-kit';
import { NeighborhoodActivityPulse } from '@/components/dashboard/NeighborhoodActivityPulse';
import { TrustScoreVisualization } from '@/components/dashboard/TrustScoreVisualization';
import { TopHelpersWidget } from '@/components/dashboard/TopHelpersWidget';
import { CommunityHealthScore } from '@/components/dashboard/CommunityHealthScore';

interface Community {
  id: string;
  community: {
    id: string;
    name: string;
    inviteCode: string;
    createdAt: string;
  };
  role: string;
  status: string;
  joinedAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const isClientHydrated = useHydration();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isFullyHydrated = isHydrated && isClientHydrated;

  useEffect(() => {
    if (!isFullyHydrated) return;
    const loadCommunities = async () => {
      try {
        if (isAuthenticated) {
          const data = await api.users.getCommunities();
          setCommunities(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.warn('Communities unavailable (backend may be off):', error);
        setCommunities([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadCommunities();
  }, [isAuthenticated, isFullyHydrated]);

  if (!isFullyHydrated) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <Skeleton className="mx-auto mb-4 h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </AppShell>
    );
  }

  const quickActions = [
    { icon: Plus, label: 'Create Request', href: '/requests/create', color: 'from-blue-500 to-cyan-500' },
    { icon: HelpCircle, label: 'Browse Requests', href: '/requests', color: 'from-purple-500 to-pink-500' },
    { icon: MessageCircle, label: 'Messages', href: '/chat', color: 'from-green-500 to-emerald-500' },
    { icon: Users, label: 'Community', href: '/communities', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        {/* Premium Page Header */}
        <PageHeader
          title={`Welcome, ${user?.name?.split(' ')[0] || 'Neighbor'}`}
          description={`${communities.length} ${communities.length === 1 ? 'community' : 'communities'} • Mission Control Active`}
          icon={<Activity className="h-6 w-6" />}
          actions={
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          }
        />

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Hero Section - Neighborhood Activity Pulse */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <NeighborhoodActivityPulse />
          </motion.div>

          {/* Stats Row - Mission Control Metrics */}
          <PageSection
            title="Mission Control"
            subtitle="Your neighborhood at a glance"
            noBorder
            className="mb-8"
          >
            <ContainerGrid columns={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <StatCard
                  label="Active Requests"
                  value="12"
                  icon={<HelpCircle className="h-5 w-5" />}
                  trend={{ direction: 'up', value: 23 }}
                  color="primary"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <StatCard
                  label="Completed Today"
                  value="8"
                  icon={<Zap className="h-5 w-5" />}
                  trend={{ direction: 'up', value: 15 }}
                  color="success"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <StatCard
                  label="Community Members"
                  value="547"
                  icon={<Users className="h-5 w-5" />}
                  trend={{ direction: 'up', value: 8 }}
                  color="info"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <StatCard
                  label="Your Reputation"
                  value="4.8"
                  icon={<Trophy className="h-5 w-5" />}
                  color="warning"
                />
              </motion.div>
            </ContainerGrid>
          </PageSection>

          {/* Three Column Layout - Analytics & Insights */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {/* Column 1: Trust Score & Top Helpers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <TrustScoreVisualization />
            </motion.div>

            {/* Column 2: Community Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <CommunityHealthScore />
            </motion.div>

            {/* Column 3: Top Helpers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <TopHelpersWidget />
            </motion.div>
          </div>

          Quick Actions
          <PageSection
            title="Quick Actions"
            noBorder
            className="mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + idx * 0.05 }}
                >
                  <PremiumCard interactive elevated>
                    <Button
                      variant="ghost"
                      className="w-full h-auto p-4 flex flex-col items-start gap-3 justify-start hover:bg-primary/10"
                      onClick={() => router.push(action.href)}
                    >
                      <div className={cn(
                        'h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white',
                        `bg-gradient-to-br ${action.color}`
                      )}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground">Click to get started</p>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-foreground" />
                    </Button>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          </PageSection>

          {/* Communities Section */}
          {communities.length > 0 && (
            <PageSection
              title="Your Communities"
              subtitle={`Active in ${communities.length} ${communities.length === 1 ? 'community' : 'communities'}`}
              noBorder
              className="mb-8"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {communities.map((community, idx) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + idx * 0.05 }}
                  >
                    <PremiumCard interactive elevated>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{community.community.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">Role: {community.role}</p>
                        </div>
                        <Badge variant="primary">{community.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">
                        Joined {new Date(community.joinedAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/communities/${community.community.id}`)}
                      >
                        View Community
                      </Button>
                    </PremiumCard>
                  </motion.div>
                ))}
              </div>
            </PageSection>
          )}
        </div>

        {/* Quick Actions
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Quick actions
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Create Community',
                description: 'Start your own group',
                icon: Plus,
                href: '/communities/create',
                variant: 'primary' as const,
              },
              {
                label: 'Join Community',
                description: 'Enter invite code',
                icon: Users,
                href: '/communities/join',
                variant: 'outline' as const,
              },
              {
                label: 'Request Help',
                description: 'Ask neighbors for help',
                icon: HelpCircle,
                href:
                  communities.length > 0
                    ? `/communities/${communities[0].community.id}/requests/create`
                    : '/communities/join',
                variant: 'outline' as const,
              },
              {
                label: 'Chat',
                description: 'Message neighbors',
                icon: MessageCircle,
                href: '/chat',
                variant: 'outline' as const,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className={cn(
                    'cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/50',
                    item.variant === 'primary' && 'border-primary/30 bg-primary/5'
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        item.variant === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Your Communities */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Your communities
            </h2>
            {communities.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => router.push('/communities/join')}>
                <Plus className="mr-2 h-4 w-4" />
                Join another
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : communities.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">No communities yet</CardTitle>
                <CardDescription className="mt-1 max-w-sm">
                  Create a community or join one with an invite code to see requests and chat with neighbors.
                </CardDescription>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => router.push('/communities/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create community
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/communities/join')}>
                    <Users className="mr-2 h-4 w-4" />
                    Join with code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((membership) => (
                <Card
                  key={membership.id}
                  className="cursor-pointer transition-colors hover:border-primary/30 hover:bg-muted/30"
                  onClick={() => router.push(`/communities/${membership.community.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold">
                        {membership.community.name}
                      </CardTitle>
                      <Badge variant={membership.role === 'admin' ? 'primary' : 'ghost'} className="shrink-0">
                        {membership.role}
                      </Badge>
                    </div>
                    <CardDescription>
                      Joined {new Date(membership.joinedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-md border bg-muted/50 px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">Invite code</p>
                      <code className="text-sm font-mono font-medium text-foreground">
                        {membership.community.inviteCode}
                      </code>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/communities/${membership.community.id}`);
                      }}
                    >
                      View community
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Explore */}
        {/* <div className="mb-8">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Explore
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Reputation', description: 'Badges & leaderboard', icon: Trophy, href: '/reputation' },
              { label: 'Wallet', description: 'Payments & transactions', icon: Wallet, href: '/wallet' },
              { label: 'Achievements', description: 'Progress & badges', icon: Award, href: '/reputation' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.label}
                  className="cursor-pointer transition-colors hover:border-primary/30 hover:bg-muted/30"
                  onClick={() => router.push(item.href)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div> */}


        {/* Demo & AI */}
        {/* <div className="grid gap-6 lg:grid-cols-2">
          <DemoMode />
          <AIAssistant context="your dashboard and community features" />
        </div> */}
      </div>
    </AppShell>
  );
}

