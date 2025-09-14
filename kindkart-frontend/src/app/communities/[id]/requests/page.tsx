'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { RequestFeed } from '@/components/requests/RequestFeed';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

export default function CommunityRequestsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [communityId, setCommunityId] = useState<string>('');

  // Get community ID from params
  useEffect(() => {
    setCommunityId(params.id as string);
  }, [params.id]);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    router.push('/auth');
    return null;
  }

  const handleRequestClick = (request: any) => {
    router.push(`/communities/${communityId}/requests/${request.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/communities/${communityId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Community
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Community Requests</h1>
            </div>
            <Button
              onClick={() => router.push(`/communities/${communityId}/requests/create`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Request
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RequestFeed 
          communityId={communityId}
          onRequestClick={handleRequestClick}
        />
      </main>
    </div>
  );
}
