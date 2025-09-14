'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { Badge as BadgeType, getBadgeColorClass } from '@/lib/reputation';
import { Award, Star, Users, Crown, Zap } from 'lucide-react';

interface BadgeDisplayProps {
  userId: string;
  showAll?: boolean;
}

export function BadgeDisplay({ userId, showAll = false }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    try {
      setIsLoading(true);
      const badgesData = await api.reputation.getUserBadges(userId);
      setBadges(badgesData);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgesByCategory = () => {
    const categories = {
      helper: badges.filter(badge => badge.category === 'helper'),
      requester: badges.filter(badge => badge.category === 'requester'),
      community: badges.filter(badge => badge.category === 'community'),
      special: badges.filter(badge => badge.category === 'special')
    };
    return categories;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'helper':
        return <Users className="w-4 h-4" />;
      case 'requester':
        return <Star className="w-4 h-4" />;
      case 'community':
        return <Crown className="w-4 h-4" />;
      case 'special':
        return <Zap className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'helper':
        return 'Helper Badges';
      case 'requester':
        return 'Requester Badges';
      case 'community':
        return 'Community Badges';
      case 'special':
        return 'Special Badges';
      default:
        return 'Badges';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded mt-2"></div>
                <div className="h-3 bg-gray-200 rounded mt-1 w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No badges earned yet</p>
            <p className="text-sm">Start helping neighbors to earn your first badge!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const badgesByCategory = getBadgesByCategory();
  const hasMultipleCategories = Object.values(badgesByCategory).some(cat => cat.length > 0);

  if (!showAll || !hasMultipleCategories) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges ({badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.slice(0, 9).map((badge) => (
              <div key={badge.id} className="text-center p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{badge.description}</p>
                <Badge className={`text-xs ${getBadgeColorClass(badge)}`}>
                  {badge.category}
                </Badge>
                <p className="text-xs text-gray-500 mt-2">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
            {badges.length > 9 && (
              <div className="flex items-center justify-center p-4 rounded-lg border border-dashed border-gray-300">
                <div className="text-center">
                  <Award className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium text-gray-600">+{badges.length - 9} more</p>
                  <p className="text-xs text-gray-500">badges earned</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Badges ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="helper" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="helper" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Helper
            </TabsTrigger>
            <TabsTrigger value="requester" className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              Requester
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Community
            </TabsTrigger>
            <TabsTrigger value="special" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Special
            </TabsTrigger>
          </TabsList>

          {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
            <TabsContent key={category} value={category} className="mt-6">
              {categoryBadges.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏆</div>
                  <p>No {getCategoryName(category).toLowerCase()} yet</p>
                  <p className="text-sm">Keep participating to earn badges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryBadges.map((badge) => (
                    <div key={badge.id} className="flex items-start gap-3 p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="text-2xl flex-shrink-0">{badge.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">{badge.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getBadgeColorClass(badge)}`}>
                            {getCategoryIcon(category)}
                            <span className="ml-1">{category}</span>
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Earned {new Date(badge.earnedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
