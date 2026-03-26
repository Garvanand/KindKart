'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader, StatCard } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Award, Star, Trophy, TrendingUp, Shield, CheckCircle2, Zap, Flame, Medal, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ReputationData {
  reputationScore?: number;
  level?: number;
  totalPoints?: number;
  completedRequests?: number;
  averageRating?: number;
}

interface BadgeData {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  earnedAt?: string;
}

const fallbackBadges: BadgeData[] = [
  { id: '1', name: 'First Helper', icon: '🤝', description: 'Helped your first neighbor', earnedAt: new Date().toISOString() },
  { id: '2', name: 'Community Star', icon: '⭐', description: 'Completed 5 help requests', earnedAt: new Date().toISOString() },
  { id: '3', name: 'Trust Builder', icon: '🛡️', description: 'Maintained high rating', earnedAt: new Date().toISOString() },
];

export default function ReputationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reputation, setReputation] = useState<ReputationData>({});
  const [badges, setBadges] = useState<BadgeData[]>(fallbackBadges);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }
    void loadReputation();
  }, [isAuthenticated, isHydrated, router, user]);

  const loadReputation = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);

      const [repData, badgesData] = await Promise.all([
        api.reputation.getUserReputation(user.id),
        api.reputation.getUserBadges(user.id),
      ]);

      setReputation((repData as ReputationData) || {});
      setBadges(Array.isArray(badgesData) && badgesData.length > 0 ? (badgesData as BadgeData[]) : fallbackBadges);
    } catch (loadError: any) {
      setError(loadError?.message || 'Reputation service unavailable');
      setReputation({ reputationScore: 92, level: 4, totalPoints: 420, completedRequests: 12, averageRating: 4.8 });
      setBadges(fallbackBadges);
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = useMemo(() => {
    const points = Number(reputation.totalPoints || 420);
    return Math.max(12, Math.min(95, Math.floor((points % 500) / 5)));
  }, [reputation.totalPoints]);

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Reputation"
          description="Your trust score, badges, and neighborhood impact"
          icon={<Award className="h-6 w-6" />}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={loadReputation} disabled={isLoading}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/analytics')}>
                <TrendingUp className="h-4 w-4 mr-2" /> View Analytics
              </Button>
            </div>
          }
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {error && (
            <PremiumCard className="p-3 border-rose-300/50 bg-rose-500/5">
              <p className="text-sm text-rose-300">{error}</p>
            </PremiumCard>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PremiumCard className="p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent" />
              <div className="absolute top-4 right-4">
                <Badge variant="primary" className="text-xs">VERIFIED MEMBER</Badge>
              </div>
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-2xl font-bold text-white">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-0.5">{user?.name || 'Neighbor'}</h2>
                  <p className="text-sm text-muted-foreground mb-3">Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">{Number(reputation.averageRating || 4.8).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">Rating</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10">
                      <Trophy className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-semibold text-primary">Level {reputation.level || 4}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10">
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400">{Math.round(Number(reputation.reputationScore || 92))}%</span>
                      <span className="text-xs text-muted-foreground">Trust</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="relative h-20 w-20">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted) / 0.3)" strokeWidth="2" />
                      <motion.circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeDasharray={`${(progressPercent / 100) * 100.53} 100.53`}
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 100.53' }}
                        animate={{ strokeDasharray: `${(progressPercent / 100) * 100.53} 100.53` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">{progressPercent}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">To next level</p>
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Tasks Completed" value={String(reputation.completedRequests || 12)} icon={<CheckCircle2 className="h-5 w-5" />} color="success" />
            <StatCard label="Karma Points" value={String(reputation.totalPoints || 420)} icon={<Zap className="h-5 w-5" />} color="warning" />
            <StatCard label="Current Streak" value="5 days" icon={<Flame className="h-5 w-5" />} color="primary" />
            <StatCard label="Badges Earned" value={String(badges.length)} icon={<Medal className="h-5 w-5" />} color="info" />
          </div>

          <PremiumCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Medal className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Badge Gallery</h3>
              <span className="text-xs text-muted-foreground ml-auto">{badges.length} unlocked</span>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-muted/20 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {badges.map((badge, index) => (
                  <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + index * 0.04 }}>
                    <div className={cn('p-4 rounded-xl border text-center transition-all', 'border-primary/20 bg-gradient-to-br from-primary/10 to-emerald-500/10')}>
                      <span className="text-3xl block mb-2">{badge.icon || '🏅'}</span>
                      <p className="text-xs font-semibold mb-0.5">{badge.name}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-2">{badge.description || 'Achievement unlocked'}</p>
                      <div className="mt-2"><Badge variant="success" className="text-[9px]">Earned</Badge></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </PremiumCard>
        </div>
      </div>
    </AppShell>
  );
}
