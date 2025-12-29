import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";

/**
 * Advanced AI Service
 * Phase 8: User Behavior Analysis & Predictive Models
 */

export interface TradingProfile {
  userId: string;
  preferredAssets: Array<{ asset: string; frequency: number }>;
  averageOrderSize: number;
  preferredPaymentMethods: string[];
  tradingFrequency: number; // orders per week
  peakTradingHours: number[];
  riskTolerance: "conservative" | "moderate" | "aggressive";
  successRate: number;
  averageCompletionTime: number; // minutes
  typicalCounterparties: string[];
  lastAnalyzedAt: Date;
}

export interface PersonalizedRisk {
  userId: string;
  overallScore: number; // 0-100
  factors: {
    completionRate: number;
    averageResponseTime: number;
    disputeRate: number;
    accountAge: number;
    verificationLevel: number;
    tradingVolume: number;
  };
  recommendations: string[];
  warnings: string[];
  updatedAt: Date;
}

export interface MarketAnomaly {
  type: "price-manipulation" | "wash-trading" | "coordinated-orders" | "liquidity-shock";
  severity: "low" | "medium" | "high" | "critical";
  asset: string;
  description: string;
  evidence: any[];
  detectedAt: Date;
  affectedUsers?: string[];
}

export class AdvancedAIService {
  /**
   * Build comprehensive trading profile for user
   */
  static async buildTradingProfile(userId: string): Promise<TradingProfile> {
    try {
      // Get user's order history
      const buyOrders = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("buyerId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

      const sellOrders = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("sellerId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

      const allOrders = [...buyOrders.docs, ...sellOrders.docs].map((doc) => doc.data());

      if (allOrders.length === 0) {
        return {
          userId,
          preferredAssets: [],
          averageOrderSize: 0,
          preferredPaymentMethods: [],
          tradingFrequency: 0,
          peakTradingHours: [],
          riskTolerance: "conservative",
          successRate: 0,
          averageCompletionTime: 0,
          typicalCounterparties: [],
          lastAnalyzedAt: new Date(),
        };
      }

      // Analyze preferred assets
      const assetCounts: Record<string, number> = {};
      allOrders.forEach((order: any) => {
        assetCounts[order.asset] = (assetCounts[order.asset] || 0) + 1;
      });

      const preferredAssets = Object.entries(assetCounts)
        .map(([asset, frequency]) => ({ asset, frequency }))
        .sort((a, b) => b.frequency - a.frequency);

      // Calculate average order size
      const totalValue = allOrders.reduce((sum: number, order: any) => sum + order.fiatAmount, 0);
      const averageOrderSize = totalValue / allOrders.length;

      // Analyze payment methods
      const paymentCounts: Record<string, number> = {};
      allOrders.forEach((order: any) => {
        paymentCounts[order.paymentMethod] = (paymentCounts[order.paymentMethod] || 0) + 1;
      });

      const preferredPaymentMethods = Object.entries(paymentCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([method]) => method);

      // Calculate trading frequency
      const oldestOrder = allOrders[allOrders.length - 1];
      const daysSinceFirst = oldestOrder.createdAt
        ? (Date.now() - oldestOrder.createdAt.toMillis()) / (1000 * 60 * 60 * 24)
        : 1;
      const tradingFrequency = (allOrders.length / daysSinceFirst) * 7; // per week

      // Analyze peak trading hours
      const hourCounts: Record<number, number> = {};
      allOrders.forEach((order: any) => {
        if (order.createdAt) {
          const hour = new Date(order.createdAt.toMillis()).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });

      const peakTradingHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      // Determine risk tolerance based on order sizes
      const riskTolerance =
        averageOrderSize > 500000
          ? "aggressive"
          : averageOrderSize > 100000
          ? "moderate"
          : "conservative";

      // Calculate success rate
      const completedOrders = allOrders.filter((o: any) => o.status === "completed");
      const successRate = (completedOrders.length / allOrders.length) * 100;

      // Calculate average completion time
      let totalTime = 0;
      let countWithTime = 0;
      completedOrders.forEach((order: any) => {
        if (order.completedAt && order.createdAt) {
          totalTime += order.completedAt.toMillis() - order.createdAt.toMillis();
          countWithTime++;
        }
      });
      const averageCompletionTime =
        countWithTime > 0 ? totalTime / countWithTime / (1000 * 60) : 0;

      // Find typical counterparties
      const counterpartyCounts: Record<string, number> = {};
      allOrders.forEach((order: any) => {
        const counterparty =
          order.buyerId === userId ? order.sellerId : order.buyerId;
        counterpartyCounts[counterparty] = (counterpartyCounts[counterparty] || 0) + 1;
      });

      const typicalCounterparties = Object.entries(counterpartyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      return {
        userId,
        preferredAssets,
        averageOrderSize,
        preferredPaymentMethods,
        tradingFrequency,
        peakTradingHours,
        riskTolerance,
        successRate,
        averageCompletionTime,
        typicalCounterparties,
        lastAnalyzedAt: new Date(),
      };
    } catch (error) {
      console.error("Build trading profile error:", error);
      throw new Error("Failed to build trading profile");
    }
  }

  /**
   * Calculate personalized risk score
   */
  static async calculatePersonalizedRisk(userId: string): Promise<PersonalizedRisk> {
    try {
      let score = 100;
      const recommendations: string[] = [];
      const warnings: string[] = [];

      // Get KYC profile
      const kycDoc = await db.collection(COLLECTIONS.KYC_PROFILES).doc(userId).get();
      const kyc = kycDoc.exists ? kycDoc.data() : null;

      // Get trading history
      const ordersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("buyerId", "==", userId)
        .limit(50)
        .get();

      const ordersSnapshot2 = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("sellerId", "==", userId)
        .limit(50)
        .get();

      const allOrders = [...ordersSnapshot.docs, ...ordersSnapshot2.docs].map((doc) =>
        doc.data()
      );

      // Factor 1: Completion Rate
      const completedOrders = allOrders.filter((o: any) => o.status === "completed");
      const completionRate =
        allOrders.length > 0 ? (completedOrders.length / allOrders.length) * 100 : 100;

      if (completionRate < 80) {
        score -= 15;
        warnings.push(`Low completion rate: ${completionRate.toFixed(1)}%`);
        recommendations.push("Complete more orders to improve your rating");
      }

      // Factor 2: Average Response Time (estimate from order completion times)
      let totalResponseTime = 0;
      let countWithTime = 0;
      allOrders.forEach((order: any) => {
        if (order.paymentProofSubmittedAt && order.createdAt) {
          totalResponseTime +=
            order.paymentProofSubmittedAt.toMillis() - order.createdAt.toMillis();
          countWithTime++;
        }
      });
      const averageResponseTime =
        countWithTime > 0 ? totalResponseTime / countWithTime / (1000 * 60) : 15;

      if (averageResponseTime > 30) {
        score -= 10;
        recommendations.push("Respond faster to orders to improve reliability");
      }

      // Factor 3: Dispute Rate
      const disputedOrders = allOrders.filter((o: any) => o.status === "disputed");
      const disputeRate =
        allOrders.length > 0 ? (disputedOrders.length / allOrders.length) * 100 : 0;

      if (disputeRate > 5) {
        score -= 20;
        warnings.push(`High dispute rate: ${disputeRate.toFixed(1)}%`);
        recommendations.push("Avoid disputes by communicating clearly with counterparties");
      }

      // Factor 4: Account Age
      const accountAge = kyc?.createdAt
        ? (Date.now() - kyc.createdAt.toMillis()) / (1000 * 60 * 60 * 24)
        : 0;

      if (accountAge < 30) {
        score -= 10;
        recommendations.push("New account - build trust by completing more orders");
      }

      // Factor 5: Verification Level
      const verificationLevel = kyc?.level || 0;

      if (verificationLevel === 0) {
        score -= 25;
        warnings.push("Account not verified");
        recommendations.push("Complete KYC verification to improve trust score");
      } else if (verificationLevel === 1) {
        score -= 10;
      }

      // Factor 6: Trading Volume
      const totalVolume = allOrders.reduce(
        (sum: number, order: any) => sum + (order.fiatAmount || 0),
        0
      );

      if (totalVolume < 50000) {
        recommendations.push("Increase trading volume to build reputation");
      }

      return {
        userId,
        overallScore: Math.max(0, Math.min(100, score)),
        factors: {
          completionRate,
          averageResponseTime,
          disputeRate,
          accountAge,
          verificationLevel,
          tradingVolume: totalVolume,
        },
        recommendations,
        warnings,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Calculate personalized risk error:", error);
      throw new Error("Failed to calculate risk score");
    }
  }

  /**
   * Detect price manipulation patterns
   */
  static async detectPriceManipulation(asset: string): Promise<MarketAnomaly[]> {
    try {
      const anomalies: MarketAnomaly[] = [];

      // Get recent offers
      const snapshot = await db
        .collection(COLLECTIONS.P2P_OFFERS)
        .where("asset", "==", asset)
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();

      const offers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (offers.length < 10) return anomalies;

      // Calculate price statistics
      const prices = offers.map((o: any) => o.price);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const stdDev = Math.sqrt(
        prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
      );

      // Detect unusual price clustering
      const priceBuckets: Record<number, number> = {};
      offers.forEach((offer: any) => {
        const bucket = Math.floor(offer.price / 100) * 100;
        priceBuckets[bucket] = (priceBuckets[bucket] || 0) + 1;
      });

      // Check for suspicious clustering (>30% of offers at same price)
      Object.entries(priceBuckets).forEach(([price, count]) => {
        if (count > offers.length * 0.3) {
          anomalies.push({
            type: "price-manipulation",
            severity: "medium",
            asset,
            description: `Unusual price clustering detected: ${count} offers near ${price}`,
            evidence: [{ pricePoint: price, offerCount: count }],
            detectedAt: new Date(),
          });
        }
      });

      // Detect extreme outliers (>3 standard deviations)
      offers.forEach((offer: any) => {
        if (Math.abs(offer.price - avgPrice) > 3 * stdDev) {
          anomalies.push({
            type: "price-manipulation",
            severity: "high",
            asset,
            description: `Extreme price outlier detected: ${offer.price} (avg: ${avgPrice.toFixed(2)})`,
            evidence: [{ offerId: offer.id, price: offer.price, deviation: Math.abs(offer.price - avgPrice) }],
            detectedAt: new Date(),
          });
        }
      });

      return anomalies;
    } catch (error) {
      console.error("Detect price manipulation error:", error);
      return [];
    }
  }

  /**
   * Detect wash trading patterns
   */
  static async detectWashTrading(userId: string): Promise<boolean> {
    try {
      // Get user's orders
      const ordersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("buyerId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      const orders = ordersSnapshot.docs.map((doc) => doc.data());

      // Check for circular trading patterns
      const counterparties: Record<string, number> = {};
      orders.forEach((order: any) => {
        counterparties[order.sellerId] = (counterparties[order.sellerId] || 0) + 1;
      });

      // Flag if >50% of trades are with same counterparty
      const maxCount = Math.max(...Object.values(counterparties));
      if (maxCount > orders.length * 0.5 && orders.length > 10) {
        console.log(`[ALERT] Potential wash trading detected for user ${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Detect wash trading error:", error);
      return false;
    }
  }

  /**
   * Predict order completion likelihood
   */
  static async predictOrderCompletion(orderId: string): Promise<{
    likelihood: number;
    factors: string[];
    confidence: number;
  }> {
    try {
      const orderDoc = await db.collection(COLLECTIONS.P2P_ORDERS).doc(orderId).get();

      if (!orderDoc.exists) {
        throw new Error("Order not found");
      }

      const order = orderDoc.data();
      let likelihood = 70; // Base 70%
      const factors: string[] = [];

      // Get buyer's history
      const buyerOrders = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("buyerId", "==", order!.buyerId)
        .limit(20)
        .get();

      const buyerCompletionRate =
        buyerOrders.size > 0
          ? (buyerOrders.docs.filter((d) => d.data().status === "completed").length /
              buyerOrders.size) *
            100
          : 70;

      // Get seller's history
      const sellerOrders = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("sellerId", "==", order!.sellerId)
        .limit(20)
        .get();

      const sellerCompletionRate =
        sellerOrders.size > 0
          ? (sellerOrders.docs.filter((d) => d.data().status === "completed").length /
              sellerOrders.size) *
            100
          : 70;

      // Adjust based on historical completion rates
      const avgCompletionRate = (buyerCompletionRate + sellerCompletionRate) / 2;
      likelihood = (likelihood + avgCompletionRate) / 2;

      if (buyerCompletionRate > 90) {
        factors.push("Reliable buyer history");
      } else if (buyerCompletionRate < 70) {
        factors.push("Buyer has low completion rate");
        likelihood -= 10;
      }

      if (sellerCompletionRate > 90) {
        factors.push("Reliable seller history");
      } else if (sellerCompletionRate < 70) {
        factors.push("Seller has low completion rate");
        likelihood -= 10;
      }

      // Check payment window
      if (order!.paymentTimeWindow < 10) {
        factors.push("Short payment window may cause issues");
        likelihood -= 5;
      }

      // Check order size
      if (order!.fiatAmount > 500000) {
        factors.push("Large order amount");
        likelihood -= 5;
      }

      const confidence = buyerOrders.size + sellerOrders.size > 20 ? 85 : 60;

      return {
        likelihood: Math.max(0, Math.min(100, likelihood)),
        factors,
        confidence,
      };
    } catch (error) {
      console.error("Predict order completion error:", error);
      return {
        likelihood: 50,
        factors: ["Insufficient data for prediction"],
        confidence: 30,
      };
    }
  }
}
