// Reputation and gamification utilities
export interface ReputationScore {
  totalCredits: number;
  communityCredits: number;
  helperCredits: number;
  requesterCredits: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  category: 'helper' | 'requester' | 'community' | 'special';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  category: 'milestone' | 'streak' | 'quality' | 'community';
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  profilePhoto?: string;
  score: number;
  rank: number;
  badges: number;
  completedRequests: number;
}

// Reputation calculation constants
export const REPUTATION_CONSTANTS = {
  // Helper actions
  HELP_REQUEST_ACCEPTED: 5,
  HELP_REQUEST_COMPLETED: 20,
  HELP_REQUEST_RATED_5_STAR: 25,
  HELP_REQUEST_RATED_4_STAR: 20,
  HELP_REQUEST_RATED_3_STAR: 15,
  HELP_REQUEST_RATED_2_STAR: 10,
  HELP_REQUEST_RATED_1_STAR: 5,
  
  // Requester actions
  REQUEST_CREATED: 2,
  REQUEST_COMPLETED: 10,
  HELPER_RATED: 5,
  PAYMENT_ON_TIME: 15,
  
  // Community actions
  COMMUNITY_CREATED: 50,
  COMMUNITY_JOINED: 5,
  INVITE_ACCEPTED: 10,
  DAILY_LOGIN: 1,
  WEEKLY_ACTIVE: 5,
  
  // Quality bonuses
  FAST_RESPONSE_BONUS: 5, // Responds within 1 hour
  COMPLETION_BONUS: 10,   // Completes within estimated time
  COMMUNITY_HELPER_BONUS: 15, // Helps multiple people in same community
  
  // Penalties
  LATE_PAYMENT_PENALTY: -10,
  REQUEST_CANCELLED_PENALTY: -5,
  POOR_RATING_PENALTY: -15,
  NO_SHOW_PENALTY: -20,
};

// Badge definitions
export const BADGE_DEFINITIONS = {
  // Helper badges
  FIRST_HELPER: {
    id: 'first_helper',
    name: 'First Helper',
    description: 'Helped your first neighbor',
    icon: '🤝',
    color: 'bg-blue-100 text-blue-800',
    category: 'helper' as const,
    condition: { type: 'completed_helps', count: 1 }
  },
  HELPER_LEVEL_5: {
    id: 'helper_level_5',
    name: 'Community Helper',
    description: 'Helped 5 neighbors',
    icon: '⭐',
    color: 'bg-green-100 text-green-800',
    category: 'helper' as const,
    condition: { type: 'completed_helps', count: 5 }
  },
  HELPER_LEVEL_10: {
    id: 'helper_level_10',
    name: 'Super Helper',
    description: 'Helped 10 neighbors',
    icon: '🌟',
    color: 'bg-purple-100 text-purple-800',
    category: 'helper' as const,
    condition: { type: 'completed_helps', count: 10 }
  },
  HELPER_LEVEL_25: {
    id: 'helper_level_25',
    name: 'Neighborhood Hero',
    description: 'Helped 25 neighbors',
    icon: '🏆',
    color: 'bg-yellow-100 text-yellow-800',
    category: 'helper' as const,
    condition: { type: 'completed_helps', count: 25 }
  },
  
  // Requester badges
  FIRST_REQUEST: {
    id: 'first_request',
    name: 'First Request',
    description: 'Made your first help request',
    icon: '🙋',
    color: 'bg-blue-100 text-blue-800',
    category: 'requester' as const,
    condition: { type: 'completed_requests', count: 1 }
  },
  ACTIVE_REQUESTER: {
    id: 'active_requester',
    name: 'Active Requester',
    description: 'Made 10 help requests',
    icon: '📝',
    color: 'bg-green-100 text-green-800',
    category: 'requester' as const,
    condition: { type: 'completed_requests', count: 10 }
  },
  
  // Community badges
  COMMUNITY_CREATOR: {
    id: 'community_creator',
    name: 'Community Creator',
    description: 'Created a new community',
    icon: '🏘️',
    color: 'bg-purple-100 text-purple-800',
    category: 'community' as const,
    condition: { type: 'communities_created', count: 1 }
  },
  COMMUNITY_LEADER: {
    id: 'community_leader',
    name: 'Community Leader',
    description: 'Top helper in your community',
    icon: '👑',
    color: 'bg-yellow-100 text-yellow-800',
    category: 'community' as const,
    condition: { type: 'community_rank', rank: 1 }
  },
  
  // Special badges
  FAST_RESPONDER: {
    id: 'fast_responder',
    name: 'Fast Responder',
    description: 'Responded to 5 requests within 1 hour',
    icon: '⚡',
    color: 'bg-orange-100 text-orange-800',
    category: 'special' as const,
    condition: { type: 'fast_responses', count: 5 }
  },
  PAYMENT_MASTER: {
    id: 'payment_master',
    name: 'Payment Master',
    description: 'Made 10 on-time payments',
    icon: '💳',
    color: 'bg-green-100 text-green-800',
    category: 'special' as const,
    condition: { type: 'on_time_payments', count: 10 }
  },
  RELIABLE_HELPER: {
    id: 'reliable_helper',
    name: 'Reliable Helper',
    description: 'Maintained 95%+ completion rate',
    icon: '✅',
    color: 'bg-blue-100 text-blue-800',
    category: 'special' as const,
    condition: { type: 'completion_rate', rate: 0.95 }
  }
};

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS = {
  // Milestone achievements
  HELPER_MILESTONE_50: {
    id: 'helper_milestone_50',
    name: 'Helping Hand',
    description: 'Help 50 neighbors',
    icon: '🤝',
    category: 'milestone' as const,
    maxProgress: 50
  },
  REQUESTER_MILESTONE_20: {
    id: 'requester_milestone_20',
    name: 'Active Member',
    description: 'Make 20 help requests',
    icon: '📝',
    category: 'milestone' as const,
    maxProgress: 20
  },
  
  // Streak achievements
  WEEKLY_STREAK: {
    id: 'weekly_streak',
    name: 'Weekly Active',
    description: 'Be active for 7 consecutive days',
    icon: '📅',
    category: 'streak' as const,
    maxProgress: 7
  },
  
  // Quality achievements
  PERFECT_RATING: {
    id: 'perfect_rating',
    name: 'Perfect Helper',
    description: 'Maintain 5.0 average rating',
    icon: '⭐',
    category: 'quality' as const,
    maxProgress: 100 // Percentage of 5-star ratings
  },
  
  // Community achievements
  COMMUNITY_BUILDER: {
    id: 'community_builder',
    name: 'Community Builder',
    description: 'Invite 10 people to communities',
    icon: '👥',
    category: 'community' as const,
    maxProgress: 10
  }
};

