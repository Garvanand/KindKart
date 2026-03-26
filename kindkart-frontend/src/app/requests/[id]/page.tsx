'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { PageHeader, PremiumCard, Badge } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, MapPin, Clock, User } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface RequestDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location?: string;
  communityId: string;
  createdAt: string;
  requester?: { id: string; name: string };
  responses?: Array<{ id: string; message: string; helper?: { name?: string } }>;
}

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    const loadRequest = async () => {
      try {
        setIsLoading(true);
        const data = await api.requests.get(params.id as string);
        setRequest(data as RequestDetails);
      } catch (loadError: any) {
        setError(loadError?.message || 'Unable to load request details');
      } finally {
        setIsLoading(false);
      }
    };

    void loadRequest();
  }, [isAuthenticated, isHydrated, params.id, router, user]);

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Request Details"
          description="Review request context before responding"
          icon={<MessageCircle className="h-6 w-6" />}
          actions={
            <Button variant="outline" size="sm" onClick={() => router.push('/requests')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Requests
            </Button>
          }
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="h-60 rounded-xl border border-border/30 bg-card/30 animate-pulse" />
          ) : error ? (
            <PremiumCard className="p-6 text-center border-rose-300/50 bg-rose-500/5">
              <p className="text-sm text-rose-300 mb-4">{error}</p>
              <Button onClick={() => router.push('/requests')}>Back to feed</Button>
            </PremiumCard>
          ) : request ? (
            <PremiumCard className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-foreground">{request.title}</h1>
                <Badge variant={request.status === 'completed' ? 'success' : request.status === 'cancelled' ? 'ghost' : 'primary'}>
                  {request.status}
                </Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed">{request.description}</p>

              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-border/40 p-3">
                  <p className="text-muted-foreground mb-1">Category</p>
                  <p className="font-medium capitalize">{request.category}</p>
                </div>
                <div className="rounded-lg border border-border/40 p-3">
                  <p className="text-muted-foreground mb-1">Location</p>
                  <p className="font-medium inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {request.location || 'Neighborhood'}
                  </p>
                </div>
                <div className="rounded-lg border border-border/40 p-3">
                  <p className="text-muted-foreground mb-1">Posted</p>
                  <p className="font-medium inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border/40 p-3 text-sm">
                <p className="text-muted-foreground mb-1">Requester</p>
                <p className="font-medium inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {request.requester?.name || 'Neighbor'}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Button onClick={() => router.push(`/communities/${request.communityId}/requests/${request.id}/chat`)}>
                  Open Request Chat
                </Button>
                <Button variant="outline" onClick={() => router.push(`/communities/${request.communityId}`)}>
                  View Community
                </Button>
              </div>
            </PremiumCard>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
