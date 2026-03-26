'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { PageHeader, PremiumCard } from '@/components/ui-kit';
import { RequestCard, RequestsGrid, RequestFilterBar } from '@/components/requests';
import { Button } from '@/components/ui/button';
import { Plus, Filter, RefreshCw, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { createDemoRequestsForCommunities, demoCommunityMemberships, demoRequests } from '@/lib/demo-data';

type UiCategory = 'home' | 'technical' | 'personal' | 'professional' | 'emergency' | 'health';
type UiUrgency = 'low' | 'medium' | 'high' | 'urgent';
type UiStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';

interface ApiRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location?: string;
  createdAt: string;
  communityId: string;
  requesterId: string;
  requester?: { name?: string; reputationScore?: number };
  responses?: Array<{ id: string; helperId: string; message: string; status: string }>;
}

interface UiRequest {
  id: string;
  title: string;
  description: string;
  category: UiCategory;
  urgency: UiUrgency;
  reward?: number;
  location?: string;
  postedBy: { name: string; rating: number };
  status: UiStatus;
  postedTime: string;
  communityId: string;
  requesterId: string;
  responses: Array<{ id: string; helperId: string; message: string; status: string }>;
}

function mapCategory(raw: string): UiCategory {
  const normalized = raw?.toLowerCase() || '';
  if (normalized.includes('home')) return 'home';
  if (normalized.includes('tech')) return 'technical';
  if (normalized.includes('professional')) return 'professional';
  if (normalized.includes('emergency')) return 'emergency';
  if (normalized.includes('health')) return 'health';
  return 'personal';
}

function mapStatus(raw: string): UiStatus {
  if (raw === 'pending') return 'open';
  if (raw === 'accepted' || raw === 'in_progress') return 'in-progress';
  if (raw === 'completed') return 'completed';
  if (raw === 'cancelled') return 'cancelled';
  return 'open';
}

function deriveUrgency(category: UiCategory, createdAt: string): UiUrgency {
  if (category === 'emergency') return 'urgent';
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
  if (ageHours < 1) return 'high';
  if (ageHours < 6) return 'medium';
  return 'low';
}

function formatPostedTime(ts: string): string {
  const diffHours = (Date.now() - new Date(ts).getTime()) / 3600000;
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function toUiRequests(input: ApiRequest[]): UiRequest[] {
  return input.map((request) => {
    const category = mapCategory(request.category);
    return {
      id: request.id,
      title: request.title,
      description: request.description,
      category,
      urgency: deriveUrgency(category, request.createdAt),
      reward: category === 'emergency' ? 1000 : 250,
      location: request.location || 'Neighborhood',
      postedBy: {
        name: request.requester?.name || 'Neighbor',
        rating: typeof request.requester?.reputationScore === 'number' ? request.requester.reputationScore : 4.7,
      },
      status: mapStatus(request.status),
      postedTime: formatPostedTime(request.createdAt),
      communityId: request.communityId,
      requesterId: request.requesterId,
      responses: Array.isArray(request.responses) ? request.responses : [],
    };
  });
}

export default function RequestsFeed() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, isGuest, demoMode } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<UiRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }
    void loadRequests();
  }, [isAuthenticated, isHydrated, router, user]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isGuest || demoMode) {
        const demoCommunityIds = demoCommunityMemberships.map((entry) => entry.community.id);
        const seeded = createDemoRequestsForCommunities(demoCommunityIds) as unknown as ApiRequest[];
        setRequests(toUiRequests(seeded));
        return;
      }

      const communities = await api.users.getCommunities();
      const communityIds = Array.isArray(communities)
        ? communities.map((entry: any) => entry?.community?.id).filter(Boolean)
        : [];

      if (communityIds.length === 0) {
        setRequests([]);
        return;
      }

      const responses = await Promise.allSettled(
        communityIds.map((communityId: string) => api.requests.getByCommunity(communityId))
      );

      const merged = responses
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .flatMap((r) => (Array.isArray(r.value) ? r.value : []));

      setRequests(toUiRequests(merged as ApiRequest[]));
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load live requests, showing demo data');
      setRequests(toUiRequests(demoRequests as unknown as ApiRequest[]));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (selectedCategory && request.category !== selectedCategory) return false;
      if (selectedUrgency && request.urgency !== selectedUrgency) return false;
      if (selectedStatus && request.status !== selectedStatus) return false;
      if (searchTerm) {
        const text = `${request.title} ${request.description} ${request.location} ${request.postedBy.name}`.toLowerCase();
        if (!text.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }, [requests, selectedCategory, selectedUrgency, selectedStatus, searchTerm]);

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedUrgency('');
    setSelectedStatus('');
    setSearchTerm('');
  };

  const handleRespond = async (request: UiRequest) => {
    if (!user) return;

    const responseMessage =
      request.category === 'emergency'
        ? 'I am nearby and can assist immediately.'
        : 'I can help with this request. Let us coordinate timing.';

    try {
      if (isGuest || demoMode) {
        setRequests((prev) =>
          prev.map((item) =>
            item.id === request.id
              ? {
                  ...item,
                  status: 'in-progress',
                  responses: [
                    ...item.responses,
                    {
                      id: `local-response-${Date.now()}`,
                      helperId: user.id,
                      message: responseMessage,
                      status: 'pending',
                    },
                  ],
                }
              : item
          )
        );
        return;
      }

      setIsSubmitting(request.id);
      await api.requests.respond(request.id, responseMessage);
      await loadRequests();
    } catch {
      setError('Unable to respond to this request right now. Please try again.');
    } finally {
      setIsSubmitting(null);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Browse Help Requests"
          description={`${filteredRequests.length} ${filteredRequests.length === 1 ? 'request' : 'requests'} available`}
          icon={<Filter className="h-6 w-6" />}
          actions={
            <Button size="sm" className="gap-2" onClick={() => router.push('/requests/create')}>
              <Plus className="h-4 w-4" />
              Create Request
            </Button>
          }
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="mb-4">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, description, location, or neighbor"
                className="input-premium w-full"
              />
            </div>
            <RequestFilterBar
              selectedCategory={selectedCategory}
              selectedUrgency={selectedUrgency}
              selectedStatus={selectedStatus}
              onCategoryChange={setSelectedCategory}
              onUrgencyChange={setSelectedUrgency}
              onStatusChange={setSelectedStatus}
              onReset={handleReset}
            />
          </motion.div>

          {error && (
            <PremiumCard className="mb-6 border-rose-300/50 bg-rose-500/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-rose-300">{error}</p>
                <Button size="sm" variant="outline" className="gap-2" onClick={loadRequests}>
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
              </div>
            </PremiumCard>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-56 rounded-xl border border-border/30 bg-card/30 animate-pulse" />
              ))}
            </div>
          ) : filteredRequests.length > 0 ? (
            <RequestsGrid>
              {filteredRequests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="space-y-3"
                >
                  <RequestCard
                    {...request}
                    onAccept={request.requesterId !== user.id && request.status === 'open' ? () => handleRespond(request) : undefined}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => router.push(`/requests/${request.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs"
                      disabled={isSubmitting === request.id || request.requesterId === user.id || request.status !== 'open'}
                      onClick={() => handleRespond(request)}
                    >
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                      {isSubmitting === request.id ? 'Responding...' : 'Respond'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </RequestsGrid>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No requests found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or create a new request</p>
              <Button onClick={() => router.push('/requests/create')}>Create Request</Button>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
