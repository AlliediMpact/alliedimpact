'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, Upload, Check } from 'lucide-react';
import { AnimatedProgressBar } from './animated-progress';

// Skeleton loader
interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className, animate = true }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        'rounded-lg bg-gray-200 dark:bg-gray-700',
        animate && 'animate-pulse',
        className
      )}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

// Shimmer effect
export function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700', className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          translateX: ['100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
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

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
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

// Spinner
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={cn('inline-block', className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <Loader2 className={cn(sizes[size], 'text-purple-600')} />
    </motion.div>
  );
}

// Full page loader
export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Spinner size="lg" />
        <motion.p
          className="text-gray-600 dark:text-gray-400 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
}

// File upload progress
interface FileUploadProgressProps {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  onCancel?: () => void;
}

export function FileUploadProgress({
  fileName,
  progress,
  status,
  error,
  onCancel,
}: FileUploadProgressProps) {
  return (
    <motion.div
      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            status === 'uploading' && 'bg-purple-100 dark:bg-purple-900/20',
            status === 'success' && 'bg-green-100 dark:bg-green-900/20',
            status === 'error' && 'bg-red-100 dark:bg-red-900/20'
          )}
        >
          {status === 'uploading' && (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Upload className="w-5 h-5 text-purple-600" />
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check className="w-5 h-5 text-green-600" />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Upload className="w-5 h-5 text-red-600" />
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
          {status === 'uploading' && (
            <div className="mt-2">
              <AnimatedProgressBar value={progress} variant="default" showPercentage />
            </div>
          )}
          {status === 'success' && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Upload complete</p>}
          {status === 'error' && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error || 'Upload failed'}</p>}
        </div>

        {status === 'uploading' && onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Dots loader
export function DotsLoader() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-purple-600 rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// Pulse loader
export function PulseLoader() {
  return (
    <motion.div
      className="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-900"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    >
      <motion.div
        className="w-full h-full rounded-full bg-purple-600"
        animate={{
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
}

// Loading overlay
interface LoadingOverlayProps {
  message?: string;
  children?: React.ReactNode;
}

export function LoadingOverlay({ message = 'Loading...', children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      <motion.div
        className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </motion.div>
    </div>
  );
}
