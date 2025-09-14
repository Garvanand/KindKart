'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { CreateCommunityForm } from '@/components/community/CreateCommunityForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CreateCommunityPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [createdCommunity, setCreatedCommunity] = useState<any>(null);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    router.push('/auth');
    return null;
  }

  const handleSuccess = (community: any) => {
    setCreatedCommunity(community);
  };

  if (createdCommunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-green-800">Community Created!</CardTitle>
            <CardDescription>
              Your community "{createdCommunity.name}" has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Your Invite Code</h4>
              <div className="text-center">
                <code className="text-2xl font-mono font-bold text-blue-800 bg-blue-100 px-4 py-2 rounded">
                  {createdCommunity.inviteCode}
                </code>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                Share this code with your neighbors to invite them to join
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => router.push(`/communities/${createdCommunity.id}`)}
                className="w-full"
              >
                Go to Community Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <CreateCommunityForm onSuccess={handleSuccess} />
        
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
