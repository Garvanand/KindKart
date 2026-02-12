'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge, PremiumCard } from '@/components/ui-kit';
import { AlertCircle, CheckCircle, Clock, MapPin, DollarSign, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * RequestCard - Premium card for displaying help requests
 */
export interface RequestCardProps {
  id: string;
  title: string;
  description?: string;
  category: 'home' | 'technical' | 'personal' | 'professional' | 'emergency' | 'health';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  trustRequired?: number;
  reward?: number;
  location?: string;
  postedBy: { name: string; rating: number };
  completionRate?: number;
  status?: 'open' | 'in-progress' | 'completed' | 'cancelled';
  postedTime: string;
  onAccept?: () => void;
}

const categoryConfig = {
  home: { icon: '🏠', label: 'Home', color: 'from-orange-500 to-red-500' },
  technical: { icon: '💻', label: 'Technical', color: 'from-blue-500 to-cyan-500' },
  personal: { icon: '👤', label: 'Personal', color: 'from-purple-500 to-pink-500' },
  professional: { icon: '💼', label: 'Professional', color: 'from-indigo-500 to-blue-500' },
  emergency: { icon: '🚨', label: 'Emergency', color: 'from-red-600 to-rose-600' },
  health: { icon: '⚕️', label: 'Health', color: 'from-green-500 to-emerald-500' },
};

const urgencyConfig = {
  low: { label: 'Low', color: 'ghost' as const, bg: 'bg-muted/40' },
  medium: { label: 'Medium', color: 'info' as const, bg: 'bg-info/10' },
  high: { label: 'High', color: 'warning' as const, bg: 'bg-warning/10' },
  urgent: { label: 'Urgent', color: 'emergency' as const, bg: 'bg-emergency/10' },
};

const statusConfig = {
  open: { label: 'Open', variant: 'primary' as const, icon: AlertCircle },
  'in-progress': { label: 'In Progress', variant: 'info' as const, icon: Clock },
  completed: { label: 'Completed', variant: 'success' as const, icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'ghost' as const, icon: null },
};

export function RequestCard({
  id,
  title,
  description,
  category,
  urgency,
  trustRequired,
  reward,
  location,
  postedBy,
  completionRate,
  status = 'open',
  postedTime,
  onAccept,
}: RequestCardProps) {
  const catConfig = categoryConfig[category];
  const urgConfig = urgencyConfig[urgency];
  const statusCfg = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
    >
      <PremiumCard
        interactive
        elevated
        className="relative overflow-hidden hover:border-primary/50"
      >
        {/* Status indicator bar */}
        {urgency === 'urgent' && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-emergency"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Header with category and urgency */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Category badge */}
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0',
              `bg-gradient-to-br ${catConfig.color}`
            )}>
              {catConfig.icon}
            </div>

            {/* Category & Title */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                {catConfig.label}
              </p>
              <h3 className="text-sm font-bold text-foreground mt-1 line-clamp-2">
                {title}
              </h3>
            </div>
          </div>

          {/* Urgency badge */}
          <Badge variant={urgConfig.color} className="flex-shrink-0">
            {urgConfig.label}
          </Badge>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Meta information */}
        <div className="grid grid-cols-2 gap-2 mb-4 py-3 border-y border-border/50">
          {/* Reward */}
          {reward && (
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3.5 w-3.5 text-success" />
              <span className="font-semibold text-foreground">₹{reward}</span>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Trust required */}
          {trustRequired && (
            <div className="flex items-center gap-2 text-xs">
              <Star className="h-3.5 w-3.5 text-warning" />
              <span className="text-muted-foreground">{trustRequired}★ required</span>
            </div>
          )}

          {/* Posted time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{postedTime}</span>
          </div>
        </div>

        {/* Footer: Posted by + Action */}
        <div className="flex items-center justify-between">
          {/* Posted by */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/50 to-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{postedBy.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Star className="h-2.5 w-2.5" />
                {postedBy.rating.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Action button */}
          {onAccept && status === 'open' && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onAccept();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary font-semibold text-xs hover:bg-primary/30 transition-colors flex-shrink-0"
            >
              Accept
            </motion.button>
          )}

          {/* Status indicator */}
          {status !== 'open' && (
            <Badge variant={statusCfg.variant} className="flex-shrink-0 ml-2">
              {statusCfg.label}
            </Badge>
          )}
        </div>
      </PremiumCard>
    </motion.div>
  );
}

/**
 * RequestsGrid - Responsive grid container for requests
 */
export interface RequestsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function RequestsGrid({ children, className }: RequestsGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
      className
    )}>
      {children}
    </div>
  );
}

/**
 * RequestFilterBar - Premium filter bar with chips
 */
export interface RequestFilterBarProps {
  selectedCategory?: string;
  selectedUrgency?: string;
  selectedStatus?: string;
  onCategoryChange?: (category: string) => void;
  onUrgencyChange?: (urgency: string) => void;
  onStatusChange?: (status: string) => void;
  onReset?: () => void;
}

export function RequestFilterBar({
  selectedCategory,
  selectedUrgency,
  selectedStatus,
  onCategoryChange,
  onUrgencyChange,
  onStatusChange,
  onReset,
}: RequestFilterBarProps) {
  const categories = Object.entries(categoryConfig).map(([key, val]) => ({
    id: key,
    label: val.label,
    icon: val.icon,
  }));

  const urgencies = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['open', 'in-progress', 'completed'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-3 p-4 rounded-lg border border-border/50 bg-card"
    >
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange?.(cat.id === selectedCategory ? '' : cat.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {cat.icon} {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Urgency filters */}
      <div className="w-full border-t border-border/30 pt-3 flex flex-wrap gap-2">
        {urgencies.map((urg) => (
          <motion.button
            key={urg}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUrgencyChange?.(urg === selectedUrgency ? '' : urg)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize',
              selectedUrgency === urg
                ? 'bg-warning text-warning-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {urg}
          </motion.button>
        ))}
      </div>

      {/* Reset button */}
      {(selectedCategory || selectedUrgency || selectedStatus) && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={onReset}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset Filters
        </motion.button>
      )}
    </motion.div>
  );
}
