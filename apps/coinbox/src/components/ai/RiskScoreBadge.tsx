'use client';

import { motion } from 'framer-motion';
import { RiskLevel, riskLevelColors } from '@/lib/ai-mock-data';
import { Shield, AlertTriangle } from 'lucide-react';

interface RiskScoreBadgeProps {
  score: number; // 0-100
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskScoreBadge({ score, level, size = 'md', showLabel = true }: RiskScoreBadgeProps) {
  const style = riskLevelColors[level];
  
  const sizeClasses = {
    sm: { container: 'w-16 h-16', text: 'text-xs', score: 'text-lg' },
    md: { container: 'w-20 h-20', text: 'text-sm', score: 'text-2xl' },
    lg: { container: 'w-24 h-24', text: 'text-base', score: 'text-3xl' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className={`${sizes.container} rounded-full ${style.bg} border-2 ${style.border} flex flex-col items-center justify-center relative overflow-hidden`}
      >
        {/* Animated background fill based on score */}
        <motion.div
          initial={{ height: '0%' }}
          animate={{ height: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`absolute bottom-0 left-0 right-0 ${style.bg.replace('/10', '/20')}`}
        />
        
        <div className="relative z-10 text-center">
          <div className={`${sizes.score} font-bold ${style.text}`}>{score}</div>
          <div className={`${sizes.text} ${style.text} opacity-70`}>Risk</div>
        </div>
      </motion.div>

      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`px-3 py-1 rounded-full ${style.bg} ${style.text} flex items-center gap-1.5`}
        >
          {level === 'low' || level === 'medium' ? (
            <Shield className="w-3 h-3" />
          ) : (
            <AlertTriangle className="w-3 h-3" />
          )}
          <span className="text-xs font-semibold capitalize">{level} Risk</span>
        </motion.div>
      )}
    </div>
  );
}
