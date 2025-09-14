'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ReputationCard } from '@/components/reputation/ReputationCard';
import { Leaderboard } from '@/components/reputation/Leaderboard';
import { BadgeDisplay } from '@/components/reputation/BadgeDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, Trophy, Award, TrendingUp } from 'lucide-react';

export default function ReputationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
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
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Reputation & Gamification</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Reputation Card */}
              <div className="lg:col-span-2">
                <ReputationCard userId={user.id} showFullDetails={true} />
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold">+0 credits</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed Helps</span>
                      <span className="font-semibold">0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Rating</span>
                      <span className="font-semibold">-</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rank</span>
                      <span className="font-semibold">#-</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent activity</p>
                      <p className="text-sm">Start helping neighbors to build your reputation!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-8">
            <BadgeDisplay userId={user.id} showAll={true} />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Leaderboard timeRange="month" />
              <Leaderboard timeRange="all" />
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Milestone Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                      <div className="text-2xl">🤝</div>
                      <div className="flex-1">
                        <h4 className="font-medium">First Helper</h4>
                        <p className="text-sm text-gray-600">Help your first neighbor</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">0 / 1</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                      <div className="text-2xl">⭐</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Community Helper</h4>
                        <p className="text-sm text-gray-600">Help 5 neighbors</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">0 / 5</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                      <div className="text-2xl">🌟</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Super Helper</h4>
                        <p className="text-sm text-gray-600">Help 10 neighbors</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">0 / 10</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Quality Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                      <div className="text-2xl">⚡</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Fast Responder</h4>
                        <p className="text-sm text-gray-600">Respond to 5 requests within 1 hour</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">0 / 5</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50">
                      <div className="text-2xl">💳</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Payment Master</h4>
                        <p className="text-sm text-gray-600">Make 10 on-time payments</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">0 / 10</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                      <div className="text-2xl">✅</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Reliable Helper</h4>
                        <p className="text-sm text-gray-600">Maintain 95%+ completion rate</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">0% / 95%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
