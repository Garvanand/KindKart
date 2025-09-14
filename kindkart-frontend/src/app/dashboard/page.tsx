'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Community {
  id: string;
  community: {
    id: string;
    name: string;
    inviteCode: string;
    createdAt: string;
  };
  role: string;
  status: string;
  joinedAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    // Load user's communities
    const loadCommunities = async () => {
      try {
        const userCommunities = await api.users.getCommunities();
        setCommunities(userCommunities);
      } catch (error) {
        console.error('Failed to load communities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunities();
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">KindKart</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Communities</h2>
          <p className="text-gray-600">Connect with your neighbors and help each other</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="text-gray-600">Loading communities...</div>
          </div>
        ) : communities.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Communities Yet</CardTitle>
              <CardDescription>
                You haven't joined any communities yet. Create a new community or join one using an invite code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full"
                onClick={() => router.push('/communities/create')}
              >
                Create New Community
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/communities/join')}
              >
                Join with Invite Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {communities.map((membership) => (
              <Card key={membership.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {membership.community.name}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      membership.role === 'admin' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {membership.role}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Joined {new Date(membership.joinedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Invite Code: <code className="bg-gray-100 px-2 py-1 rounded">{membership.community.inviteCode}</code>
                    </p>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => router.push(`/communities/${membership.community.id}`)}
                    >
                      View Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">📝</div>
                  <h4 className="font-medium">Request Help</h4>
                  <p className="text-sm text-gray-600 mt-1">Ask your neighbors for assistance</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">🤝</div>
                  <h4 className="font-medium">Offer Help</h4>
                  <p className="text-sm text-gray-600 mt-1">Browse requests and help others</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">💬</div>
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
