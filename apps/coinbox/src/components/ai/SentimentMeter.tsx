'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface SentimentMeterProps {
  score: number; // -100 to 100
  size?: 'sm' | 'md' | 'lg';
}

export function SentimentMeter({ score, size = 'md' }: SentimentMeterProps) {
  const normalizedScore = Math.max(-100, Math.min(100, score));
  const percentage = ((normalizedScore + 100) / 200) * 100;
  
  const getSentimentColor = (score: number) => {
    if (score > 40) return { bg: 'bg-green-500', text: 'text-green-400', label: 'Very Positive' };
    if (score > 10) return { bg: 'bg-green-400', text: 'text-green-300', label: 'Positive' };
    if (score > -10) return { bg: 'bg-gray-400', text: 'text-gray-300', label: 'Neutral' };
    if (score > -40) return { bg: 'bg-red-400', text: 'text-red-300', label: 'Negative' };
    return { bg: 'bg-red-500', text: 'text-red-400', label: 'Very Negative' };
  };

  const sentiment = getSentimentColor(normalizedScore);

  const sizeClasses = {
    sm: { height: 'h-2', icon: 'w-4 h-4', text: 'text-xs' },
    md: { height: 'h-3', icon: 'w-5 h-5', text: 'text-sm' },
    lg: { height: 'h-4', icon: 'w-6 h-6', text: 'text-base' },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {normalizedScore > 10 ? (
            <TrendingUp className={`${sizes.icon} ${sentiment.text}`} />
          ) : normalizedScore < -10 ? (
            <TrendingDown className={`${sizes.icon} ${sentiment.text}`} />
          ) : (
            <Activity className={`${sizes.icon} ${sentiment.text}`} />
          )}
          <span className={`${sizes.text} font-semibold ${sentiment.text}`}>
            {sentiment.label}
          </span>
        </div>
        <span className={`${sizes.text} font-bold ${sentiment.text}`}>
          {normalizedScore > 0 ? '+' : ''}{normalizedScore}
        </span>
      </div>

      {/* Sentiment Bar */}
      <div className={`w-full ${sizes.height} bg-[#1E293B] rounded-full overflow-hidden relative`}>
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-gray-400 to-green-500 opacity-30" />
        
        {/* Animated fill */}
        <motion.div
          initial={{ width: '50%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${sentiment.bg} relative`}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-white opacity-20"
          />
        </motion.div>

        {/* Center marker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white opacity-30" />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
        <span>Bearish</span>
        <span>Neutral</span>
        <span>Bullish</span>
      </div>
    </div>
  );
}
