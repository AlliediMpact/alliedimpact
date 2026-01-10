import React from 'react';
import { cn } from '@/utils/cn';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'button';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function LoadingSkeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'rounded-lg h-48',
    avatar: 'rounded-full w-10 h-10',
    button: 'rounded-md h-10',
  };

  const skeletonClasses = cn(
    baseClasses,
    variantClasses[variant],
    className
  );

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  if (count === 1) {
    return <div className={skeletonClasses} style={style} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} style={style} />
      ))}
    </>
  );
}

// Specialized skeleton components for common use cases

export function MatchCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <LoadingSkeleton variant="avatar" className="w-12 h-12" />
          <div className="space-y-2 flex-1">
            <LoadingSkeleton variant="text" className="w-3/4" />
            <LoadingSkeleton variant="text" className="w-1/2 h-3" />
          </div>
        </div>
        <LoadingSkeleton variant="rectangular" className="w-16 h-6" />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <LoadingSkeleton variant="rectangular" className="w-20 h-6" />
        <LoadingSkeleton variant="rectangular" className="w-24 h-6" />
        <LoadingSkeleton variant="rectangular" className="w-16 h-6" />
      </div>
      
      <LoadingSkeleton variant="text" className="w-full h-3" count={2} />
      
      <div className="flex flex-wrap gap-2">
        <LoadingSkeleton variant="rectangular" className="w-16 h-5" />
        <LoadingSkeleton variant="rectangular" className="w-20 h-5" />
        <LoadingSkeleton variant="rectangular" className="w-16 h-5" />
        <LoadingSkeleton variant="rectangular" className="w-20 h-5" />
      </div>
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3">
          <LoadingSkeleton variant="avatar" className="w-12 h-12" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <LoadingSkeleton variant="text" className="w-32 h-4" />
              <LoadingSkeleton variant="text" className="w-12 h-3" />
            </div>
            <LoadingSkeleton variant="text" className="w-full h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <LoadingSkeleton variant="avatar" className="w-20 h-20" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" className="w-48 h-5" />
          <LoadingSkeleton variant="text" className="w-32 h-4" />
        </div>
      </div>
      
      <LoadingSkeleton variant="text" className="w-full h-3" count={3} />
      
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center space-x-3">
          <LoadingSkeleton variant="circular" className="w-5 h-5" />
          <LoadingSkeleton variant="text" className="w-40 h-4" />
        </div>
        <div className="flex items-center space-x-3">
          <LoadingSkeleton variant="circular" className="w-5 h-5" />
          <LoadingSkeleton variant="text" className="w-36 h-4" />
        </div>
        <div className="flex items-center space-x-3">
          <LoadingSkeleton variant="circular" className="w-5 h-5" />
          <LoadingSkeleton variant="text" className="w-44 h-4" />
        </div>
      </div>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <LoadingSkeleton variant="text" className="w-3/4 h-5" />
          <LoadingSkeleton variant="text" className="w-1/2 h-4" />
        </div>
        <LoadingSkeleton variant="rectangular" className="w-20 h-6" />
      </div>
      
      <div className="flex items-center space-x-4">
        <LoadingSkeleton variant="rectangular" className="w-24 h-5" />
        <LoadingSkeleton variant="rectangular" className="w-20 h-5" />
        <LoadingSkeleton variant="rectangular" className="w-28 h-5" />
      </div>
      
      <LoadingSkeleton variant="text" className="w-full h-3" count={2} />
      
      <div className="flex items-center justify-between pt-4 border-t">
        <LoadingSkeleton variant="text" className="w-32 h-4" />
        <LoadingSkeleton variant="button" className="w-28" />
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <LoadingSkeleton variant="text" className="w-24 h-4" />
            <LoadingSkeleton variant="circular" className="w-10 h-10" />
          </div>
          <LoadingSkeleton variant="text" className="w-16 h-8" />
          <LoadingSkeleton variant="text" className="w-32 h-3" />
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="border-b py-4 flex items-center space-x-4">
      {Array.from({ length: columns }).map((_, index) => (
        <LoadingSkeleton key={index} variant="text" className="flex-1 h-4" />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <LoadingSkeleton variant="text" className="w-32 h-4" />
          <LoadingSkeleton variant="rectangular" className="w-full h-10" />
        </div>
      ))}
      <LoadingSkeleton variant="button" className="w-32" />
    </div>
  );
}
