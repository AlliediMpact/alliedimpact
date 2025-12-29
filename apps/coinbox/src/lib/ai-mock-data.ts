/**
 * Mock Data for AI Prediction System UI
 * Phase 1: UI Only - No backend integration
 */

export type PredictionType = 'bullish' | 'bearish' | 'neutral';
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';
export type TimeFrame = '1H' | '4H' | '1D' | '1W' | '1M';
export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface AIAsset {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  prediction: AssetPrediction;
  technicalIndicators: TechnicalIndicators;
  sentiment: SentimentAnalysis;
  riskScore: number;
  trending: boolean;
}

export interface AssetPrediction {
  type: PredictionType;
  confidence: number; // 0-100
  targetPrice: {
    '24h': number;
    '7d': number;
    '30d': number;
  };
  keyFactors: string[];
  aiExplanation: string;
  lastUpdated: Date;
}

export interface TechnicalIndicators {
  rsi: number; // 0-100
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    ma20: number;
    ma50: number;
    ma200: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: {
    current: number;
    average: number;
    change: number;
  };
}

export interface SentimentAnalysis {
  overall: SentimentType;
  score: number; // -100 to 100
  sources: {
    social: number;
    news: number;
    onchain: number;
  };
  trendingTopics: string[];
  recentNews: NewsItem[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sentiment: SentimentType;
  timestamp: Date;
  url: string;
}

export interface AIAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  asset?: string;
  riskLevel?: RiskLevel;
  timestamp: Date;
  isRead: boolean;
}

export interface AIPredictionResponse {
  id: string;
  query: string;
  response: string;
  confidence: number;
  relatedAssets: string[];
  timestamp: Date;
  sources: string[];
}

// Mock Assets Data
export const mockAIAssets: AIAsset[] = [
  {
    id: 'btc-1',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    currentPrice: 42500,
    priceChange24h: 2.5,
    volume24h: 28500000000,
    marketCap: 832000000000,
    prediction: {
      type: 'bullish',
      confidence: 78,
      targetPrice: {
        '24h': 43200,
        '7d': 45000,
        '30d': 48500,
      },
      keyFactors: [
        'Strong institutional buying pressure',
        'Decreasing exchange reserves',
        'Positive regulatory developments',
        'Technical breakout above resistance',
      ],
      aiExplanation: 'Based on historical patterns and current market conditions, Bitcoin shows strong bullish signals. The recent consolidation phase has established a solid support level, and we\'re seeing increased institutional accumulation. On-chain metrics indicate a supply squeeze, with fewer coins available on exchanges. Combined with positive sentiment from recent ETF approvals, the probability of upward movement is high.',
      lastUpdated: new Date(),
    },
    technicalIndicators: {
      rsi: 62,
      macd: {
        value: 450,
        signal: 380,
        histogram: 70,
      },
      movingAverages: {
        ma20: 41800,
        ma50: 40200,
        ma200: 37500,
      },
      bollingerBands: {
        upper: 44000,
        middle: 42000,
        lower: 40000,
      },
      volume: {
        current: 28500000000,
        average: 24000000000,
        change: 18.75,
      },
    },
    sentiment: {
      overall: 'positive',
      score: 72,
      sources: {
        social: 75,
        news: 68,
        onchain: 73,
      },
      trendingTopics: ['#Bitcoin ETF', 'Institutional Adoption', 'Halving 2024'],
      recentNews: [
        {
          id: 'news-1',
          title: 'Major Bank Announces Bitcoin Services',
          source: 'CoinDesk',
          sentiment: 'positive',
          timestamp: new Date(Date.now() - 3600000),
          url: '#',
        },
        {
          id: 'news-2',
          title: 'Bitcoin Whales Accumulate During Dip',
          source: 'CryptoSlate',
          sentiment: 'positive',
          timestamp: new Date(Date.now() - 7200000),
          url: '#',
        },
      ],
    },
    riskScore: 35,
    trending: true,
  },
  {
    id: 'eth-1',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    currentPrice: 2250,
    priceChange24h: 3.2,
    volume24h: 15200000000,
    marketCap: 270000000000,
    prediction: {
      type: 'bullish',
      confidence: 82,
      targetPrice: {
        '24h': 2320,
        '7d': 2450,
        '30d': 2650,
      },
      keyFactors: [
        'Ethereum 2.0 staking growth',
        'DeFi ecosystem expansion',
        'Layer 2 adoption accelerating',
        'Deflationary tokenomics post-merge',
      ],
      aiExplanation: 'Ethereum demonstrates exceptional fundamentals with the successful transition to Proof of Stake. The deflationary mechanism is working as intended, with net negative issuance in recent months. Layer 2 solutions are driving massive adoption without congesting the mainnet. The upcoming Dencun upgrade will further enhance scalability, making this a compelling long-term hold.',
      lastUpdated: new Date(),
    },
    technicalIndicators: {
      rsi: 65,
      macd: {
        value: 35,
        signal: 28,
        histogram: 7,
      },
      movingAverages: {
        ma20: 2180,
        ma50: 2050,
        ma200: 1850,
      },
      bollingerBands: {
        upper: 2400,
        middle: 2200,
        lower: 2000,
      },
      volume: {
        current: 15200000000,
        average: 13500000000,
        change: 12.6,
      },
    },
    sentiment: {
      overall: 'positive',
      score: 80,
      sources: {
        social: 82,
        news: 78,
        onchain: 81,
      },
      trendingTopics: ['Layer 2', 'DeFi Summer', 'ETH Staking'],
      recentNews: [
        {
          id: 'news-3',
          title: 'Ethereum Staking Reaches New Milestone',
          source: 'The Block',
          sentiment: 'positive',
          timestamp: new Date(Date.now() - 1800000),
          url: '#',
        },
      ],
    },
    riskScore: 30,
    trending: true,
  },
  {
    id: 'sol-1',
    symbol: 'SOL',
    name: 'Solana',
    icon: '◎',
    currentPrice: 98.5,
    priceChange24h: -1.8,
    volume24h: 2400000000,
    marketCap: 42000000000,
    prediction: {
      type: 'neutral',
      confidence: 65,
      targetPrice: {
        '24h': 97,
        '7d': 102,
        '30d': 105,
      },
      keyFactors: [
        'Network stability concerns',
        'Growing NFT ecosystem',
        'Increased validator participation',
        'Competition from other L1s',
      ],
      aiExplanation: 'Solana is in a consolidation phase. While the network has shown improved stability and the ecosystem continues to grow, there are competing narratives. The recent uptick in NFT activity is positive, but concerns about centralization persist. We recommend a wait-and-see approach until clearer directional momentum emerges.',
      lastUpdated: new Date(),
    },
    technicalIndicators: {
      rsi: 48,
      macd: {
        value: -2,
        signal: -1,
        histogram: -1,
      },
      movingAverages: {
        ma20: 99.5,
        ma50: 95,
        ma200: 85,
      },
      bollingerBands: {
        upper: 105,
        middle: 98,
        lower: 91,
      },
      volume: {
        current: 2400000000,
        average: 2600000000,
        change: -7.7,
      },
    },
    sentiment: {
      overall: 'neutral',
      score: 15,
      sources: {
        social: 20,
        news: 10,
        onchain: 15,
      },
      trendingTopics: ['Solana NFTs', 'Network Uptime'],
      recentNews: [],
    },
    riskScore: 55,
    trending: false,
  },
];

