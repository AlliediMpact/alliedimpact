'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight, Sparkles } from 'lucide-react';
import { AIAsset, predictionColors, assetIcons } from '@/lib/ai-mock-data';
import { fadeIn } from '@/lib/animations';

interface AssetPredictionCardProps {
  asset: AIAsset;
  onViewDetails: (assetId: string) => void;
}

export function AssetPredictionCard({ asset, onViewDetails }: AssetPredictionCardProps) {
  const predictionConfig = predictionColors[asset.prediction.type];
  const priceChange = asset.priceChange24h;
  const isPositive = priceChange >= 0;

  return (
    <motion.div
      variants={fadeIn}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={() => onViewDetails(asset.id)}
      className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-6 hover:border-[#193281] transition-all duration-300 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#193281] to-[#2563EB] flex items-center justify-center text-2xl">
            {asset.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{asset.symbol}</h3>
            <p className="text-sm text-gray-400">{asset.name}</p>
          </div>
        </div>
        {asset.trending && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-yellow-500/10 rounded-full flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400">Trending</span>
          </motion.div>
        )}
      </div>

      {/* Price Info */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-white mb-2">
          ${asset.currentPrice.toLocaleString()}
        </div>
        <div className={`flex items-center gap-2 text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}% (24h)</span>
        </div>
      </div>

      {/* AI Prediction */}
      <div className={`${predictionConfig.bg} border ${predictionConfig.bg.replace('bg-', 'border-').replace('/10', '/20')} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{predictionConfig.icon}</span>
            <span className={`font-semibold ${predictionConfig.text} capitalize`}>
              {asset.prediction.type}
            </span>
          </div>
          <div className="text-sm font-semibold text-white">
            {asset.prediction.confidence}% confidence
          </div>
        </div>
        <div className="text-xs text-gray-400">
          24h Target: ${asset.prediction.targetPrice['24h'].toLocaleString()}
        </div>
      </div>

      {/* Key Factors */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Key Factors</div>
        <div className="space-y-1">
          {asset.prediction.keyFactors.slice(0, 2).map((factor, index) => (
            <div key={index} className="text-xs text-gray-300 flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span className="line-clamp-1">{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Details Button */}
      <motion.button
        whileHover={{ x: 4 }}
        className="w-full py-2 px-4 bg-gradient-to-r from-[#193281] to-[#2563EB] rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:from-[#2563EB] hover:to-[#3B82F6] transition-all duration-300"
      >
        <span>View Analysis</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
