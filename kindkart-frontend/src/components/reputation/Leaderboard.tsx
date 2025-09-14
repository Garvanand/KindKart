'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/reputation';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  TrendingUp,
  Users,
  Calendar,
  Target
} from 'lucide-react';

interface LeaderboardProps {
  communityId?: string;
  timeRange?: 'week' | 'month' | 'all';
}

export function Leaderboard({ communityId, timeRange = 'month' }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');

  useEffect(() => {
    loadLeaderboard();
  }, [communityId, timeRange, activeTab]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      let data;
      
      if (activeTab === 'overall') {
        data = await api.reputation.getLeaderboard({
          type: 'overall',
          timeRange,
          limit: 10
        });
      } else if (activeTab === 'community' && communityId) {
        data = await api.reputation.getLeaderboard({
          type: 'community',
          communityId,
          timeRange,
          limit: 10
        });
      } else if (activeTab === 'helpers') {
        data = await api.reputation.getLeaderboard({
          type: 'helpers',
          timeRange,
          limit: 10
        });
      } else {
        data = await api.reputation.getLeaderboard({
          type: 'requesters',
          timeRange,
          limit: 10
        });
      }
      
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-medium text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="helpers">Helpers</TabsTrigger>
            <TabsTrigger value="requesters">Requesters</TabsTrigger>
            {communityId && <TabsTrigger value="community">Community</TabsTrigger>}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No leaderboard data available</p>
                <p className="text-sm">Be the first to earn some reputation points!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.userId} 
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      entry.rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-8 text-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.profilePhoto} />
                        <AvatarFallback className="text-sm">
                          {getInitials(entry.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {entry.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            {entry.badges} badges
                          </Badge>
                          <span>•</span>
                          <span>{entry.completedRequests} completed</span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-gray-900">
                          {entry.score.toLocaleString()}
                        </span>
                      </div>
                      <Badge className={`text-xs ${getRankBadgeColor(entry.rank)}`}>
                        {entry.rank === 1 ? 'Champion' : 
                         entry.rank === 2 ? 'Runner-up' :
                         entry.rank === 3 ? 'Third Place' :
                         `#${entry.rank}`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Time Range Selector */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Time Range:</span>
              <select 
                value={timeRange} 
                onChange={(e) => {
                  // This would trigger a parent component update
                  // For now, we'll just show the current selection
                }}
                className="text-sm border-none bg-transparent text-blue-600 font-medium"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {leaderboard.length} entries
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
