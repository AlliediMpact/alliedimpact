/**
 * Loading Components - Allied iMpact Platform
 * 
 * CRITICAL RULES:
 * - These are PURE UI components (no data, no state management)
 * - Simplified version without framer-motion dependency
 * - Receive all configuration via props
 * 
 * Reference: CoinBox loading-states.tsx (cleaned of dependencies)
 */

import * as React from 'react';
import { cn } from '../utils';

// ==================== Skeleton ====================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable pulse animation
   * @default true
   */
  animate?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animate = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-gray-200 dark:bg-gray-700',
          animate && 'animate-pulse',
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

// ==================== Card Skeleton ====================

export interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn('p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// ==================== Table Skeleton ====================

export interface TableSkeletonProps {
  /**
   * Number of rows to display
   * @default 5
   */
  rows?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="flex-1 h-4" />
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      ))}
    </div>
  );
}

// ==================== Spinner ====================

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Spinner size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', className, ...props }, ref) => {
    const sizes = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-block rounded-full border-t-transparent border-primary-blue animate-spin',
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

// ==================== Page Loader ====================

export interface PageLoaderProps {
  /**
   * Loading message
   * @default "Loading..."
   */
  message?: string;
  className?: string;
}

export function PageLoader({ message = 'Loading...', className }: PageLoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-screen w-full', className)}>
      <Spinner size="lg" />
      <p className="mt-4 text-lg font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

// ==================== Loading Overlay ====================

export interface LoadingOverlayProps {
  /**
   * Show/hide overlay
   */
  isLoading: boolean;
  /**
   * Loading message
   */
  message?: string;
  /**
   * Overlay background opacity
   * @default 'medium'
   */
  opacity?: 'light' | 'medium' | 'dark';
  className?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  message,
  opacity = 'medium',
  className,
  children,
}: LoadingOverlayProps) {
  const opacities = {
    light: 'bg-background/50',
    medium: 'bg-background/75',
    dark: 'bg-background/90',
  };

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {children}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center',
          opacities[opacity],
          className
        )}
      >
        <Spinner size="lg" />
        {message && <p className="mt-4 text-sm font-medium">{message}</p>}
      </div>
    </div>
  );
}

// ==================== Content Loader (List) ====================

export interface ContentLoaderProps {
  /**
   * Number of items to display
   * @default 3
   */
  items?: number;
  /**
   * Layout type
   * @default 'list'
   */
  variant?: 'list' | 'grid' | 'table';
  className?: string;
}

export function ContentLoader({ items = 3, variant = 'list', className }: ContentLoaderProps) {
  if (variant === 'table') {
    return <TableSkeleton rows={items} className={className} />;
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: items }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // List variant
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="w-16 h-16 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
