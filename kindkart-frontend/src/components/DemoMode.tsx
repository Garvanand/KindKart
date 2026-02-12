'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, X, Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DemoFeature {
  id: string;
  title: string;
  description: string;
  route: string;
  category: 'community' | 'request' | 'payment' | 'reputation' | 'chat';
  duration: string;
}

const demoFeatures: DemoFeature[] = [
  {
    id: 'create-community',
    title: 'Create Community',
    description: 'See how to create your own neighborhood community',
    route: '/communities/create',
    category: 'community',
    duration: '2 min',
  },
  {
    id: 'join-community',
    title: 'Join Community',
    description: 'Learn how to join an existing community with an invite code',
    route: '/communities/join',
    category: 'community',
    duration: '1 min',
  },
  {
    id: 'create-request',
    title: 'Create Help Request',
    description: 'See how to post a request for help from neighbors',
    route: '/dashboard',
    category: 'request',
    duration: '3 min',
  },
  {
    id: 'payment-flow',
    title: 'Payment System',
    description: 'Understand the secure escrow payment process',
    route: '/wallet',
    category: 'payment',
    duration: '4 min',
  },
  {
    id: 'reputation-system',
    title: 'Reputation & Badges',
    description: 'Learn how to earn points and unlock achievements',
    route: '/reputation',
    category: 'reputation',
    duration: '3 min',
  },
  {
    id: 'chat-system',
    title: 'Community Chat',
    description: 'Explore the real-time messaging features',
    route: '/chat',
    category: 'chat',
    duration: '2 min',
  },
];

const categoryColors = {
  community: 'bg-blue-100 text-blue-800',
  request: 'bg-green-100 text-green-800',
  payment: 'bg-yellow-100 text-yellow-800',
  reputation: 'bg-purple-100 text-purple-800',
  chat: 'bg-pink-100 text-pink-800',
};

export function DemoMode() {
  const [completedDemos, setCompletedDemos] = useState<string[]>([]);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const router = useRouter();

  const handleStartDemo = (feature: DemoFeature) => {
    setActiveDemo(feature.id);
    // Navigate to the feature
    router.push(feature.route);
    
    // Mark as completed after duration (simulated)
    setTimeout(() => {
      setCompletedDemos((prev) => [...prev, feature.id]);
      setActiveDemo(null);
    }, parseInt(feature.duration) * 60 * 1000);
  };

  const completionRate = (completedDemos.length / demoFeatures.length) * 100;

  return (
    <Card className="w-full border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Interactive Demo Mode
            </CardTitle>
            <CardDescription className="text-white/80">
              Explore all features with guided demos
            </CardDescription>
          </div>
          {completionRate > 0 && (
            <Badge className="bg-white/20 text-white border-white/30">
              {Math.round(completionRate)}% Complete
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">
              {completedDemos.length} / {demoFeatures.length} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demoFeatures.map((feature) => {
            const isCompleted = completedDemos.includes(feature.id);
            const isActive = activeDemo === feature.id;

            return (
              <Card
                key={feature.id}
                className={`relative overflow-hidden transition-all ${
                  isActive
                    ? 'border-2 border-primary shadow-lg scale-105'
                    : isCompleted
                    ? 'border-2 border-green-300'
                    : 'hover:shadow-md'
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <Badge className={categoryColors[feature.category]}>
                      {feature.category}
                    </Badge>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {feature.duration}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleStartDemo(feature)}
                      disabled={isActive}
                      className={isCompleted ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : isActive ? (
                        'In Progress...'
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Demo
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {completionRate === 100 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-green-800 mb-1">Congratulations! 🎉</h3>
            <p className="text-sm text-green-700">
              You've completed all demos! You're now ready to use KindKart like a pro.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

