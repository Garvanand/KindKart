import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Premium Badge - with multiple variants and animations
 */
export interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'emergency' | 'info' | 'ghost';
  icon?: ReactNode;
  animated?: boolean;
  className?: string;
}

const variantConfig = {
  primary: 'bg-primary/15 text-primary border border-primary/30',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  emergency: 'bg-emergency/15 text-emergency border border-emergency/30',
  info: 'bg-info/15 text-info border border-info/30',
  ghost: 'bg-muted/40 text-muted-foreground border border-muted/60',
};

export function Badge({ children, variant = 'primary', icon, animated = false, className }: BadgeProps) {
  const Component = animated ? motion.div : 'div';

  return (
    <Component
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
        variantConfig[variant],
        className
      )}
      animate={animated ? { scale: [1, 1.05, 1] } : undefined}
      transition={animated ? { duration: 0.6, repeat: Infinity, repeatDelay: 2 } : undefined}
    >
      {icon}
      {children}
    </Component>
  );
}

/**
 * Chip - Removable badge with close button
 */
export interface ChipProps extends BadgeProps {
  onRemove?: () => void;
}

export function Chip({ children, variant = 'primary', icon, onRemove, className }: ChipProps) {
  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
        variantConfig[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      <span>{children}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}

/**
 * AnimatedBadge - Badge with unlock animation effect
 */
export interface AnimatedBadgeProps extends BadgeProps {
  unlocked?: boolean;
}

export function AnimatedBadge({ children, variant = 'primary', icon, unlocked = false, className }: AnimatedBadgeProps) {
  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
        variantConfig[variant],
        className
      )}
      initial={unlocked ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={unlocked ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
      transition={unlocked ? { type: 'spring', stiffness: 200, damping: 15 } : undefined}
    >
      {icon}
      {children}
    </motion.div>
  );
}

/**
 * StatusBadge - For displaying status with dot indicator
 */
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'pending' | 'active';
  label?: string;
  className?: string;
}

const statusConfig = {
  online: { bg: 'bg-success', label: 'Online' },
  offline: { bg: 'bg-muted-foreground', label: 'Offline' },
  away: { bg: 'bg-warning', label: 'Away' },
  pending: { bg: 'bg-info', label: 'Pending' },
  active: { bg: 'bg-primary', label: 'Active' },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className={cn('inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium', className)}>
      <motion.div
        className={cn('h-2 w-2 rounded-full', config.bg)}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-muted-foreground">{label || config.label}</span>
    </div>
  );
}

/**
 * PriorityBadge - For displaying priority levels
 */
export interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
}

const priorityConfig = {
  low: { variant: 'ghost' as const, label: 'Low' },
  medium: { variant: 'info' as const, label: 'Medium' },
  high: { variant: 'warning' as const, label: 'High' },
  urgent: { variant: 'emergency' as const, label: 'Urgent' },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

/**
 * TrustScoreBadge - Shows trust score with color gradient
 */
export interface TrustScoreBadgeProps {
  score: number;
  maxScore?: number;
  className?: string;
}

export function TrustScoreBadge({ score, maxScore = 5, className }: TrustScoreBadgeProps) {
  const percentage = (score / maxScore) * 100;
  let variant: 'success' | 'warning' | 'emergency' | 'primary';

  if (percentage >= 80) variant = 'success';
  else if (percentage >= 60) variant = 'primary';
  else if (percentage >= 40) variant = 'warning';
  else variant = 'emergency';

  return (
    <Badge variant={variant} className={className}>
      ★ {score.toFixed(1)}/{maxScore}
    </Badge>
  );
}
