'use client';

import { motion } from 'framer-motion';
import { Search, Users, Globe, Shield, ArrowRight, MoreVertical } from 'lucide-react';
import { PremiumCard, FeatureCard, StatCard } from '@/components/ui-kit/cards';
import { Badge } from '@/components/ui-kit/badges';
import { cn } from '@/lib/utils';

/**
 * CommunityCard - Premium card for displaying a community
 */
export interface CommunityCardProps {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  onlineCount?: number;
  image?: string;
  verified?: boolean;
  category?: string;
  onClick?: () => void;
  onJoin?: () => void;
  joined?: boolean;
}

export function CommunityCard({
  id,
  name,
  description,
  memberCount,
  onlineCount,
  image,
  verified,
  category,
  onClick,
  onJoin,
  joined,
}: CommunityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <PremiumCard interactive elevated className="overflow-hidden group">
        {/* Image header */}
        {image ? (
          <div className="relative h-32 -m-4 mb-4 overflow-hidden rounded-lg">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ) : (
          <div className="h-32 -m-4 mb-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg" />
        )}

        {/* Content */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground truncate">{name}</h3>
                {verified && (
                  <Shield className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            </div>
            <motion.button
              className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground py-2 border-t border-b border-border/50">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{memberCount.toLocaleString()} members</span>
            </div>
            {onlineCount && (
              <>
                <span>•</span>
                <motion.div
                  className="flex items-center gap-1"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>{onlineCount} online</span>
                </motion.div>
              </>
            )}
          </div>

          {/* Footer with badge and button */}
          <div className="flex items-center justify-between gap-2">
            {category && (
              <Badge variant="ghost">{category}</Badge>
            )}
            {onJoin && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin();
                }}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-semibold text-sm transition-all',
                  joined
                    ? 'bg-success/10 text-success hover:bg-success/20'
                    : 'bg-primary text-primary-foreground hover:bg-primary-dark'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {joined ? '✓ Joined' : 'Join'}
              </motion.button>
            )}
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  );
}

/**
 * MemberCard - Card for displaying a community member
 */
export interface MemberCardProps {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  reputation?: number;
  status?: 'online' | 'offline' | 'away';
  badge?: string;
  onProfile?: () => void;
}

export function MemberCard({
  id,
  name,
  role,
  avatar,
  reputation,
  status = 'offline',
  badge,
  onProfile,
}: MemberCardProps) {
  const statusConfig = {
    online: { bg: 'bg-success', label: 'Online' },
    offline: { bg: 'bg-muted-foreground', label: 'Offline' },
    away: { bg: 'bg-warning', label: 'Away' },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2 }}
      onClick={onProfile}
    >
      <PremiumCard interactive className="text-center">
        {/* Avatar */}
        <div className="relative mb-4 flex justify-center">
          {avatar ? (
            <img src={avatar} alt={name} className="h-12 w-12 rounded-full" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {name.charAt(0)}
            </div>
          )}
          <motion.div
            className={cn('h-3 w-3 rounded-full absolute bottom-0 right-0 border-2 border-card', config.bg)}
            animate={{ scale: [1, 1.2, 1] }}
            transition={status === 'online' ? { duration: 2, repeat: Infinity } : {}}
          />
        </div>

        {/* Name and role */}
        <h4 className="font-semibold text-foreground mb-1">{name}</h4>
        {role && (
          <p className="text-xs text-muted-foreground mb-3">{role}</p>
        )}

        {/* Badge */}
        {badge && (
          <Badge variant="primary" className="mb-3 justify-center w-full">
            {badge}
          </Badge>
        )}

        {/* Reputation */}
        {reputation && (
          <p className="text-sm font-semibold text-success mb-3">★ {reputation.toFixed(1)}</p>
        )}

        {/* View profile button */}
        {onProfile && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onProfile();
            }}
            className="w-full py-2 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            View Profile →
          </motion.button>
        )}
      </PremiumCard>
    </motion.div>
  );
}

/**
 * DirectoryFilter - Premium filter component for directory
 */
export interface DirectoryFilterProps {
  filters: Array<{ id: string; label: string; count?: number }>;
  selected?: string[];
  onFilterChange?: (filters: string[]) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function DirectoryFilter({
  filters,
  selected = [],
  onFilterChange,
  searchQuery = '',
  onSearchChange,
}: DirectoryFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => {
              const newSelected = selected.includes(filter.id)
                ? selected.filter((id) => id !== filter.id)
                : [...selected, filter.id];
              onFilterChange?.(newSelected);
            }}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium text-sm transition-all',
              selected.includes(filter.id)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.label}
            {filter.count && (
              <span className="ml-2 text-xs opacity-75">({filter.count})</span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * AdminDashboardCard - Card for admin dashboard actions
 */
export interface AdminDashboardCardProps {
  title: string;
  description?: string;
  metric?: number;
  metricLabel?: string;
  icon: React.ReactNode;
  action?: { label: string; onClick: () => void };
  status?: 'warning' | 'success' | 'info';
}

export function AdminDashboardCard({
  title,
  description,
  metric,
  metricLabel,
  icon,
  action,
  status,
}: AdminDashboardCardProps) {
  const statusConfig = {
    warning: { bg: 'bg-warning/10', text: 'text-warning' },
    success: { bg: 'bg-success/10', text: 'text-success' },
    info: { bg: 'bg-info/10', text: 'text-info' },
  };

  const config = statusConfig[status || 'info'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <PremiumCard elevated interactive className="relative overflow-hidden">
        {/* Background accent */}
        <div className={cn('absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-10', config.bg)} />

        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', config.bg, config.text)}>
              {icon}
            </div>
            {metric && (
              <div className="text-right">
                <p className={cn('text-3xl font-bold', config.text)}>{metric}</p>
                {metricLabel && (
                  <p className="text-xs text-muted-foreground">{metricLabel}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>

          {action && (
            <motion.button
              onClick={action.onClick}
              className={cn(
                'w-full py-2 px-3 rounded-lg font-semibold text-sm transition-all',
                'bg-primary/10 text-primary hover:bg-primary/20'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {action.label} →
            </motion.button>
          )}
        </div>
      </PremiumCard>
    </motion.div>
  );
}
