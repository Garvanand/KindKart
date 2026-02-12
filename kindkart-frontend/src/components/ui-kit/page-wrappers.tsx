import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * PageHeader - Premium page header with back button, title, and actions
 */
export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  onBack?: () => void;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  onBack,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      className={cn('py-6 sm:py-8 border-b border-border/50', className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {breadcrumbs.map((crumb, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <a
                  href={crumb.href || '#'}
                  className={cn(
                    'text-sm',
                    idx === breadcrumbs.length - 1
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground transition-colors'
                  )}
                >
                  {crumb.label}
                </a>
                {idx < breadcrumbs.length - 1 && (
                  <span className="text-muted-foreground">/</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 mt-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            {icon && (
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                {icon}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="text-base text-muted-foreground mt-2">{description}</p>
              )}
            </div>
          </div>

          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * PageSection - Container for page sections with consistent padding
 */
export interface PageSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  noBorder?: boolean;
}

export function PageSection({
  children,
  title,
  subtitle,
  className,
  noBorder = false,
}: PageSectionProps) {
  return (
    <motion.section
      className={cn(
        'py-8 sm:py-12',
        !noBorder && 'border-b border-border/50',
        className
      )}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h2>}
            {subtitle && (
              <p className="text-base text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </motion.section>
  );
}

/**
 * HeroSection - Large hero section with gradient background
 */
export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  image?: ReactNode;
  backgroundPattern?: 'dots' | 'grid' | 'gradient' | 'none';
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  description,
  actions,
  image,
  backgroundPattern = 'gradient',
  className,
}: HeroSectionProps) {
  const patternBg = {
    dots: 'bg-gradient-to-br from-background via-background to-primary/5',
    grid: 'bg-gradient-to-br from-background via-background to-primary/5',
    gradient: 'gradient-primary',
    none: '',
  };

  return (
    <motion.section
      className={cn(
        'relative py-12 sm:py-16 lg:py-24 overflow-hidden',
        patternBg[backgroundPattern],
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-10 -left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {subtitle && (
              <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                {subtitle}
              </p>
            )}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {description}
              </p>
            )}
            {actions && <div className="flex items-center gap-4">{actions}</div>}
          </motion.div>

          {/* Right image */}
          {image && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:block"
            >
              {image}
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

/**
 * ContainerGrid - Responsive grid container
 */
export interface ContainerGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const columnConfig = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const gapConfig = {
  sm: 'gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
};

export function ContainerGrid({
  children,
  columns = 3,
  gap = 'md',
  className,
}: ContainerGridProps) {
  return (
    <div className={cn('grid', columnConfig[columns], gapConfig[gap], className)}>
      {children}
    </div>
  );
}
