'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { CreateRequestForm } from '@/components/requests/CreateRequestForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function CreateRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [createdRequest, setCreatedRequest] = useState<any>(null);
  const [communityId, setCommunityId] = useState<string>('');

  // Get community ID from params
  useState(() => {
    setCommunityId(params.id as string);
  });

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    router.push('/auth');
    return null;
  }

  const handleSuccess = (request: any) => {
    setCreatedRequest(request);
  };

  if (createdRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Request Created!</CardTitle>
            <CardDescription>
              Your help request has been posted to the community. Neighbors can now see it and offer to help.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Community members will see your request</li>
                <li>• They can respond and offer to help</li>
                <li>• You'll be notified of responses</li>
                <li>• You can choose who to work with</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => router.push(`/communities/${communityId}`)}
                className="w-full"
              >
                View Community
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push(`/communities/${communityId}/requests`)}
                className="w-full"
              >
                View All Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-900">Create Help Request</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateRequestForm 
          communityId={communityId}
          onSuccess={handleSuccess}
        />
      </main>
    </div>
  );
}
