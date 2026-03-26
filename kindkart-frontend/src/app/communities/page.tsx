'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { PageHeader, PremiumCard, Badge } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { Users, Plus, UserPlus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { demoCommunityMemberships } from '@/lib/demo-data';

interface CommunityMembership {
  id: string;
  role: string;
  status: string;
  joinedAt: string;
  community?: { id: string; name: string; inviteCode?: string };
}

export default function CommunitiesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, isGuest, demoMode } = useAuthStore();
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
        if (isGuest || demoMode) {
          setMemberships(demoCommunityMemberships as CommunityMembership[]);
          return;
        }

        const data = await api.users.getCommunities();
        setMemberships(Array.isArray(data) ? data : []);
      } catch {
        setMemberships(demoCommunityMemberships as CommunityMembership[]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCommunities();
  }, [demoMode, isAuthenticated, isGuest, isHydrated, router, user]);

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Communities"
          description="Manage where you collaborate and help"
          icon={<Users className="h-6 w-6" />}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/communities/join')}>
                <UserPlus className="h-4 w-4 mr-2" /> Join
              </Button>
              <Button size="sm" onClick={() => router.push('/communities/create')}>
                <Plus className="h-4 w-4 mr-2" /> Create
              </Button>
            </div>
          }
        />

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 rounded-xl border border-border/30 bg-card/30 animate-pulse" />
              ))}
            </div>
          ) : memberships.length > 0 ? (
            <div className="space-y-4">
              {memberships.map((membership) => (
                <PremiumCard key={membership.id} interactive elevated className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{membership.community?.name || 'Community'}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Joined {new Date(membership.joinedAt).toLocaleDateString()} • Role: {membership.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={membership.status === 'approved' ? 'success' : 'warning'}>{membership.status}</Badge>
                    <Button size="sm" className="gap-2" onClick={() => router.push(`/communities/${membership.community?.id}`)}>
                      Open <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </PremiumCard>
              ))}
            </div>
          ) : (
            <PremiumCard className="p-10 text-center border-dashed">
              <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No communities yet</h3>
              <p className="text-sm text-muted-foreground mb-5">Create your own community or join one using an invite code.</p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => router.push('/communities/create')}>Create Community</Button>
                <Button variant="outline" onClick={() => router.push('/communities/join')}>Join Community</Button>
              </div>
            </PremiumCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
