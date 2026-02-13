'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useHydration } from '@/hooks/useHydration';
import { api } from '@/lib/api';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { StatCard, PremiumCard, PageHeader, PageSection, ContainerGrid, Badge } from '@/components/ui-kit';
import { NeighborhoodActivityPulse } from '@/components/dashboard/NeighborhoodActivityPulse';
import { TrustScoreVisualization } from '@/components/dashboard/TrustScoreVisualization';
import { TopHelpersWidget } from '@/components/dashboard/TopHelpersWidget';
import { CommunityHealthScore } from '@/components/dashboard/CommunityHealthScore';
import { TrustRadar } from '@/components/dashboard/TrustRadar';
import {
  Plus, Users, HelpCircle, MessageCircle, Trophy, ArrowRight,
  Activity, Zap, Shield, AlertTriangle, Calendar, Target
} from 'lucide-react';

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
        console.warn('Communities unavailable:', error);
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
          <div className="text-center space-y-4">
            <Skeleton className="mx-auto h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </AppShell>
    );
  }

  const quickActions = [
    { icon: Plus, label: 'Create Request', desc: 'Ask for help', href: '/requests/create', color: 'from-blue-500 to-cyan-500' },
    { icon: HelpCircle, label: 'Browse Requests', desc: 'Help neighbors', href: '/requests', color: 'from-purple-500 to-pink-500' },
    { icon: MessageCircle, label: 'Messages', desc: 'Chat with helpers', href: '/chat', color: 'from-green-500 to-emerald-500' },
    { icon: Users, label: 'Community', desc: 'Manage groups', href: '/communities/join', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title={`Welcome, ${user?.name?.split(' ')[0] || 'Neighbor'}`}
          description={`${communities.length} ${communities.length === 1 ? 'community' : 'communities'} \u2022 Mission Control Active`}
          icon={<Activity className="h-6 w-6" />}
          actions={
            <Button size="sm" className="gap-2" onClick={() => router.push('/requests/create')}>
              <Plus className="h-4 w-4" /> New Request
            </Button>
          }
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          {/* Neighborhood Activity Pulse */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <NeighborhoodActivityPulse />
          </motion.div>

          {/* Stats Row */}
          <PageSection title="Mission Control" subtitle="Your neighborhood at a glance" noBorder>
            <ContainerGrid columns={4}>
              {[
                { label: 'Active Requests', value: '12', icon: <HelpCircle className="h-5 w-5" />, trend: { direction: 'up' as const, value: 23 }, color: 'primary' as const },
                { label: 'Completed Today', value: '8', icon: <Zap className="h-5 w-5" />, trend: { direction: 'up' as const, value: 15 }, color: 'success' as const },
                { label: 'Community Members', value: '547', icon: <Users className="h-5 w-5" />, trend: { direction: 'up' as const, value: 8 }, color: 'info' as const },
                { label: 'Your Reputation', value: '4.8', icon: <Trophy className="h-5 w-5" />, color: 'warning' as const },
              ].map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}>
                  <StatCard {...stat} />
                </motion.div>
              ))}
            </ContainerGrid>
          </PageSection>

          {/* Main Grid - Trust Radar + Community Health + Top Helpers */}
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
              <TrustRadar trustScore={92} communityVibe={87} goodDeeds={34} suspiciousAlerts={1} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
              <CommunityHealthScore />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
              <TopHelpersWidget />
            </motion.div>
          </div>

          {/* Urgent Requests + Emergency Status */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <PremiumCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h3 className="font-semibold text-sm">Urgent Requests</h3>
                  <Badge variant="warning" className="ml-auto">3 Active</Badge>
                </div>
                <div className="space-y-3">
                  {[
                    { title: 'Medical Emergency - First Aid', location: 'Block A', time: '15 min ago', urgency: 'emergency' },
                    { title: 'Plumbing leak - urgent fix needed', location: 'Block C', time: '32 min ago', urgency: 'high' },
                    { title: 'Lost pet - Golden Retriever', location: 'Park Area', time: '1 hour ago', urgency: 'high' },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      <div className={cn('h-2 w-2 rounded-full flex-shrink-0', req.urgency === 'emergency' ? 'bg-red-400 animate-pulse' : 'bg-amber-400')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{req.title}</p>
                        <p className="text-xs text-muted-foreground">{req.location} &middot; {req.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <PremiumCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-semibold text-sm">Emergency Status</h3>
                  <Badge variant="success" className="ml-auto">All Clear</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">No active emergencies</p>
                      <p className="text-xs text-muted-foreground">Last incident: 3 days ago &middot; Resolved</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-muted/20 text-center">
                      <p className="text-lg font-bold text-foreground">24</p>
                      <p className="text-[10px] text-muted-foreground">Responders Online</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 text-center">
                      <p className="text-lg font-bold text-foreground">2.1m</p>
                      <p className="text-[10px] text-muted-foreground">Avg Response Time</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/safety')}>
                    <Shield className="h-4 w-4 mr-2" /> Safety Center
                  </Button>
                </div>
              </PremiumCard>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <PageSection title="Quick Actions" noBorder>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <motion.div key={action.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.05 }}>
                  <PremiumCard interactive elevated className="p-4 cursor-pointer" onClick={() => router.push(action.href)}>
                    <div className={cn('h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white mb-3', action.color)}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          </PageSection>

          {/* Communities */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 rounded-2xl border border-border/30 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : communities.length > 0 ? (
            <PageSection title="Your Communities" subtitle={`Active in ${communities.length}`} noBorder>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {communities.map((c, idx) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + idx * 0.05 }}>
                    <PremiumCard interactive elevated className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{c.community.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">Role: {c.role}</p>
                        </div>
                        <Badge variant="primary">{c.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">Joined {new Date(c.joinedAt).toLocaleDateString()}</p>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => router.push(`/communities/${c.community.id}`)}>
                        View Community
                      </Button>
                    </PremiumCard>
                  </motion.div>
                ))}
              </div>
            </PageSection>
          ) : (
            <PremiumCard className="p-8 text-center border-dashed">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No communities yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Join or create a community to get started.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push('/communities/create')}><Plus className="h-4 w-4 mr-2" /> Create</Button>
                <Button variant="outline" onClick={() => router.push('/communities/join')}><Users className="h-4 w-4 mr-2" /> Join</Button>
              </div>
            </PremiumCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
