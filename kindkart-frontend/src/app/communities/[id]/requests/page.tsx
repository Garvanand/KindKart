'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AppShell, PageContainer } from '@/components/layout';
import { RequestFeed } from '@/components/requests/RequestFeed';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

export default function CommunityRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const communityId = params.id as string;

  if (!isAuthenticated || !user) {
    router.push('/auth');
    return null;
  }

  const handleRequestClick = (request: { id: string }) => {
    router.push(`/communities/${communityId}/requests/${request.id}`);
  };

  return (
    <AppShell communityId={communityId}>
      <PageContainer className="py-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/communities/${communityId}`)}
              aria-label="Back to community"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Requests
              </h1>
              <p className="text-sm text-muted-foreground">
                Help requests in this community
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/communities/${communityId}/requests/create`)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create request
          </Button>
        </div>

        <RequestFeed
          communityId={communityId}
          onRequestClick={handleRequestClick}
        />
      </PageContainer>
    </AppShell>
  );
}
