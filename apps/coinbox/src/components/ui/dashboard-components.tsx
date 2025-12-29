'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { StatCard } from './animated-card';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, ArrowUpRight } from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/animations';

interface DashboardStatProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
}

export function DashboardStat({
  title,
  value,
  change,
  changeLabel,
  icon,
  prefix,
  suffix,
  format = 'number',
  className,
}: DashboardStatProps) {
  return (
    <StatCard
      title={title}
      value={typeof value === 'number' ? value : 0}
      change={change}
      icon={icon}
      prefix={prefix}
      suffix={suffix}
      format={format}
      className={className}
    >
      {changeLabel && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{changeLabel}</p>
      )}
    </StatCard>
  );
}

interface DashboardStatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DashboardStatsGrid({
  children,
  columns = 4,
  className,
}: DashboardStatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn('grid gap-6', gridCols[columns], className)}
    >
      {children}
    </motion.div>
  );
}

// Quick action button
interface QuickActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function QuickAction({
  icon,
  label,
  onClick,
  variant = 'primary',
  className,
}: QuickActionProps) {
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-md',
        variants[variant],
        className
      )}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

// Floating action button
interface FABProps {
  icon: ReactNode;
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export function FAB({
  icon,
  onClick,
  label,
  position = 'bottom-right',
  className,
}: FABProps) {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed z-50 flex items-center gap-2 px-6 py-4 rounded-full shadow-2xl',
        'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium',
        'hover:shadow-purple-500/50 transition-shadow',
        positions[position],
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {icon}
      {label && <span className="text-sm">{label}</span>}
    </motion.button>
  );
}

// Activity feed item
interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  const getVariantColors = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600';
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600';
      default:
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600';
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn('space-y-4', className)}
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={fadeInUp}
          className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
        >
          {item.icon && (
            <div className={cn('p-2 rounded-lg shrink-0', getVariantColors(item.variant))}>
              {item.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{item.timestamp}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Chart container with loading state
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  loading?: boolean;
  action?: ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  loading,
  action,
  className,
}: ChartContainerProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        'p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"
          />
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}

// Metric comparison card
interface MetricComparisonProps {
  title: string;
  current: number;
  previous: number;
  format?: 'number' | 'currency' | 'percentage';
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function MetricComparison({
  title,
  current,
  previous,
  format = 'number',
  prefix = '',
  suffix = '',
  className,
}: MetricComparisonProps) {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change >= 0;

  const formatValue = (value: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    if (format === 'percentage') {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        'p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{title}</h4>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {prefix}
            {formatValue(current)}
            {suffix}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            vs {prefix}
            {formatValue(previous)}
            {suffix}
          </p>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium',
            isPositive
              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          )}
        >
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      </div>
    </motion.div>
  );
}
