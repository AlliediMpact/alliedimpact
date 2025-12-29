'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  List,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Brain,
} from 'lucide-react';

interface UserStats {
  totalTrades: number;
  totalVolume: number;
  weeklyVolume: number;
  activeListings: number;
  completedTrades: number;
  successRate: number;
}

interface Prediction {
  asset: string;
  direction: 'up' | 'down' | 'neutral';
  confidence: number;
  predictedChange: number;
  indicators: {
    trend: 'bullish' | 'bearish' | 'neutral';
    volatility: 'high' | 'medium' | 'low';
    volume: 'high' | 'medium' | 'low';
    sentiment: 'positive' | 'negative' | 'neutral';
  };
}

export default function P2PCryptoDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    totalTrades: 0,
    totalVolume: 0,
    weeklyVolume: 0,
    activeListings: 0,
    completedTrades: 0,
    successRate: 0,
  });
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // TODO: Fetch real user stats
      // Mock data for now
      setStats({
        totalTrades: 24,
        totalVolume: 485000,
        weeklyVolume: 125000,
        activeListings: 3,
        completedTrades: 21,
        successRate: 95.8,
      });

      // Fetch AI predictions
      const res = await fetch('/api/p2p-crypto/predictions');
      const data = await res.json();
      
      if (data.success) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-600" />
            P2P Crypto Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your trading performance and market insights
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Total Volume"
            value={`R${stats.totalVolume.toLocaleString()}`}
            change="+12.5%"
            positive
            color="blue"
          />
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Weekly Volume"
            value={`R${stats.weeklyVolume.toLocaleString()}`}
            change="+8.3%"
            positive
            color="green"
          />
          <StatCard
            icon={<List className="w-6 h-6" />}
            label="Active Listings"
            value={stats.activeListings.toString()}
            subtitle={`${stats.completedTrades} completed`}
            color="purple"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Success Rate"
            value={`${stats.successRate}%`}
            change="+2.1%"
            positive
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Predictions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  AI Market Predictions
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Updated 5 min ago
                </span>
              </div>

              <div className="space-y-4">
                {predictions.map((prediction) => (
                  <PredictionCard key={prediction.asset} prediction={prediction} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/p2p-crypto/marketplace')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Browse Marketplace
                </button>
                
                <button
                  onClick={() => router.push('/p2p-crypto/create')}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Create Listing
                </button>
                
                <button
                  onClick={() => alert('My trades coming soon!')}
                  className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <List className="w-4 h-4" />
                  My Trades
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                <ActivityItem
                  type="completed"
                  asset="BTC"
                  amount="0.05"
                  value="R60,000"
                  time="2 hours ago"
                />
                <ActivityItem
                  type="created"
                  asset="ETH"
                  amount="1.2"
                  value="R45,000"
                  time="5 hours ago"
                />
                <ActivityItem
                  type="completed"
                  asset="USDT"
                  amount="3000"
                  value="R55,000"
                  time="1 day ago"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  change, 
  positive, 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  subtitle?: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        {change && (
          <span className={`text-sm font-semibold flex items-center gap-1 ${
            positive ? 'text-green-600' : 'text-red-600'
          }`}>
            {positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {change}
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}

function PredictionCard({ prediction }: { prediction: Prediction }) {
  const directionConfig = {
    up: { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: <TrendingUp className="w-5 h-5" /> },
    down: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: <TrendingDown className="w-5 h-5" /> },
    neutral: { color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900/20', icon: <Activity className="w-5 h-5" /> },
  };

  const config = directionConfig[prediction.direction];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {prediction.asset.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">{prediction.asset}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">24h Prediction</p>
          </div>
        </div>

        <div className={`flex items-center gap-2 ${config.color}`}>
          {config.icon}
          <span className="font-bold">{Math.abs(prediction.predictedChange).toFixed(2)}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-semibold`}>
            {prediction.indicators.trend}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {prediction.indicators.volatility} vol
          </span>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{prediction.confidence}%</p>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ 
  type, 
  asset, 
  amount, 
  value, 
  time 
}: { 
  type: 'completed' | 'created';
  asset: string;
  amount: string;
  value: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          type === 'completed' 
            ? 'bg-green-100 dark:bg-green-900/20 text-green-600' 
            : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
        }`}>
          {type === 'completed' ? <TrendingUp className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {amount} {asset}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
