'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { 
  ReputationScore, 
  calculateLevel, 
  getLevelProgress, 
  formatReputationScore,
  getBadgeColorClass 
} from '@/lib/reputation';
import { 
  Star, 
  Trophy, 
  TrendingUp, 
  Award, 
  Target, 
  Users,
  Crown,
  Zap
} from 'lucide-react';

interface ReputationCardProps {
  userId: string;
  showFullDetails?: boolean;
}

export function ReputationCard({ userId, showFullDetails = false }: ReputationCardProps) {
  const [reputation, setReputation] = useState<ReputationScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    loadReputation();
  }, [userId]);

  const loadReputation = async () => {
    try {
      setIsLoading(true);
      const reputationData = await api.reputation.getUserReputation(userId);
      setReputation(reputationData);
    } catch (error) {
      console.error('Failed to load reputation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Reputation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reputation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Reputation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Failed to load reputation data</p>
        </CardContent>
      </Card>
    );
  }

  const levelProgress = getLevelProgress(reputation.totalCredits);
  const level = calculateLevel(reputation.totalCredits);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Reputation
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Level {level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{reputation.totalCredits.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Credits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{reputation.badges.length}</p>
            <p className="text-sm text-gray-600">Badges Earned</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {levelProgress.nextLevel}</span>
            <span>{levelProgress.progress.toFixed(0)}%</span>
          </div>
          <Progress value={levelProgress.progress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">
            {reputation.totalCredits.toLocaleString()} / {getCreditsForNextLevel(level).toLocaleString()} credits
          </p>
        </div>

        {/* Credit Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Credit Breakdown</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="font-semibold text-blue-600">{reputation.helperCredits}</p>
              <p className="text-xs text-gray-600">Helper</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="font-semibold text-green-600">{reputation.requesterCredits}</p>
              <p className="text-xs text-gray-600">Requester</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="font-semibold text-purple-600">{reputation.communityCredits}</p>
              <p className="text-xs text-gray-600">Community</p>
            </div>
          </div>
        </div>

        {/* Recent Badges */}
        {showFullDetails && reputation.badges.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recent Badges</h4>
            <div className="flex flex-wrap gap-2">
              {reputation.badges.slice(0, 6).map((badge) => (
                <Badge 
                  key={badge.id} 
                  className={`${getBadgeColorClass(badge)} flex items-center gap-1`}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </Badge>
              ))}
              {reputation.badges.length > 6 && (
                <Badge variant="outline">
                  +{reputation.badges.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Achievement Progress */}
        {showFullDetails && reputation.achievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Achievements</h4>
            <div className="space-y-2">
              {reputation.achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <Progress 
                      value={achievement.completed ? 100 : (achievement.progress / achievement.maxProgress) * 100} 
                      className="h-1 mt-1" 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {achievement.progress} / {achievement.maxProgress}
                    </p>
                  </div>
                  {achievement.completed && (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get credits for next level
function getCreditsForNextLevel(currentLevel: number): number {
  const levelThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7000, 10000];
  return levelThresholds[currentLevel] || 10000;
}