// Mock AI Predictions/Responses
export const mockAIPredictions: AIPredictionResponse[] = [
  {
    id: 'pred-1',
    query: 'Should I buy Bitcoin right now?',
    response: 'Based on current market analysis, Bitcoin presents a favorable risk-reward ratio. The asset is showing strong bullish momentum with a confidence level of 78%. Key indicators suggest upward movement, with technical analysis showing support at $41,000 and resistance at $44,000. Consider dollar-cost averaging for safer entry. Current risk level is moderate.',
    confidence: 78,
    relatedAssets: ['BTC', 'ETH'],
    timestamp: new Date(Date.now() - 300000),
    sources: ['Technical Analysis', 'On-Chain Metrics', 'Sentiment Data'],
  },
  {
    id: 'pred-2',
    query: 'What are the best long-term crypto investments?',
    response: 'For long-term holdings, I recommend a diversified portfolio focusing on: 1) Bitcoin (40%) - Digital gold narrative remains strong. 2) Ethereum (35%) - Leading smart contract platform with deflationary tokenomics. 3) Layer 2 solutions (15%) - High growth potential. 4) Stablecoins (10%) - For liquidity and opportunities. Always DYOR and invest only what you can afford to lose.',
    confidence: 85,
    relatedAssets: ['BTC', 'ETH', 'MATIC', 'ARB'],
    timestamp: new Date(Date.now() - 1800000),
    sources: ['Historical Data', 'Fundamental Analysis', 'Expert Insights'],
  },
];

// Mock AI Alerts
export const mockAIAlerts: AIAlert[] = [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'High Volatility Detected',
    message: 'Bitcoin is experiencing increased volatility. Consider adjusting position sizes.',
    asset: 'BTC',
    riskLevel: 'medium',
    timestamp: new Date(Date.now() - 600000),
    isRead: false,
  },
  {
    id: 'alert-2',
    type: 'info',
    title: 'Whale Activity Alert',
    message: 'Large ETH transfer detected from exchange to cold wallet. Possible accumulation signal.',
    asset: 'ETH',
    riskLevel: 'low',
    timestamp: new Date(Date.now() - 1800000),
    isRead: false,
  },
  {
    id: 'alert-3',
    type: 'success',
    title: 'Prediction Accuracy Update',
    message: 'Your recent BTC prediction was 92% accurate. Target price reached!',
    asset: 'BTC',
    timestamp: new Date(Date.now() - 3600000),
    isRead: true,
  },
  {
    id: 'alert-4',
    type: 'danger',
    title: 'High Risk Warning',
    message: 'Unusual trading patterns detected in SOL. Exercise caution.',
    asset: 'SOL',
    riskLevel: 'high',
    timestamp: new Date(Date.now() - 7200000),
    isRead: false,
  },
];

// Risk Level Colors
export const riskLevelColors: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
  extreme: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
};

// Prediction Type Colors
export const predictionColors: Record<PredictionType, { bg: string; text: string; icon: string }> = {
  bullish: { bg: 'bg-green-500/10', text: 'text-green-500', icon: '📈' },
  bearish: { bg: 'bg-red-500/10', text: 'text-red-500', icon: '📉' },
  neutral: { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: '➡️' },
};
