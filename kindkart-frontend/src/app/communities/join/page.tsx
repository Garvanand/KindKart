'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { JoinCommunityForm } from '@/components/community/JoinCommunityForm';
import { Button } from '@/components/ui/button';

export default function JoinCommunityPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [joinedMembership, setJoinedMembership] = useState<any>(null);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    router.push('/auth');
    return null;
  }

  const handleSuccess = (membership: any) => {
    setJoinedMembership(membership);
  };

  if (joinedMembership) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your request to join <strong>{joinedMembership.community.name}</strong> has been submitted successfully. 
              The community admin will review your request and notify you once approved.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/communities/join')}
                className="w-full"
              >
                Join Another Community
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <JoinCommunityForm onSuccess={handleSuccess} />
        
        <div className="mt-6 text-center">
          <Button 
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-gray-600"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
