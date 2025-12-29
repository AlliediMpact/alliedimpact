'use client';

import { motion } from 'framer-motion';
import { cardHover, glow } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  glow: glowEffect = false,
  gradient = false,
  onClick
}: AnimatedCardProps) {
  const baseStyles = 'rounded-xl p-6 transition-all';
  const cardStyles = gradient
    ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800'
    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';

  return (
    <motion.div
      className={cn(baseStyles, cardStyles, onClick && 'cursor-pointer', className)}
      variants={hover ? cardHover : undefined}
      initial="rest"
      whileHover={hover ? "hover" : undefined}
      whileTap={hover && onClick ? "tap" : undefined}
      animate={glowEffect ? glow.hover : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// Glass card variant
export function GlassCard({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        'rounded-xl p-6 backdrop-blur-lg bg-white/10 dark:bg-gray-900/30 border border-white/20 shadow-xl',
        className
      )}
      variants={cardHover}
      initial="rest"
      whileHover="hover"
    >
      {children}
    </motion.div>
  );
}

// Stat card with animation
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
}

export function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <AnimatedCard hover glow gradient>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <motion.p
            className="mt-2 text-3xl font-bold text-gray-900 dark:text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {value}
          </motion.p>
          {change !== undefined && (
            <motion.p
              className={cn(
                'mt-2 text-sm font-medium flex items-center gap-1',
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
            </motion.p>
          )}
        </div>
        {icon && (
          <motion.div
            className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 text-purple-600 dark:text-purple-400"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </AnimatedCard>
  );
}
