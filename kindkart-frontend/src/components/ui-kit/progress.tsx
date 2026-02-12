import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * AnimatedProgressRing - Circular progress indicator
 */
export interface AnimatedProgressRingProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'emergency';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const sizeConfig = {
  sm: { size: 60, strokeWidth: 4, textSize: 'text-sm' },
  md: { size: 100, strokeWidth: 6, textSize: 'text-lg' },
  lg: { size: 140, strokeWidth: 8, textSize: 'text-2xl' },
};

const colorMap = {
  primary: '#6366F1',
  success: '#22C55E',
  warning: '#F59E0B',
  emergency: '#EF4444',
};

export function AnimatedProgressRing({
  percentage,
  size = 'md',
  color = 'primary',
  showLabel = true,
  label,
  animated = true,
}: AnimatedProgressRingProps) {
  const config = sizeConfig[size];
  const radius = config.size / 2 - config.strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          width={config.size}
          height={config.size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background ring */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.strokeWidth}
          />
          {/* Animated progress ring */}
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={colorMap[color]}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={animated ? { strokeDashoffset } : { strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center text */}
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-bold text-foreground', config.textSize)}>
              {Math.round(percentage)}%
            </span>
            {label && <span className="text-xs text-muted-foreground">{label}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AnimatedProgressBar - Linear progress indicator with animations
 */
export interface AnimatedProgressBarProps {
  percentage: number;
  label?: string;
  color?: 'primary' | 'success' | 'warning' | 'emergency';
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const barSizeConfig = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3',
};

const barColorMap = {
  primary: 'from-primary to-primary-light',
  success: 'from-success to-emerald-400',
  warning: 'from-warning to-orange-400',
  emergency: 'from-emergency to-rose-400',
};

export function AnimatedProgressBar({
  percentage,
  label,
  color = 'primary',
  showPercentage = true,
  size = 'md',
  animated = true,
}: AnimatedProgressBarProps) {
  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold text-muted-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-muted overflow-hidden', barSizeConfig[size])}>
        <motion.div
          className={`bg-gradient-to-r ${barColorMap[color]} h-full rounded-full`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/**
 * SkeletonLoader - Animated skeleton for loading states
 */
export interface SkeletonLoaderProps {
  count?: number;
  lines?: number;
  type?: 'card' | 'text' | 'avatar' | 'table';
  className?: string;
}

export function SkeletonLoader({ count = 1, lines = 3, type = 'card', className }: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count });

  if (type === 'avatar') {
    return (
      <div className="flex gap-4">
        {skeletons.map((_, i) => (
          <motion.div
            key={i}
            className="h-12 w-12 rounded-full bg-muted"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-2">
        {skeletons.map((_, i) =>
          Array.from({ length: lines }).map((_, j) => (
            <motion.div
              key={`${i}-${j}`}
              className={cn(
                'h-4 bg-muted rounded',
                j === lines - 1 ? 'w-3/4' : 'w-full'
              )}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          ))
        )}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-4">
        {skeletons.map((_, i) => (
          <motion.div
            key={i}
            className="flex gap-4 p-4 rounded-lg border border-border"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="h-10 w-10 rounded bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Default: card skeleton
  return (
    <div className="space-y-4">
      {skeletons.map((_, i) => (
        <motion.div
          key={i}
          className={cn('rounded-lg border border-border p-4', className)}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-muted rounded" />
            {Array.from({ length: lines - 1 }).map((_, j) => (
              <div key={j} className={cn('h-3 bg-muted rounded', j === lines - 2 ? 'w-1/2' : 'w-full')} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * EmptyState - Beautiful empty state component
 */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {icon && (
        <motion.div
          className="h-16 w-16 text-muted-foreground/30 mb-4"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {icon}
        </motion.div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>}
      {action && (
        <motion.button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * Pulse Animation - For live activity indicators
 */
export interface PulseProps {
  children?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
}

const pulseColorMap = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  emergency: 'bg-emergency',
};

const pulseSizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function Pulse({ children, color = 'primary', size = 'md' }: PulseProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className={cn(pulseColorMap[color], pulseSizeMap[size], 'rounded-full')}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className={cn(pulseColorMap[color], pulseSizeMap[size], 'rounded-full absolute inset-0')} />
      </div>
      {children}
    </div>
  );
}
