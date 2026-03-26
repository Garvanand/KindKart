'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { AppShell, PageContainer } from '@/components/layout';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { MemberList } from '@/components/community/MemberList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Plus, HelpCircle, Sparkles, Trophy } from 'lucide-react';
import { AIAssistant } from '@/components/AIAssistant';
import { CommunityEvents } from '@/components/CommunityEvents';
import { CommunityAnnouncements } from '@/components/CommunityAnnouncements';

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
      const msg = err instanceof Error ? err.message : 'Failed to load community';
      setError(msg.includes('Unable to connect') || msg.includes('Failed to fetch')
        ? 'Server is not available. You can go back to the dashboard and try again when the backend is running.'
        : msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
  const userMembership = community.members.find(member => member.user.id === user?.id);
  const isAdmin = userMembership?.role === 'admin';
  const isApproved = userMembership?.status === 'approved';

  // Allow guests to view but show message
  const isGuest = user?.isGuest;
  
  if (!userMembership || (!isApproved && !isGuest)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <AppShell communityId={communityId}>
      <PageContainer className="py-6 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{community.name}</h1>
            <p className="text-sm text-muted-foreground">Community overview</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button size="sm" onClick={() => router.push(`/communities/${communityId}/requests/create`)}>
              <Plus className="mr-2 h-4 w-4" />
              Request help
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Community Info */}
          <div className="lg:col-span-1 space-y-6">
            <CommunityHeader 
              community={community}
              userRole={userMembership.role}
              isAdmin={isAdmin}
            />
            <CommunityAnnouncements communityId={community.id} />
          </div>

          {/* Right Column - Members and Activity */}
          <div className="lg:col-span-2 space-y-6">
            <MemberList
              members={community.members}
              isAdmin={isAdmin}
              communityId={community.id}
              onMemberUpdate={loadCommunity}
            />
            <CommunityEvents communityId={community.id} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Quick Actions
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card 
              className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 hover:border-blue-400"
              onClick={() => router.push(`/communities/${communityId}/requests/create`)}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <HelpCircle className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1">Request Help</h4>
                  <p className="text-sm text-muted-foreground">Ask your neighbors for assistance</p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 hover:border-green-400"
              onClick={() => router.push(`/communities/${communityId}/requests`)}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1">Browse Requests</h4>
                  <p className="text-sm text-muted-foreground">Find ways to help others</p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 hover:border-green-500"
              onClick={() => router.push('/chat')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1">Community Chat</h4>
                  <p className="text-sm text-muted-foreground">Connect with neighbors</p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 hover:border-yellow-400"
              onClick={() => router.push('/reputation')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1">Reputation</h4>
                  <p className="text-sm text-muted-foreground">View leaderboard & badges</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <AIAssistant context={`the ${community.name} community`} />
        </div>
      </PageContainer>
    </AppShell>
  );
}


