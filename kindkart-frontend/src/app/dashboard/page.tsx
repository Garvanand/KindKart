'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useHydration } from '@/hooks/useHydration';
import { api } from '@/lib/api';
import { AppShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PremiumCard, Badge } from '@/components/ui-kit';
import { cn } from '@/lib/utils';
import { Bell, MessageCircle, Plus, Search, Shield, Users, Zap } from 'lucide-react';
import { demoCommunityMemberships, demoConversations, demoRequests, demoWalletStats } from '@/lib/demo-data';

interface Community {
  id: string;
  role: string;
  status: string;
  joinedAt: string;
  community: {
    id: string;
    name: string;
    inviteCode: string;
  };
}

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  category?: string;
  createdAt?: string;
  requester?: { name?: string };
  communityId?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, isGuest, demoMode } = useAuthStore();
  const isClientHydrated = useHydration();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [conversationCount, setConversationCount] = useState(0);
  const [reputationScore, setReputationScore] = useState<number | null>(null);

  const isFullyHydrated = isHydrated && isClientHydrated;

  useEffect(() => {
    if (!isFullyHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    void loadDashboardData();
  }, [isFullyHydrated, isAuthenticated, router, user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    if (isGuest || demoMode) {
      setCommunities(demoCommunityMemberships as Community[]);
      setRequests(demoRequests as HelpRequest[]);
      setConversationCount(demoConversations.length);
      setReputationScore(Math.round((demoWalletStats.totalEarned - demoWalletStats.totalSpent) / 100));
      setIsLoading(false);
      return;
    }

    try {
      const userCommunitiesRaw = await api.users.getCommunities();
      const userCommunities = Array.isArray(userCommunitiesRaw) ? userCommunitiesRaw : [];
      setCommunities(userCommunities as Community[]);

      const communityIds = userCommunities.map((item: any) => item?.community?.id).filter(Boolean).slice(0, 5);

      const [requestsByCommunity, conversationsRaw, reputationRaw] = await Promise.all([
        Promise.all(communityIds.map((communityId: string) => api.requests.getByCommunity(communityId).catch(() => []))),
        api.messages.getConversations().catch(() => []),
        api.reputation.getUserReputation(user.id).catch(() => null),
      ]);

      const mergedRequests = requestsByCommunity
        .flatMap((list: any) => (Array.isArray(list) ? list : []))
        .filter(Boolean)
        .sort((a: any, b: any) => {
          const at = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bt = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bt - at;
        })
        .slice(0, 10);

      setRequests(mergedRequests as HelpRequest[]);
      setConversationCount(Array.isArray(conversationsRaw) ? conversationsRaw.length : 0);

      const score = Number((reputationRaw as any)?.reputationScore || 0);
      setReputationScore(Number.isFinite(score) && score > 0 ? score : null);
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to load live data, showing demo activity');
      setCommunities(demoCommunityMemberships as Community[]);
      setRequests(demoRequests as HelpRequest[]);
      setConversationCount(demoConversations.length);
      setReputationScore(Math.round((demoWalletStats.totalEarned - demoWalletStats.totalSpent) / 100));
    } finally {
      setIsLoading(false);
    }
  };

  const openRequestCount = useMemo(
    () => requests.filter((request) => String(request.status || '').toLowerCase() === 'pending').length,
    [requests]
  );

  const resolvedRequestCount = useMemo(
    () => requests.filter((request) => String(request.status || '').toLowerCase() === 'completed').length,
    [requests]
  );

  if (!isFullyHydrated || !isAuthenticated || !user) {
    return (
      <AppShell>
        <div className="min-h-screen bg-[#f4f6f3] p-6">
          <Skeleton className="h-12 w-56" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#f4f6f3]">
        <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[270px_minmax(0,1fr)_320px] lg:gap-5">
          <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
            <PremiumCard className="border-[#dbe3db] bg-white p-4">
              <p className="text-sm text-[#607166]">Good to see you,</p>
              <h2 className="text-[1.35rem] font-semibold tracking-tight text-[#1f3127] mt-1">{user.name}</h2>
              <p className="text-xs text-[#6f7f75] mt-2">
                {isGuest ? 'Guest mode active' : `${communities.length} joined community${communities.length === 1 ? '' : 'ies'}`}
              </p>
              {demoMode && <Badge variant="warning" className="mt-3">Demo Mode</Badge>}
            </PremiumCard>

            <PremiumCard className="border-[#dbe3db] bg-white p-4 space-y-2">
              <Button className="w-full rounded-full bg-[#1f8a4d] hover:bg-[#176f3d]" onClick={() => router.push('/requests/create')}>
                <Plus className="h-4 w-4 mr-2" /> Post Request
              </Button>
              <Button variant="outline" className="w-full rounded-full border-[#d4ddd4]" onClick={() => router.push('/chat')}>
                <MessageCircle className="h-4 w-4 mr-2" /> Open Messages
              </Button>
              <Button variant="outline" className="w-full rounded-full border-[#d4ddd4]" onClick={() => router.push('/communities')}>
                <Users className="h-4 w-4 mr-2" /> View Groups
              </Button>
            </PremiumCard>

            <PremiumCard className="border-[#dbe3db] bg-white p-4">
              <h3 className="text-sm font-semibold text-[#273a30] mb-3">Live Snapshot</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#5d6f64]">Open requests</span>
                  <span className="font-semibold text-[#203228]">{openRequestCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5d6f64]">Resolved recently</span>
                  <span className="font-semibold text-[#203228]">{resolvedRequestCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5d6f64]">Active chats</span>
                  <span className="font-semibold text-[#203228]">{conversationCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5d6f64]">Trust score</span>
                  <span className="font-semibold text-[#203228]">{reputationScore ?? 'N/A'}</span>
                </div>
              </div>
            </PremiumCard>
          </aside>

          <main className="space-y-3.5">
            <PremiumCard className="border-[#dbe3db] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#dbe8dc] flex items-center justify-center text-[#2e4839] font-semibold">
                  {(user.name || 'U').slice(0, 1).toUpperCase()}
                </div>
                <button
                  onClick={() => router.push('/requests/create')}
                  className="flex-1 text-left rounded-full bg-[#f0f3ef] px-4 py-2.5 text-[15px] text-[#627468] hover:bg-[#e9eee8] transition-colors"
                >
                  What does your neighborhood need today?
                </button>
                <Button className="rounded-full bg-[#1f8a4d] hover:bg-[#176f3d]" onClick={() => router.push('/requests/create')}>
                  Post
                </Button>
              </div>
            </PremiumCard>

            {error && (
              <PremiumCard className="border-rose-300/40 bg-rose-500/5 p-3">
                <p className="text-sm text-rose-300">{error}</p>
              </PremiumCard>
            )}

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['For you', 'Recent', 'Needs help', 'Resolved'].map((label, index) => (
                <button
                  key={label}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap',
                    index === 0
                      ? 'border-[#304839] bg-white text-[#26382f]'
                      : 'border-[#d5ddd6] bg-[#f2f5f1] text-[#55685d]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((row) => (
                  <PremiumCard key={row} className="border-[#dbe3db] bg-white p-4">
                    <Skeleton className="h-5 w-56 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-4/5" />
                  </PremiumCard>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <PremiumCard className="border-[#dbe3db] bg-white p-10 text-center">
                <Search className="h-10 w-10 text-[#89a092] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-[#22342b]">No requests yet</h3>
                <p className="text-sm text-[#607166] mt-1 mb-5">Be the first to post or join a community request thread.</p>
                <Button className="rounded-full bg-[#1f8a4d] hover:bg-[#176f3d]" onClick={() => router.push('/requests/create')}>
                  Create your first request
                </Button>
              </PremiumCard>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <PremiumCard key={request.id} interactive className="border-[#dbe3db] bg-white p-4" onClick={() => router.push(`/requests/${request.id}`)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[20px] font-semibold tracking-tight text-[#22342b] leading-snug">{request.title}</h3>
                        <p className="text-sm text-[#56675d] mt-1 line-clamp-2">{request.description}</p>
                      </div>
                      <Badge variant={String(request.status).toLowerCase() === 'completed' ? 'success' : 'warning'}>
                        {String(request.status || 'pending').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6c7f73]">
                      {request.category && <span>{request.category}</span>}
                      {request.createdAt && <span>• {new Date(request.createdAt).toLocaleString()}</span>}
                      {request.requester?.name && <span>• by {request.requester.name}</span>}
                    </div>
                  </PremiumCard>
                ))}
              </div>
            )}
          </main>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
            <PremiumCard className="border-[#dbe3db] bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#24362c]">Your neighborhood</h3>
                <Bell className="h-4 w-4 text-[#6e7f74]" />
              </div>
              {communities.length === 0 ? (
                <p className="text-sm text-[#607166]">You have not joined any communities yet.</p>
              ) : (
                <div className="space-y-2">
                  {communities.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => router.push(`/communities/${item.community.id}`)}
                      className="w-full rounded-lg bg-[#f1f5f1] px-3 py-2 text-left hover:bg-[#e8eee8] transition-colors"
                    >
                      <p className="text-sm font-semibold text-[#24362c]">{item.community.name}</p>
                      <p className="text-xs text-[#66796d] mt-0.5">{item.role} • {item.status}</p>
                    </button>
                  ))}
                </div>
              )}
            </PremiumCard>

            <PremiumCard className="border-[#dbe3db] bg-white p-4">
              <h3 className="text-sm font-semibold text-[#24362c] mb-3">Trust and safety</h3>
              <div className="space-y-3">
                <div className="rounded-lg border border-[#dbe3db] bg-[#f6faf6] p-3">
                  <div className="flex items-center gap-2 text-[#2c7f4b]">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-semibold">Safety center online</span>
                  </div>
                  <p className="text-xs text-[#5d6f64] mt-1">Emergency workflows and check-ins are available for your area.</p>
                </div>
                <Button variant="outline" className="w-full rounded-full border-[#d3ddd3]" onClick={() => router.push('/safety')}>
                  Open Safety Center
                </Button>
                <Button variant="outline" className="w-full rounded-full border-[#d3ddd3]" onClick={() => router.push('/karma-shop')}>
                  <Zap className="h-4 w-4 mr-2" /> Visit Karma Marketplace
                </Button>
              </div>
            </PremiumCard>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
