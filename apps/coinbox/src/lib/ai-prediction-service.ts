/**
 * AI Price Prediction Service
 * 
 * Standalone module for crypto price predictions
 * Does NOT interact with:
 * - Existing trading systems
 * - Wallet functionality
 * - Membership tiers (except for feature access)
 * 
 * Provides simple up/down/neutral predictions with confidence scores
 */

import { P2PCryptoAsset } from './p2p-limits';

export interface PricePrediction {
  asset: P2PCryptoAsset;
  currentPrice: number;
  prediction: 'up' | 'down' | 'neutral';
  confidence: number; // 0-100
  predictedChange: number; // Percentage change expected
  timeframe: '1h' | '24h' | '7d';
  indicators: {
    trend: 'bullish' | 'bearish' | 'sideways';
    volatility: 'low' | 'medium' | 'high';
    volume: 'increasing' | 'decreasing' | 'stable';
    sentiment: 'positive' | 'negative' | 'neutral';
  };
  generatedAt: Date;
}

export interface PriceHistory {
  timestamp: Date;
  price: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number; // Relative Strength Index (0-100)
  macd: number; // Moving Average Convergence Divergence
  sma20: number; // 20-period Simple Moving Average
  sma50: number; // 50-period Simple Moving Average
  bollingerUpper: number;
  bollingerLower: number;
}

/**
 * AI Prediction Service
 * Simple ML-based predictions using technical analysis
 */
export class AIPredictionService {
  private static readonly API_BASE_URL = 'https://api.coingecko.com/api/v3';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static cache: Map<string, { data: any; timestamp: number }> = new Map();

  /**
   * Get price prediction for an asset
   * @param asset - Crypto asset (BTC, ETH, USDT, USDC)
   * @param timeframe - Prediction timeframe
   * @returns Price prediction with confidence score
   */
  static async getPrediction(
    asset: P2PCryptoAsset,
    timeframe: '1h' | '24h' | '7d' = '24h'
  ): Promise<PricePrediction> {
    try {
      // Get price history
      const history = await this.fetchPriceHistory(asset, timeframe);
      
      // Calculate technical indicators
      const indicators = this.calculateIndicators(history);
      
      // Generate prediction
      const prediction = this.generatePrediction(history, indicators);
      
      // Get current price
      const currentPrice = await this.getCurrentPrice(asset);

      return {
        asset,
        currentPrice,
        prediction: prediction.direction,
        confidence: prediction.confidence,
        predictedChange: prediction.expectedChange,
        timeframe,
        indicators: {
          trend: this.determineTrend(indicators),
          volatility: this.calculateVolatility(history),
          volume: this.analyzeVolume(history),
          sentiment: this.analyzeSentiment(indicators),
        },
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('AI Prediction error:', error);
      
      // Return neutral prediction on error
      return this.getNeutralPrediction(asset, timeframe);
    }
  }

  /**
   * Get predictions for all supported assets
   */
  static async getAllPredictions(
    timeframe: '1h' | '24h' | '7d' = '24h'
  ): Promise<PricePrediction[]> {
    const assets: P2PCryptoAsset[] = ['BTC', 'ETH', 'USDT', 'USDC'];
    const predictions = await Promise.all(
      assets.map((asset) => this.getPrediction(asset, timeframe))
    );
    return predictions;
  }

  /**
   * Fetch price history from external API
   */
  private static async fetchPriceHistory(
    asset: P2PCryptoAsset,
    timeframe: '1h' | '24h' | '7d'
  ): Promise<PriceHistory[]> {
    const cacheKey = `history-${asset}-${timeframe}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Map asset to CoinGecko ID
      const coinId = this.mapAssetToCoinId(asset);
      
      // Determine days parameter
      const days = timeframe === '1h' ? 1 : timeframe === '24h' ? 7 : 30;
      
      // Fetch from CoinGecko
      const response = await fetch(
        `${this.API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=zar&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }
      
      const data = await response.json();
      
      // Transform to PriceHistory format
      const history: PriceHistory[] = data.prices.map((point: [number, number]) => ({
        timestamp: new Date(point[0]),
        price: point[1],
        volume: 0, // Volume data would come from data.total_volumes
      }));
      
      // Cache the result
      this.cache.set(cacheKey, { data: history, timestamp: Date.now() });
      
      return history;
    } catch (error) {
      console.error('Fetch price history error:', error);
      
      // Return mock data on error
      return this.getMockPriceHistory(asset);
    }
  }

