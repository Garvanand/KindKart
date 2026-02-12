'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Heart, Award, Shield, Star } from 'lucide-react';
import { PremiumCard, StatCard, FeatureCard } from '@/components/ui-kit/cards';
import { Badge, TrustScoreBadge, AnimatedBadge } from '@/components/ui-kit/badges';
import { AnimatedProgressRing, AnimatedProgressBar } from '@/components/ui-kit/progress';
import { cn } from '@/lib/utils';

/**
 * ReputationScore - Large circular reputation score display
 */
export interface ReputationScoreProps {
  score: number;
  maxScore?: number;
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextLevel?: { name: string; score: number };
}

const levelConfig = {
  bronze: { color: '#CD7F32', label: 'Bronze' },
  silver: { color: '#C0C0C0', label: 'Silver' },
  gold: { color: '#FFD700', label: 'Gold' },
  platinum: { color: '#E5E4E2', label: 'Platinum' },
};

export function ReputationScore({
  score,
  maxScore = 1000,
  level = 'bronze',
  nextLevel,
}: ReputationScoreProps) {
  const percentage = (score / maxScore) * 100;
  const config = levelConfig[level];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="relative mb-6">
        <AnimatedProgressRing
          percentage={Math.min(percentage, 100)}
          size="lg"
          color="primary"
          label="Reputation"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase">{config.label}</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">Your Score</p>
        <p className="text-4xl font-bold text-foreground">{Math.round(score)}</p>
      </div>

      {nextLevel && (
        <div className="w-full mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-foreground">Next Level: {nextLevel.name}</p>
            <p className="text-xs font-semibold text-muted-foreground">
              {Math.round(score)}/{nextLevel.score}
            </p>
          </div>
          <AnimatedProgressBar
            percentage={(score / nextLevel.score) * 100}
            color="primary"
            size="sm"
            showPercentage={false}
          />
        </div>
      )}
    </motion.div>
  );
}

/**
 * LeaderboardEntry - Single entry in a leaderboard
 */
export interface LeaderboardEntryProps {
  rank: number;
  name: string;
  score: number;
  badge?: string;
  avatar?: string;
  trend?: { direction: 'up' | 'down'; change: number };
  isCurrentUser?: boolean;
}

export function LeaderboardEntry({
  rank,
  name,
  score,
  badge,
  avatar,
  trend,
  isCurrentUser,
}: LeaderboardEntryProps) {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border border-border/50 transition-all',
        isCurrentUser && 'bg-primary/10 border-primary/30 shadow-sm'
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-12 text-center">
        <p className={cn('text-2xl font-bold', getMedalColor(rank))}>
          {typeof getMedalEmoji(rank) === 'number' ? `#${getMedalEmoji(rank)}` : getMedalEmoji(rank)}
        </p>
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {avatar && (
            <img src={avatar} alt={name} className="h-8 w-8 rounded-full" />
          )}
          <p className="font-semibold text-foreground">{name}</p>
          {badge && (
            <Badge variant="primary">{badge}</Badge>
          )}
        </div>
        {trend && (
          <div className={cn(
            'text-xs font-medium flex items-center gap-1',
            trend.direction === 'up' ? 'text-success' : 'text-emergency'
          )}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.change} this month
          </div>
        )}
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right">
        <p className="text-2xl font-bold text-primary">{score}</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
    </motion.div>
  );
}

/**
 * AchievementBadge - Individual achievement/badge display
 */
export interface AchievementBadgeProps {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  progress?: number;
  maxProgress?: number;
  unlocked: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

const rarityConfig = {
  common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
  rare: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  epic: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
  legendary: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700' },
};

export function AchievementBadge({
  id,
  title,
  description,
  icon,
  progress,
  maxProgress,
  unlocked,
  rarity = 'common',
}: AchievementBadgeProps) {
  const config = rarityConfig[rarity];

  return (
    <motion.div
      initial={unlocked ? { opacity: 0, scale: 0.8 } : { opacity: 0.5 }}
      animate={unlocked ? { opacity: 1, scale: 1 } : { opacity: 0.5 }}
      transition={unlocked ? { type: 'spring', stiffness: 200, damping: 15 } : {}}
    >
      <div className={cn(
        'relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all',
        unlocked
          ? cn(config.bg, config.border, 'cursor-pointer hover:shadow-lg')
          : 'bg-muted border-border/50 opacity-50'
      )}>
        {/* Icon */}
        <motion.div
          className="h-12 w-12 rounded-full flex items-center justify-center text-2xl"
          animate={unlocked ? { y: [0, -4, 0] } : {}}
          transition={unlocked ? { duration: 2, repeat: Infinity } : {}}
        >
          {icon}
        </motion.div>

        {/* Content */}
        <div className="text-center flex-1 min-w-0">
          <p className={cn('text-sm font-semibold', unlocked ? config.text : 'text-muted-foreground')}>
            {title}
          </p>
          {description && (
            <p className={cn('text-xs mt-1', unlocked ? config.text : 'text-muted-foreground/60')}>
              {description}
            </p>
          )}
        </div>

        {/* Progress indicator */}
        {progress !== undefined && maxProgress && !unlocked && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground">{progress}/{maxProgress}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted-foreground/20">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(progress / maxProgress) * 100}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        )}

        {/* Unlocked check */}
        {unlocked && (
          <motion.div
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-success text-white flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <Shield className="h-3 w-3" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * ReputationStats - Breakdown of reputation components
 */
export interface ReputationStatsProps {
  completedRequests: number;
  helpfulnessRating: number;
  responseTime: string;
  completionRate: number;
}

export function ReputationStats({
  completedRequests,
  helpfulnessRating,
  responseTime,
  completionRate,
}: ReputationStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <StatCard
        label="Completed"
        value={completedRequests}
        icon={<Trophy className="h-5 w-5" />}
        color="primary"
      />
      <StatCard
        label="Helpfulness"
        value={`${helpfulnessRating.toFixed(1)}/5`}
        icon={<Heart className="h-5 w-5" />}
        color="success"
      />
      <StatCard
        label="Avg Response"
        value={responseTime}
        icon={<TrendingUp className="h-5 w-5" />}
        color="info"
      />
      <StatCard
        label="Completion Rate"
        value={`${completionRate}%`}
        icon={<Award className="h-5 w-5" />}
        color="warning"
      />
    </motion.div>
  );
}
