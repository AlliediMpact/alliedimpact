/**
 * AI Market Intelligence Service
 * Phase 5: AI Prediction + Market Intelligence System
 * 
 * NOTE: This provides market insights and risk warnings only.
 * NOT financial advice - for informational purposes only.
 */

import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";

export type SentimentScore = "bullish" | "neutral" | "bearish";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface MarketSentiment {
  asset: string;
  sentiment: SentimentScore;
  confidence: number; // 0-100
  indicators: {
    priceChange24h: number;
    volumeChange24h: number;
    volatility: number;
    trendDirection: "up" | "down" | "sideways";
  };
  analysis: string;
  timestamp: Date;
}

export interface RiskWarning {
  type: "price-spread" | "order-behavior" | "counterparty-risk" | "market-volatility";
  level: RiskLevel;
  message: string;
  explanation: string;
  recommendation: string;
  affectedOrders?: string[];
  timestamp: Date;
}

export interface PriceAnalysis {
  asset: string;
  currentPrice: number;
  marketPrice: number;
  spread: number;
  spreadPercent: number;
  isAbnormal: boolean;
  shortTermTrend: "up" | "down" | "stable";
  volatility: number;
  timestamp: Date;
}

export class AIMarketService {
  /**
   * Analyze market sentiment for an asset
   */
  static async analyzeMarketSentiment(asset: string): Promise<MarketSentiment> {
    try {
      // Get recent completed orders for the asset
      const ordersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("asset", "==", asset)
        .where("status", "==", "completed")
        .orderBy("completedAt", "desc")
        .limit(100)
        .get();

      const orders = ordersSnapshot.docs.map((doc) => doc.data());

      if (orders.length === 0) {
        return {
          asset,
          sentiment: "neutral",
          confidence: 0,
          indicators: {
            priceChange24h: 0,
            volumeChange24h: 0,
            volatility: 0,
            trendDirection: "sideways",
          },
          analysis: "Insufficient market data for analysis",
          timestamp: new Date(),
        };
      }

      // Calculate 24h price change
      const now = Date.now();
      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
      
      const recentOrders = orders.filter(
        (o: any) => o.completedAt && o.completedAt.toMillis() > twentyFourHoursAgo
      );
      const oldOrders = orders.filter(
        (o: any) => o.completedAt && o.completedAt.toMillis() <= twentyFourHoursAgo
      );

      const currentAvgPrice =
        recentOrders.reduce((sum: number, o: any) => sum + o.price, 0) / recentOrders.length;
      const oldAvgPrice =
        oldOrders.length > 0
          ? oldOrders.reduce((sum: number, o: any) => sum + o.price, 0) / oldOrders.length
          : currentAvgPrice;

      const priceChange24h = ((currentAvgPrice - oldAvgPrice) / oldAvgPrice) * 100;

      // Calculate volume change
      const recentVolume = recentOrders.reduce((sum: number, o: any) => sum + o.fiatAmount, 0);
      const oldVolume = oldOrders.reduce((sum: number, o: any) => sum + o.fiatAmount, 0);
      const volumeChange24h =
        oldVolume > 0 ? ((recentVolume - oldVolume) / oldVolume) * 100 : 0;

      // Calculate volatility (standard deviation of prices)
      const prices = recentOrders.map((o: any) => o.price);
      const avgPrice = prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length;
      const variance =
        prices.reduce((sum: number, p: number) => sum + Math.pow(p - avgPrice, 2), 0) /
        prices.length;
      const volatility = Math.sqrt(variance);

      // Determine sentiment
      let sentiment: SentimentScore = "neutral";
      let confidence = 0;

      if (Math.abs(priceChange24h) < 2) {
        sentiment = "neutral";
        confidence = 60;
      } else if (priceChange24h > 5) {
        sentiment = "bullish";
        confidence = Math.min(80 + priceChange24h, 95);
      } else if (priceChange24h < -5) {
        sentiment = "bearish";
        confidence = Math.min(80 + Math.abs(priceChange24h), 95);
      } else {
        sentiment = priceChange24h > 0 ? "bullish" : "bearish";
        confidence = 50 + Math.abs(priceChange24h) * 5;
      }

      // Determine trend direction
      let trendDirection: "up" | "down" | "sideways" = "sideways";
      if (priceChange24h > 2) trendDirection = "up";
      else if (priceChange24h < -2) trendDirection = "down";

      // Generate analysis
      let analysis = `Market for ${asset} is showing ${sentiment} sentiment. `;
      if (Math.abs(priceChange24h) > 5) {
        analysis += `Significant ${priceChange24h > 0 ? "upward" : "downward"} movement of ${Math.abs(priceChange24h).toFixed(2)}% detected. `;
      }
      if (volatility > avgPrice * 0.05) {
        analysis += `High volatility observed - exercise caution. `;
      }
      if (volumeChange24h > 50) {
        analysis += `Trading volume increased significantly by ${volumeChange24h.toFixed(1)}%. `;
      }

      return {
        asset,
        sentiment,
        confidence: Math.round(confidence),
        indicators: {
          priceChange24h: parseFloat(priceChange24h.toFixed(2)),
          volumeChange24h: parseFloat(volumeChange24h.toFixed(2)),
          volatility: parseFloat((volatility / avgPrice * 100).toFixed(2)),
          trendDirection,
        },
        analysis,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Market sentiment analysis error:", error);
      throw new Error("Failed to analyze market sentiment");
    }
  }

  /**
   * Detect abnormal price spreads
   */
  static async detectAbnormalPrices(params: {
    asset: string;
    fiatCurrency: string;
  }): Promise<RiskWarning[]> {
    try {
      const warnings: RiskWarning[] = [];

      // Get active offers
      const offersSnapshot = await db
        .collection(COLLECTIONS.P2P_OFFERS)
        .where("asset", "==", params.asset)
        .where("fiatCurrency", "==", params.fiatCurrency)
        .where("status", "==", "active")
        .get();

      const offers = offersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (offers.length < 2) return warnings;

      // Calculate market average
      const prices = offers.map((o: any) => o.price);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

      // Find outliers (> 10% deviation)
      offers.forEach((offer: any) => {
        const deviation = Math.abs((offer.price - avgPrice) / avgPrice) * 100;

        if (deviation > 10) {
          warnings.push({
            type: "price-spread",
            level: deviation > 20 ? "high" : "medium",
            message: `Abnormal price detected for ${params.asset}`,
            explanation: `Price ${offer.price} deviates ${deviation.toFixed(1)}% from market average ${avgPrice.toFixed(2)}`,
            recommendation:
              "Verify price is correct. Consider using market-average pricing for better matching.",
            timestamp: new Date(),
          });
        }
      });

      return warnings;
    } catch (error) {
      console.error("Abnormal price detection error:", error);
      return [];
    }
  }

  /**
   * Detect suspicious order behavior
   */
  static async detectSuspiciousOrders(userId: string): Promise<RiskWarning[]> {
    try {
      const warnings: RiskWarning[] = [];

      // Get user's recent orders
      const ordersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("buyerId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

      const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Check for rapid order creation
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const recentOrders = orders.filter(
        (o: any) => o.createdAt && o.createdAt.toMillis() > fiveMinutesAgo
      );

      if (recentOrders.length > 5) {
        warnings.push({
          type: "order-behavior",
          level: "medium",
          message: "Rapid order creation detected",
          explanation: `${recentOrders.length} orders created in the last 5 minutes`,
          recommendation:
            "This pattern may indicate bot activity. Consider spacing out your orders.",
          affectedOrders: recentOrders.map((o: any) => o.id),
          timestamp: new Date(),
        });
      }

      // Check cancellation rate
      const cancelledOrders = orders.filter((o: any) => o.status === "cancelled");
      const cancellationRate = (cancelledOrders.length / orders.length) * 100;

      if (cancellationRate > 50 && orders.length > 5) {
        warnings.push({
          type: "order-behavior",
          level: "high",
          message: "High order cancellation rate",
          explanation: `${cancellationRate.toFixed(1)}% of your recent orders were cancelled`,
          recommendation:
            "Frequent cancellations negatively impact your reputation. Only create orders you intend to complete.",
          timestamp: new Date(),
        });
      }

      return warnings;
    } catch (error) {
      console.error("Suspicious order detection error:", error);
      return [];
    }
  }

  /**
   * Analyze counterparty risk
   */
  static async analyzeCounterpartyRisk(userId: string): Promise<{
    riskLevel: RiskLevel;
    score: number;
    factors: string[];
    recommendation: string;
  }> {
    try {
      let score = 100; // Start with perfect score
      const factors: string[] = [];

      // Get user's order history
      const buyOrdersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("buyerId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      const sellOrdersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("sellerId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      const allOrders = [
        ...buyOrdersSnapshot.docs.map((doc) => doc.data()),
        ...sellOrdersSnapshot.docs.map((doc) => doc.data()),
      ];

      if (allOrders.length === 0) {
        return {
          riskLevel: "medium",
          score: 50,
          factors: ["No trading history"],
          recommendation: "New user - start with small trades to build reputation",
        };
      }

      // Calculate completion rate
      const completedOrders = allOrders.filter((o: any) => o.status === "completed");
      const completionRate = (completedOrders.length / allOrders.length) * 100;

      if (completionRate < 80) {
        score -= 20;
        factors.push(`Low completion rate: ${completionRate.toFixed(1)}%`);
      }

      // Check for disputes
      const disputedOrders = allOrders.filter((o: any) => o.status === "disputed");
      if (disputedOrders.length > 0) {
        score -= disputedOrders.length * 10;
        factors.push(`${disputedOrders.length} disputed orders`);
      }

      // Check account age
      const accountAge = Date.now() - allOrders[allOrders.length - 1].createdAt.toMillis();
      const ageInDays = accountAge / (24 * 60 * 60 * 1000);

      if (ageInDays < 7) {
        score -= 15;
        factors.push("New account (< 7 days)");
      }

      // Determine risk level
      let riskLevel: RiskLevel;
      if (score >= 80) riskLevel = "low";
      else if (score >= 60) riskLevel = "medium";
      else if (score >= 40) riskLevel = "high";
      else riskLevel = "critical";

      // Generate recommendation
      let recommendation = "";
      if (riskLevel === "low") {
        recommendation = "Reliable trader with good history. Safe to proceed.";
      } else if (riskLevel === "medium") {
        recommendation = "Proceed with caution. Verify payment carefully.";
      } else {
        recommendation =
          "High risk counterparty. Consider trading with more established users or use smaller amounts.";
      }

      return {
        riskLevel,
        score: Math.max(0, score),
        factors,
        recommendation,
      };
    } catch (error) {
      console.error("Counterparty risk analysis error:", error);
      return {
        riskLevel: "medium",
        score: 50,
        factors: ["Unable to analyze - insufficient data"],
        recommendation: "Exercise standard caution",
      };
    }
  }

  /**
   * Get comprehensive risk assessment for an order
   */
  static async getOrderRiskAssessment(orderId: string): Promise<{
    overallRisk: RiskLevel;
    warnings: RiskWarning[];
    priceAnalysis: Partial<PriceAnalysis>;
    counterpartyRisk: any;
    recommendation: string;
  }> {
    try {
      // Get order details
      const orderDoc = await db.collection(COLLECTIONS.P2P_ORDERS).doc(orderId).get();

      if (!orderDoc.exists) {
        throw new Error("Order not found");
      }

      const order = orderDoc.data();
      const warnings: RiskWarning[] = [];

      // Analyze price
      const priceWarnings = await this.detectAbnormalPrices({
        asset: order!.asset,
        fiatCurrency: order!.fiatCurrency,
      });
      warnings.push(...priceWarnings);

      // Analyze counterparty
      const counterpartyRisk = await this.analyzeCounterpartyRisk(order!.sellerId);

      // Add counterparty warning if high risk
      if (counterpartyRisk.riskLevel === "high" || counterpartyRisk.riskLevel === "critical") {
        warnings.push({
          type: "counterparty-risk",
          level: counterpartyRisk.riskLevel,
          message: "High risk counterparty detected",
          explanation: counterpartyRisk.factors.join(", "),
          recommendation: counterpartyRisk.recommendation,
          timestamp: new Date(),
        });
      }

      // Determine overall risk
      const highestRiskLevel = warnings.reduce((highest, w) => {
        const levels: RiskLevel[] = ["low", "medium", "high", "critical"];
        return levels.indexOf(w.level) > levels.indexOf(highest) ? w.level : highest;
      }, "low" as RiskLevel);

      // Generate recommendation
      let recommendation = "";
      if (warnings.length === 0) {
        recommendation = "No significant risks detected. Proceed with standard caution.";
      } else if (highestRiskLevel === "medium") {
        recommendation =
          "Some risk factors present. Verify all details carefully before proceeding.";
      } else {
        recommendation =
          "Multiple risk factors detected. Consider alternative offers or proceed with extreme caution.";
      }

      return {
        overallRisk: highestRiskLevel,
        warnings,
        priceAnalysis: {},
        counterpartyRisk,
        recommendation,
      };
    } catch (error) {
      console.error("Order risk assessment error:", error);
      throw new Error("Failed to assess order risk");
    }
  }
}
