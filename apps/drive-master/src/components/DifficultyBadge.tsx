'use client';

/**
 * DifficultyBadge Component
 * 
 * Displays journey difficulty based on historical pass rates
 * - Easy: 70%+ pass rate (green)
 * - Medium: 40-69% pass rate (yellow)
 * - Hard: <40% pass rate (red)
 */

import { AlertCircle, TrendingUp, Zap } from 'lucide-react';

export interface DifficultyLevel {
  level: 'easy' | 'medium' | 'hard';
  passRate: number;
  totalAttempts: number;
}

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  variant?: 'default' | 'compact';
  showPercentage?: boolean;
}

export function DifficultyBadge({
  difficulty,
  variant = 'default',
  showPercentage = true,
}: DifficultyBadgeProps) {
  const { level, passRate, totalAttempts } = difficulty;

  const config = {
    easy: {
      icon: Zap,
      label: 'Easy',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      dotColor: 'bg-green-500',
    },
    medium: {
      icon: TrendingUp,
      label: 'Medium',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      dotColor: 'bg-yellow-500',
    },
    hard: {
      icon: AlertCircle,
      label: 'Hard',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      dotColor: 'bg-red-500',
    },
  };

  const { icon: Icon, label, bgColor, textColor, borderColor, dotColor } = config[level];

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${bgColor} ${textColor}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        {label}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${bgColor} ${textColor} ${borderColor}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-semibold text-sm">{label}</span>
      {showPercentage && (
        <>
          <span className="text-xs opacity-70">•</span>
          <span className="text-xs font-medium">
            {passRate}% pass rate
          </span>
        </>
      )}
      {totalAttempts >= 10 && (
        <span className="text-xs opacity-60">
          ({totalAttempts.toLocaleString()} attempts)
        </span>
      )}
    </div>
  );
}

/**
 * Calculate difficulty level based on pass rate
 */
export function calculateDifficulty(
  passedAttempts: number,
  totalAttempts: number
): DifficultyLevel {
  if (totalAttempts === 0) {
    // No data yet - assume medium difficulty
    return {
      level: 'medium',
      passRate: 50,
      totalAttempts: 0,
    };
  }

  const passRate = Math.round((passedAttempts / totalAttempts) * 100);

  let level: 'easy' | 'medium' | 'hard';
  if (passRate >= 70) {
    level = 'easy';
  } else if (passRate >= 40) {
    level = 'medium';
  } else {
    level = 'hard';
  }

  return {
    level,
    passRate,
    totalAttempts,
  };
}

/**
 * Hook to display difficulty info in a tooltip or modal
 */
export function DifficultyInfo({ difficulty }: { difficulty: DifficultyLevel }) {
  const { level, passRate, totalAttempts } = difficulty;

  const insights = {
    easy: {
      message: 'Most users pass this journey on their first try',
      tips: ['Great for beginners', 'Good confidence builder', 'Covers fundamental concepts'],
    },
    medium: {
      message: 'About half of users pass this journey',
      tips: [
        'Review the material first',
        'Take your time with each question',
        'Practice makes perfect',
      ],
    },
    hard: {
      message: 'This is a challenging journey - many users need multiple attempts',
      tips: [
        'Study thoroughly before starting',
        'Use the explanation feature after wrong answers',
        'Consider revisiting easier journeys first',
      ],
    },
  };

  const { message, tips } = insights[level];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="mb-3">
        <DifficultyBadge difficulty={difficulty} showPercentage={true} />
      </div>

      <p className="text-sm text-gray-700 mb-3">{message}</p>

      {totalAttempts >= 10 && (
        <div className="mb-3 text-xs text-gray-500">
          Based on {totalAttempts.toLocaleString()} attempts by {Math.floor(totalAttempts / 1.5)}{' '}
          users
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-700 uppercase">Tips</div>
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-primary-500 mt-0.5">•</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