// Calculate user level based on total credits
export const calculateLevel = (totalCredits: number): number => {
  if (totalCredits < 100) return 1;
  if (totalCredits < 250) return 2;
  if (totalCredits < 500) return 3;
  if (totalCredits < 1000) return 4;
  if (totalCredits < 2000) return 5;
  if (totalCredits < 3500) return 6;
  if (totalCredits < 5000) return 7;
  if (totalCredits < 7000) return 8;
  if (totalCredits < 10000) return 9;
  return 10; // Max level
};

// Calculate credits needed for next level
export const getCreditsForNextLevel = (currentLevel: number): number => {
  const levelThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7000, 10000];
  return levelThresholds[currentLevel] || 10000;
};

// Calculate progress to next level
export const getLevelProgress = (totalCredits: number): { progress: number; nextLevel: number } => {
  const currentLevel = calculateLevel(totalCredits);
  const nextLevel = currentLevel + 1;
  const currentThreshold = getCreditsForNextLevel(currentLevel - 1);
  const nextThreshold = getCreditsForNextLevel(currentLevel);
  
  const progress = Math.min(100, ((totalCredits - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  
  return { progress, nextLevel };
};

// Format reputation score for display
export const formatReputationScore = (score: ReputationScore): string => {
  return `${score.totalCredits.toLocaleString()} credits`;
};

// Get badge color class
export const getBadgeColorClass = (badge: Badge): string => {
  return badge.color;
};

// Check if user qualifies for a badge
export const checkBadgeQualification = (badgeId: string, userStats: any): boolean => {
  const badge = BADGE_DEFINITIONS[badgeId as keyof typeof BADGE_DEFINITIONS];
  if (!badge) return false;
  
  const condition = badge.condition;
  
  switch (condition.type) {
    case 'completed_helps':
      return userStats.completedHelps >= condition.count;
    case 'completed_requests':
      return userStats.completedRequests >= condition.count;
    case 'communities_created':
      return userStats.communitiesCreated >= condition.count;
    case 'community_rank':
      return userStats.communityRank <= condition.rank;
    case 'fast_responses':
      return userStats.fastResponses >= condition.count;
    case 'on_time_payments':
      return userStats.onTimePayments >= condition.count;
    case 'completion_rate':
      return userStats.completionRate >= condition.rate;
    default:
      return false;
  }
};
