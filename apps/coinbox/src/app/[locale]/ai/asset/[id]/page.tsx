'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { mockAIAssets, predictionColors } from '@/lib/ai-mock-data';
import { RiskScoreBadge } from '@/components/ai/RiskScoreBadge';
import { SentimentMeter } from '@/components/ai/SentimentMeter';
import { pageTransition, fadeIn } from '@/lib/animations';

export default function AIAssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  // Find asset by ID (UI mock)
  const asset = mockAIAssets.find((a) => a.id === assetId) || mockAIAssets[0];

  const [expandedSection, setExpandedSection] = useState<string | null>('prediction');

  const predictionConfig = predictionColors[asset.prediction.type];
  const priceChange = asset.priceChange24h;
  const isPositive = priceChange >= 0;

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // Calculate risk level from score
  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'extreme' => {
    if (score < 30) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    return 'extreme';
  };

  const riskLevel = getRiskLevel(asset.riskScore);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="min-h-screen bg-gradient-to-br from-[#0A0F1E] via-[#111827] to-[#0A0F1E] text-white"
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div variants={fadeIn} className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#193281] to-[#2563EB] flex items-center justify-center text-4xl">
                {asset.icon}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{asset.name}</h1>
                <div className="flex items-center gap-4">
                  <span className="text-xl text-gray-400">{asset.symbol}</span>
                  {asset.trending && (
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-semibold">
                      🔥 Trending
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Card */}
            <motion.div variants={fadeIn} className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Current Price</div>
                  <div className="text-5xl font-bold text-white mb-3">
                    ${asset.currentPrice.toLocaleString()}
                  </div>
                  <div className={`flex items-center gap-2 text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}% (24h)</span>
                  </div>
                </div>

                {/* Prediction Badge */}
                <div className={`${predictionConfig.bg} border ${predictionConfig.bg.replace('bg-', 'border-').replace('/10', '/20')} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{predictionConfig.icon}</span>
                    <div>
                      <div className={`font-bold ${predictionConfig.text} capitalize text-lg`}>
                        {asset.prediction.type}
                      </div>
                      <div className="text-xs text-gray-400">AI Prediction</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {asset.prediction.confidence}% confidence
                  </div>
                </div>
              </div>

              {/* Price Chart Placeholder */}
              <div className="bg-[#1E293B] rounded-lg p-6 mb-4">
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <div>Price Chart (Coming Soon)</div>
                    <div className="text-sm">Real-time price data will be integrated in Phase 2</div>
                  </div>
                </div>
              </div>

              {/* Market Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-[#1E293B] rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">24h Volume</div>
                  <div className="text-lg font-bold text-white">
                    ${(asset.volume24h / 1000000000).toFixed(2)}B
                  </div>
                </div>
                <div className="text-center p-3 bg-[#1E293B] rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Market Cap</div>
                  <div className="text-lg font-bold text-white">
                    ${(asset.marketCap / 1000000000).toFixed(2)}B
                  </div>
                </div>
                <div className="text-center p-3 bg-[#1E293B] rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Supply</div>
                  <div className="text-lg font-bold text-white">
                    {asset.symbol === 'BTC' ? '19.6M' : asset.symbol === 'ETH' ? '120M' : 'Unlimited'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Prediction Section */}
            <motion.div variants={fadeIn} className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('prediction')}
                className="w-full p-6 flex items-center justify-between hover:bg-[#1E293B]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">AI Prediction Analysis</h3>
                </div>
                {expandedSection === 'prediction' ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSection === 'prediction' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  {/* Target Prices */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Price Targets</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(asset.prediction.targetPrice).map(([timeframe, price]) => (
                        <div key={timeframe} className="bg-[#1E293B] rounded-lg p-4 text-center">
                          <div className="text-xs text-gray-400 mb-1">{timeframe}</div>
                          <div className="text-2xl font-bold text-white">${price.toLocaleString()}</div>
                          <div className={`text-xs mt-1 ${price > asset.currentPrice ? 'text-green-400' : 'text-red-400'}`}>
                            {((price - asset.currentPrice) / asset.currentPrice * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Factors */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Key Factors</h4>
                    <div className="space-y-2">
                      {asset.prediction.keyFactors.map((factor, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-[#1E293B] rounded-lg">
                          <span className="text-green-400">✓</span>
                          <span className="text-gray-300">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">AI Analysis</h4>
                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-lg p-4">
                      <p className="text-gray-300 leading-relaxed">{asset.prediction.aiExplanation}</p>
                      <div className="mt-3 text-xs text-gray-500">
                        Last updated: {asset.prediction.lastUpdated.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Technical Indicators */}
            <motion.div variants={fadeIn} className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection('technical')}
                className="w-full p-6 flex items-center justify-between hover:bg-[#1E293B]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Technical Indicators</h3>
                </div>
                {expandedSection === 'technical' ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {expandedSection === 'technical' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-6 pb-6 space-y-6"
                >
                  {/* RSI */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">RSI (14)</span>
                      <span className="text-lg font-bold text-white">{asset.technicalIndicators.rsi}</span>
                    </div>
                    <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${asset.technicalIndicators.rsi}%` }}
                        className={`h-full ${
                          asset.technicalIndicators.rsi < 30 ? 'bg-green-500' :
                          asset.technicalIndicators.rsi > 70 ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Oversold (&lt;30)</span>
                      <span>Overbought (&gt;70)</span>
                    </div>
                  </div>

                  {/* Moving Averages */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Moving Averages</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(asset.technicalIndicators.movingAverages).map(([ma, value]) => (
                        <div key={ma} className="bg-[#1E293B] rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-400 mb-1">{ma.toUpperCase()}</div>
                          <div className="text-lg font-bold text-white">${value.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MACD */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">MACD</h4>
                    <div className="bg-[#1E293B] rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">MACD Line</span>
                        <span className="text-white font-semibold">{asset.technicalIndicators.macd.value}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Signal Line</span>
                        <span className="text-white font-semibold">{asset.technicalIndicators.macd.signal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Histogram</span>
                        <span className={`font-semibold ${asset.technicalIndicators.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.technicalIndicators.macd.histogram}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Risk Score */}
            <motion.div variants={fadeIn} className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 text-center">Risk Assessment</h3>
              <div className="flex justify-center mb-6">
                <RiskScoreBadge score={asset.riskScore} level={riskLevel} size="lg" showLabel={true} />
              </div>
              <p className="text-sm text-gray-400 text-center">
                {asset.riskScore < 30 
                  ? 'Low risk investment with stable fundamentals'
                  : asset.riskScore < 50 
                  ? 'Moderate risk with good growth potential'
                  : asset.riskScore < 75
                  ? 'High volatility - suitable for risk-tolerant investors'
                  : 'Extreme risk - only for experienced traders'
                }
              </p>
            </motion.div>

            {/* Sentiment Analysis */}
            <motion.div variants={fadeIn} className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Market Sentiment</h3>
              <SentimentMeter score={asset.sentiment.score} size="md" />
              
              <div className="mt-6 space-y-3">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Sentiment Sources</div>
                  <div className="space-y-2">
                    {Object.entries(asset.sentiment.sources).map(([source, score]) => (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 capitalize">{source}</span>
                        <span className={`text-sm font-semibold ${score > 70 ? 'text-green-400' : score < 40 ? 'text-red-400' : 'text-gray-400'}`}>
                          {score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Trending Topics */}
            {asset.sentiment.trendingTopics.length > 0 && (
              <motion.div variants={fadeIn} className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Trending Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {asset.sentiment.trendingTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent News */}
            {asset.sentiment.recentNews.length > 0 && (
              <motion.div variants={fadeIn} className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent News</h3>
                <div className="space-y-3">
                  {asset.sentiment.recentNews.map((news) => (
                    <div key={news.id} className="pb-3 border-b border-[#1E293B] last:border-0 last:pb-0">
                      <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">{news.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{news.source}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(news.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
