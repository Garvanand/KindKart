import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PremiumCardProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ReactNode;
  interactive?: boolean;
  elevated?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

/**
 * PremiumCard - Base card component with premium styling
 */
export function PremiumCard({
  children,
  className,
  interactive = false,
  elevated = false,
  padding = 'md',
  ...restProps
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#dbe3db] bg-white',
        paddingMap[padding],
        elevated && 'shadow-sm',
        interactive && 'cursor-pointer transition-colors duration-200 hover:bg-[#f7faf7]',
        !interactive && 'transition-all duration-200',
        className
      )}
      {...restProps}
    >
      {children}
    </div>
  );
}

/**
 * StatCard - Display a single statistic with label and value
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { direction: 'up' | 'down'; value: number };
  color?: 'primary' | 'success' | 'warning' | 'emergency' | 'info';
}

export function StatCard({ label, value, icon, trend, color = 'primary' }: StatCardProps) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    emergency: 'bg-emergency/10 text-emergency',
    info: 'bg-info/10 text-info',
  };

  return (
    <PremiumCard elevated interactive>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <span className={cn(
                'text-xs font-semibold',
                trend.direction === 'up' ? 'text-success' : 'text-emergency'
              )}>
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', colorMap[color])}>
            {icon}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}

/**
 * FeatureCard - Card for displaying a feature with icon, title and description
 */
export interface FeatureCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  action?: { label: string; onClick: () => void };
  badge?: string;
}

export function FeatureCard({ title, description, icon, action, badge }: FeatureCardProps) {
  return (
    <PremiumCard interactive elevated className="relative overflow-hidden">
      {badge && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
          {badge}
        </div>
      )}
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}

/**
 * TimelineCard - Card for timeline/status display
 */
export interface TimelineCardProps {
  title: string;
  timestamp: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  icon?: ReactNode;
}

export function TimelineCard({ title, timestamp, description, status, icon }: TimelineCardProps) {
  const statusConfig = {
    pending: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending' },
    'in-progress': { bg: 'bg-info/10', text: 'text-info', label: 'In Progress' },
    completed: { bg: 'bg-success/10', text: 'text-success', label: 'Completed' },
  };

  const config = status ? statusConfig[status] : statusConfig.pending;

  return (
    <PremiumCard>
      <div className="flex gap-4">
        {icon ? (
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bg, config.text)}>
            {icon}
          </div>
        ) : (
          <div className={cn('h-2 w-2 rounded-full mt-1.5 flex-shrink-0', config.bg.replace('bg-', 'bg-'))} />
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-foreground">{title}</h4>
            {status && (
              <span className={cn('text-xs font-semibold', config.text)}>
                {config.label}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1">{timestamp}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}
