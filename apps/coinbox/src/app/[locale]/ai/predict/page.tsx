'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, TrendingUp, Brain, Bell } from 'lucide-react';
import { mockAIAssets, mockAIPredictions, mockAIAlerts, AIPredictionResponse } from '@/lib/ai-mock-data';
import { AssetPredictionCard } from '@/components/ai/AssetPredictionCard';
import { AlertCard } from '@/components/ai/AlertCard';
import { pageTransition, fadeIn, staggerContainer } from '@/lib/animations';

export default function AIPredictionDashboard() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<AIPredictionResponse[]>(mockAIPredictions);
  const [isAsking, setIsAsking] = useState(false);
  const [alerts, setAlerts] = useState(mockAIAlerts);

  const trendingAssets = mockAIAssets.filter((asset) => asset.trending);
  const unreadAlerts = alerts.filter((alert) => !alert.isRead);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isAsking) return;

    setIsAsking(true);

    // Simulate AI response (UI only)
    setTimeout(() => {
      const newResponse: AIPredictionResponse = {
        id: `pred-${Date.now()}`,
        query: query,
        response: 'Based on current market conditions and historical data, I recommend diversifying your portfolio across multiple assets. Bitcoin and Ethereum remain solid long-term holds with strong fundamentals. Consider dollar-cost averaging to minimize risk exposure. (AI Preview Response)',
        confidence: 82,
        relatedAssets: ['BTC', 'ETH', 'SOL'],
        timestamp: new Date(),
        sources: ['Technical Analysis', 'Market Sentiment', 'Historical Patterns'],
      };
      setResponses((prev) => [newResponse, ...prev]);
      setQuery('');
      setIsAsking(false);
    }, 1500);
  };

  const handleViewAsset = (assetId: string) => {
    router.push(`/ai/asset/${assetId}`);
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)));
  };

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
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                AI Market Predictions
              </h1>
              <p className="text-gray-400">Get intelligent insights powered by advanced AI analysis</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Assets Tracked', value: mockAIAssets.length, icon: TrendingUp },
              { label: 'Avg. Confidence', value: '78%', icon: Brain },
              { label: 'Active Alerts', value: unreadAlerts.length, icon: Bell },
              { label: 'Trending Now', value: trendingAssets.length, icon: Sparkles },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={fadeIn}
                  custom={index}
                  className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ask AI Section */}
            <motion.div variants={fadeIn} className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Ask AI Assistant</h2>
              </div>
              
              <form onSubmit={handleAskAI} className="mb-6">
                <div className="relative">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask anything about crypto markets... e.g., 'Should I buy Bitcoin now?' or 'What's the best long-term investment?'"
                    rows={4}
                    disabled={isAsking}
                    className="w-full px-4 py-3 pr-24 bg-[#1E293B] border border-[#2A3B5B] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#193281] transition-colors resize-none disabled:opacity-50"
                  />
                  <motion.button
                    type="submit"
                    disabled={!query.trim() || isAsking}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute bottom-3 right-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold flex items-center gap-2 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAsking ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Thinking...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Ask</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>

              {/* AI Responses */}
              <div className="space-y-4">
                <AnimatePresence>
                  {responses.map((response, index) => (
                    <motion.div
                      key={response.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#1E293B] border border-[#2A3B5B] rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white mb-1">{response.query}</div>
                          <div className="text-sm text-gray-400">
                            {response.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 rounded-full text-xs font-semibold text-green-400">
                          {response.confidence}% confident
                        </div>
                      </div>
                      <div className="text-gray-300 leading-relaxed mb-3">{response.response}</div>
                      <div className="flex flex-wrap gap-2">
                        {response.relatedAssets.map((asset) => (
                          <span
                            key={asset}
                            className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium"
                          >
                            {asset}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Trending Assets */}
            <motion.div variants={fadeIn}>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">Trending Assets</h2>
              </div>
              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trendingAssets.map((asset) => (
                  <AssetPredictionCard key={asset.id} asset={asset} onViewDetails={handleViewAsset} />
                ))}
              </motion.div>
            </motion.div>

            {/* All Assets */}
            <motion.div variants={fadeIn}>
              <h2 className="text-2xl font-bold text-white mb-4">All Market Predictions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockAIAssets.filter((asset) => !asset.trending).map((asset) => (
                  <AssetPredictionCard key={asset.id} asset={asset} onViewDetails={handleViewAsset} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Alerts Sidebar */}
          <motion.div variants={fadeIn} className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-[#0A0F1E] border border-[#1E293B] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Alerts</h3>
                  {unreadAlerts.length > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadAlerts.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onDismiss={handleDismissAlert} />
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">💡 AI Tips</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Ask specific questions for better predictions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Check risk scores before investing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Monitor sentiment changes daily</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Diversify based on AI recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
