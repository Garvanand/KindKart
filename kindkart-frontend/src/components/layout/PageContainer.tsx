'use client';

import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Max width: default, sm, md, lg, xl, full */
  maxWidth?: 'default' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidthClasses = {
  default: 'max-w-[1400px]',
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  className,
  maxWidth = 'default',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
