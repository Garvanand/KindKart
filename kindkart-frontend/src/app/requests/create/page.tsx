'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { PageHeader, PremiumCard } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Users } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

interface CommunityMembership {
  community?: { id: string; name: string };
  role?: string;
}

export default function CreateRequestEntryPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [memberships, setMemberships] = useState<CommunityMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    const loadCommunities = async () => {
      try {
        const communities = await api.users.getCommunities();
        setMemberships(Array.isArray(communities) ? communities : []);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCommunities();
  }, [isAuthenticated, isHydrated, router, user]);

  const communityOptions = useMemo(
    () => memberships.map((entry) => entry.community).filter(Boolean) as Array<{ id: string; name: string }>,
    [memberships]
  );

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Create a Help Request"
          description="Choose where to publish your request"
          icon={<Plus className="h-6 w-6" />}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-20 rounded-xl border border-border/30 bg-card/30 animate-pulse" />
              ))}
            </div>
          ) : communityOptions.length > 0 ? (
            <div className="space-y-3">
              {communityOptions.map((community) => (
                <PremiumCard key={community.id} interactive elevated className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{community.name}</p>
                      <p className="text-xs text-muted-foreground">Post request to this community</p>
                    </div>
                  </div>
                  <Button size="sm" className="gap-2" onClick={() => router.push(`/communities/${community.id}/requests/create`)}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </PremiumCard>
              ))}
            </div>
          ) : (
            <PremiumCard className="p-8 text-center border-dashed">
              <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Join a community first</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Requests are posted inside communities so neighbors can respond quickly and safely.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => router.push('/communities/join')}>Join Community</Button>
                <Button variant="outline" onClick={() => router.push('/communities/create')}>Create Community</Button>
              </div>
            </PremiumCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
