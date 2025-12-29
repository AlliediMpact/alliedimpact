'use client';

import { motion } from 'framer-motion';
import { progressBar } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  animated?: boolean;
  striped?: boolean;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  size = 'md',
  variant = 'default',
  animated = true,
  striped = false
}: AnimatedProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantStyles = {
    default: 'bg-gradient-to-r from-purple-600 to-blue-600',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600',
    warning: 'bg-gradient-to-r from-yellow-600 to-orange-600',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600'
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', sizeStyles[size])}>
        <motion.div
          className={cn(
            'h-full rounded-full',
            variantStyles[variant],
            striped && 'bg-striped'
          )}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
        />
      </div>
    </div>
  );
}

// Circular progress
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: React.ReactNode;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true,
  variant = 'default'
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    default: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.43, 0.13, 0.23, 0.96] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.span
            className="text-2xl font-bold text-gray-900 dark:text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {percentage.toFixed(0)}%
          </motion.span>
        )}
        {label && <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{label}</span>}
      </div>
    </div>
  );
}

// Step progress indicator
interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-1"
          >
            <motion.div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors',
                index < currentStep
                  ? 'bg-green-600 border-green-600 text-white'
                  : index === currentStep
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {index < currentStep ? '✓' : index + 1}
            </motion.div>
            <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 text-center">
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
        />
      </div>
    </div>
  );
}