  /**
   * Get current price for an asset
   */
  private static async getCurrentPrice(asset: P2PCryptoAsset): Promise<number> {
    const cacheKey = `price-${asset}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const coinId = this.mapAssetToCoinId(asset);
      
      const response = await fetch(
        `${this.API_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=zar`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch current price');
      }
      
      const data = await response.json();
      const price = data[coinId]?.zar || 0;
      
      // Cache the result
      this.cache.set(cacheKey, { data: price, timestamp: Date.now() });
      
      return price;
    } catch (error) {
      console.error('Fetch current price error:', error);
      return this.getMockPrice(asset);
    }
  }

  /**
   * Calculate technical indicators
   */
  private static calculateIndicators(history: PriceHistory[]): TechnicalIndicators {
    const prices = history.map((h) => h.price);
    
    // RSI Calculation
    const rsi = this.calculateRSI(prices, 14);
    
    // MACD Calculation
    const macd = this.calculateMACD(prices);
    
    // Moving Averages
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    
    // Bollinger Bands
    const { upper, lower } = this.calculateBollingerBands(prices, 20, 2);
    
    return {
      rsi,
      macd,
      sma20,
      sma50,
      bollingerUpper: upper,
      bollingerLower: lower,
    };
  }

  /**
   * Generate prediction based on indicators
   */
  private static generatePrediction(
    history: PriceHistory[],
    indicators: TechnicalIndicators
  ): {
    direction: 'up' | 'down' | 'neutral';
    confidence: number;
    expectedChange: number;
  } {
    let bullishSignals = 0;
    let bearishSignals = 0;
    let totalSignals = 0;

    // RSI Analysis
    totalSignals++;
    if (indicators.rsi < 30) {
      bullishSignals++; // Oversold
    } else if (indicators.rsi > 70) {
      bearishSignals++; // Overbought
    }

    // MACD Analysis
    totalSignals++;
    if (indicators.macd > 0) {
      bullishSignals++;
    } else if (indicators.macd < 0) {
      bearishSignals++;
    }

    // Moving Average Crossover
    totalSignals++;
    if (indicators.sma20 > indicators.sma50) {
      bullishSignals++; // Golden cross
    } else if (indicators.sma20 < indicators.sma50) {
      bearishSignals++; // Death cross
    }

    // Price position relative to Bollinger Bands
    const currentPrice = history[history.length - 1].price;
    totalSignals++;
    if (currentPrice < indicators.bollingerLower) {
      bullishSignals++; // Price below lower band
    } else if (currentPrice > indicators.bollingerUpper) {
      bearishSignals++; // Price above upper band
    }

    // Determine direction and confidence
    const netSignals = bullishSignals - bearishSignals;
    let direction: 'up' | 'down' | 'neutral';
    let confidence: number;
    let expectedChange: number;

    if (netSignals > 0) {
      direction = 'up';
      confidence = (bullishSignals / totalSignals) * 100;
      expectedChange = Math.min(netSignals * 2, 10); // Cap at 10%
    } else if (netSignals < 0) {
      direction = 'down';
      confidence = (bearishSignals / totalSignals) * 100;
      expectedChange = Math.max(netSignals * 2, -10); // Cap at -10%
    } else {
      direction = 'neutral';
      confidence = 50;
      expectedChange = 0;
    }

    return { direction, confidence: Math.round(confidence), expectedChange };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  private static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // Neutral if not enough data

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return Math.round(rsi * 100) / 100;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  private static calculateMACD(prices: number[]): number {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    return ema12 - ema26;
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  private static calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  /**
   * Calculate SMA (Simple Moving Average)
   */
  private static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) period = prices.length;
    
    const slice = prices.slice(-period);
    const sum = slice.reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  /**
   * Calculate Bollinger Bands
   */
  private static calculateBollingerBands(
    prices: number[],
    period: number,
    stdDev: number
  ): { upper: number; lower: number } {
    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    
    const variance =
      slice.reduce((acc, price) => acc + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + stdDev * standardDeviation,
      lower: sma - stdDev * standardDeviation,
    };
  }

  /**
   * Determine overall trend
   */
  private static determineTrend(
    indicators: TechnicalIndicators
  ): 'bullish' | 'bearish' | 'sideways' {
    if (indicators.sma20 > indicators.sma50 && indicators.macd > 0) {
      return 'bullish';
    } else if (indicators.sma20 < indicators.sma50 && indicators.macd < 0) {
      return 'bearish';
    }
    return 'sideways';
  }

  /**
   * Calculate volatility
   */
  private static calculateVolatility(
    history: PriceHistory[]
  ): 'low' | 'medium' | 'high' {
    const prices = history.map((h) => h.price);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    
    const variance =
      prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100; // Coefficient of variation

    if (cv < 5) return 'low';
    if (cv < 15) return 'medium';
    return 'high';
  }

  /**
   * Analyze volume trend
   */
  private static analyzeVolume(
    history: PriceHistory[]
  ): 'increasing' | 'decreasing' | 'stable' {
    if (history.length < 2) return 'stable';
    
    const recentVolume = history.slice(-10);
    const olderVolume = history.slice(-20, -10);
    
    const recentAvg =
      recentVolume.reduce((sum, h) => sum + h.volume, 0) / recentVolume.length;
    const olderAvg =
      olderVolume.reduce((sum, h) => sum + h.volume, 0) / olderVolume.length;
    
    if (recentAvg > olderAvg * 1.2) return 'increasing';
    if (recentAvg < olderAvg * 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Analyze market sentiment
   */
  private static analyzeSentiment(
    indicators: TechnicalIndicators
  ): 'positive' | 'negative' | 'neutral' {
    let score = 0;
    
    if (indicators.rsi > 50) score++;
    if (indicators.macd > 0) score++;
    if (indicators.sma20 > indicators.sma50) score++;
    
    if (score >= 2) return 'positive';
    if (score <= 0) return 'negative';
    return 'neutral';
  }

  /**
   * Map asset to CoinGecko coin ID
   */
  private static mapAssetToCoinId(asset: P2PCryptoAsset): string {
    const mapping: Record<P2PCryptoAsset, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      USDT: 'tether',
      USDC: 'usd-coin',
    };
    return mapping[asset];
  }

  /**
   * Get neutral prediction (fallback)
   */
  private static getNeutralPrediction(
    asset: P2PCryptoAsset,
    timeframe: '1h' | '24h' | '7d'
  ): PricePrediction {
    return {
      asset,
      currentPrice: this.getMockPrice(asset),
      prediction: 'neutral',
      confidence: 50,
      predictedChange: 0,
      timeframe,
      indicators: {
        trend: 'sideways',
        volatility: 'medium',
        volume: 'stable',
        sentiment: 'neutral',
      },
      generatedAt: new Date(),
    };
  }

  /**
   * Get mock price (fallback)
   */
  private static getMockPrice(asset: P2PCryptoAsset): number {
    const mockPrices: Record<P2PCryptoAsset, number> = {
      BTC: 850000, // ~R850k
      ETH: 45000, // ~R45k
      USDT: 18, // ~R18 (pegged to USD)
      USDC: 18, // ~R18 (pegged to USD)
    };
    return mockPrices[asset];
  }

  /**
   * Get mock price history (fallback)
   */
  private static getMockPriceHistory(asset: P2PCryptoAsset): PriceHistory[] {
    const basePrice = this.getMockPrice(asset);
    const history: PriceHistory[] = [];
    
    for (let i = 0; i < 50; i++) {
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      history.push({
        timestamp: new Date(Date.now() - (50 - i) * 3600000), // Hourly
        price: basePrice * (1 + variation),
        volume: Math.random() * 1000000,
      });
    }
    
    return history;
  }
}
