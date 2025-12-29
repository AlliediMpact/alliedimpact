'use client';

import { motion } from 'framer-motion';
import { Package, Search, TrendingUp } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'package' | 'search' | 'trending';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  package: Package,
  search: Search,
  trending: TrendingUp,
};

export function EmptyState({ icon = 'package', title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-[#1E293B] flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{description}</p>
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-[#193281] to-[#2563EB] text-white rounded-lg font-semibold hover:from-[#2563EB] hover:to-[#3B82F6] transition-all duration-300"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
