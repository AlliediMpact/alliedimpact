'use client';

import { motion } from 'framer-motion';
import { OrderStatus } from '@/lib/p2p-mock-data';
import { Clock, CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string; bg: string }> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  'payment-pending': {
    label: 'Awaiting Payment',
    icon: Package,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
  },
  disputed: {
    label: 'Disputed',
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.color} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </motion.span>
  );
}
