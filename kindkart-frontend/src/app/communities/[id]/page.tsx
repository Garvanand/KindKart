'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { MemberList } from '@/components/community/MemberList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, MessageSquare, Plus, HelpCircle } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  inviteCode: string;
  rules?: string;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    role: string;
    status: string;
    joinedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      profilePhoto?: string;
      qualification?: string;
      certifications?: string[];
    };
  }>;
}

export default function CommunityPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const communityId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    loadCommunity();
  }, [communityId, isAuthenticated, user, router]);

  const loadCommunity = async () => {
    try {
      setIsLoading(true);
      const communityData = await api.communities.get(communityId);
      setCommunity(communityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={loadCommunity} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Community Not Found</CardTitle>
            <CardDescription>
              The community you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is a member of this community
  const userMembership = community.members.find(member => member.user.id === user.id);
  const isAdmin = userMembership?.role === 'admin';
  const isApproved = userMembership?.status === 'approved';

  if (!userMembership || !isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              {!userMembership 
                ? "You're not a member of this community."
                : "Your membership request is pending approval."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
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
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">{community.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push(`/communities/${communityId}/requests/create`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Request Help
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Community Info */}
          <div className="lg:col-span-1">
            <CommunityHeader 
              community={community}
              userRole={userMembership.role}
              isAdmin={isAdmin}
            />
          </div>

          {/* Right Column - Members and Activity */}
          <div className="lg:col-span-2">
            <MemberList
              members={community.members}
              isAdmin={isAdmin}
              communityId={community.id}
              onMemberUpdate={loadCommunity}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/communities/${communityId}/requests/create`)}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <HelpCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium">Request Help</h4>
                  <p className="text-sm text-gray-600 mt-1">Ask your neighbors for assistance</p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/communities/${communityId}/requests`)}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium">Offer Help</h4>
                  <p className="text-sm text-gray-600 mt-1">Browse requests and help others</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium">Community Chat</h4>
                  <p className="text-sm text-gray-600 mt-1">Connect with your neighbors</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
