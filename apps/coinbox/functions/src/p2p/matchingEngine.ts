import { db } from "../config/firebase";
import { COLLECTIONS, ERROR_CODES } from "../config/constants";
import { P2POffer, P2POrder, OfferType } from "../types";
import { NotificationService } from "../utils/notifications";

/**
 * Order Matching Engine
 * Phase 3: Intelligent order matching for P2P trades
 * 
 * Matching Logic:
 * 1. Match BUY orders with SELL offers
 * 2. Match SELL orders with BUY offers
 * 3. Sort by price priority (best price first)
 * 4. Apply quantity matching
 * 5. Store matched pairs
 */

export interface MatchingCriteria {
  orderType: OfferType;
  asset: string;
  fiatCurrency: string;
  amount: number;
  minPrice?: number;
  maxPrice?: number;
  paymentMethod?: string;
  userId: string;
}

export interface MatchResult {
  matched: boolean;
  offers: P2POffer[];
  bestMatch?: P2POffer;
  reason?: string;
}

export class MatchingEngine {
  /**
   * Find matching offers for a given criteria
   * Implements price priority and quantity matching
   */
  static async findMatches(criteria: MatchingCriteria): Promise<MatchResult> {
    try {
      // Determine opposite offer type
      const targetOfferType: OfferType = criteria.orderType === "buy" ? "sell" : "buy";

      // Build query
      let query = db
        .collection(COLLECTIONS.P2P_OFFERS)
        .where("status", "==", "active")
        .where("offerType", "==", targetOfferType)
        .where("asset", "==", criteria.asset)
        .where("fiatCurrency", "==", criteria.fiatCurrency);

      // Exclude user's own offers
      query = query.where("userId", "!=", criteria.userId);

      // Execute query
      const snapshot = await query.get();

      if (snapshot.empty) {
        return {
          matched: false,
          offers: [],
          reason: "No matching offers found",
        };
      }

      // Filter and sort offers
      const offers = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as P2POffer))
        .filter((offer) => {
          // Check if amount is within limits
          const amountCheck = 
            criteria.amount >= offer.minLimit && 
            criteria.amount <= offer.maxLimit &&
            criteria.amount <= offer.availableAmount;

          if (!amountCheck) return false;

          // Check price range if specified
          if (criteria.minPrice && offer.price < criteria.minPrice) return false;
          if (criteria.maxPrice && offer.price > criteria.maxPrice) return false;

          // Check payment method if specified
          if (
            criteria.paymentMethod &&
            !offer.paymentMethods.includes(criteria.paymentMethod as any)
          ) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          // Sort by price priority
          // For BUY orders: prefer lowest SELL prices
          // For SELL orders: prefer highest BUY prices
          if (criteria.orderType === "buy") {
            return a.price - b.price; // Ascending
          } else {
            return b.price - a.price; // Descending
          }
        });

      if (offers.length === 0) {
        return {
          matched: false,
          offers: [],
          reason: "No offers match your criteria",
        };
      }

      return {
        matched: true,
        offers: offers.slice(0, 10), // Return top 10 matches
        bestMatch: offers[0],
      };
    } catch (error) {
      console.error("Error finding matches:", error);
      throw new Error("Failed to find matching offers");
    }
  }

  /**
   * Auto-match order with best available offer
   * Creates order immediately if match is found
   */
  static async autoMatchOrder(params: {
    userId: string;
    orderType: OfferType;
    asset: string;
    fiatCurrency: string;
    amount: number;
    paymentMethod?: string;
  }): Promise<{ matched: boolean; orderId?: string; offer?: P2POffer }> {
    try {
      // Find matches
      const matchResult = await this.findMatches({
        orderType: params.orderType,
        asset: params.asset,
        fiatCurrency: params.fiatCurrency,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        userId: params.userId,
      });

      if (!matchResult.matched || !matchResult.bestMatch) {
        return { matched: false };
      }

      const offer = matchResult.bestMatch;

      // Create order with matched offer
      const { OrderService } = await import("./orderService");

      const orderId = await OrderService.createOrder({
        buyerId: params.orderType === "buy" ? params.userId : offer.userId,
        offerId: offer.id,
        fiatAmount: params.amount,
        paymentMethod: params.paymentMethod || offer.paymentMethods[0],
      });

      // Send match notifications
      await this.notifyMatch(params.userId, offer.userId, orderId, offer);

      return {
        matched: true,
        orderId,
        offer,
      };
    } catch (error) {
      console.error("Error auto-matching order:", error);
      throw error;
    }
  }

  /**
   * Get market depth for an asset pair
   * Shows aggregated buy/sell liquidity
   */
  static async getMarketDepth(params: {
    asset: string;
    fiatCurrency: string;
  }): Promise<{
    buyOrders: Array<{ price: number; amount: number; count: number }>;
    sellOrders: Array<{ price: number; amount: number; count: number }>;
  }> {
    try {
      // Get all active offers
      const snapshot = await db
        .collection(COLLECTIONS.P2P_OFFERS)
        .where("status", "==", "active")
        .where("asset", "==", params.asset)
        .where("fiatCurrency", "==", params.fiatCurrency)
        .get();

      const buyMap = new Map<number, { amount: number; count: number }>();
      const sellMap = new Map<number, { amount: number; count: number }>();

      snapshot.docs.forEach((doc) => {
        const offer = doc.data() as P2POffer;
        const map = offer.offerType === "buy" ? buyMap : sellMap;

        const existing = map.get(offer.price) || { amount: 0, count: 0 };
        map.set(offer.price, {
          amount: existing.amount + offer.availableAmount,
          count: existing.count + 1,
        });
      });

      // Convert to arrays and sort
      const buyOrders = Array.from(buyMap.entries())
        .map(([price, data]) => ({ price, ...data }))
        .sort((a, b) => b.price - a.price); // Highest buy prices first

      const sellOrders = Array.from(sellMap.entries())
        .map(([price, data]) => ({ price, ...data }))
        .sort((a, b) => a.price - b.price); // Lowest sell prices first

      return { buyOrders, sellOrders };
    } catch (error) {
      console.error("Error getting market depth:", error);
      throw new Error("Failed to get market depth");
    }
  }

  /**
   * Calculate optimal price for a new offer
   * Based on current market conditions
   */
  static async suggestPrice(params: {
    offerType: OfferType;
    asset: string;
    fiatCurrency: string;
  }): Promise<{
    suggestedPrice: number;
    marketPrice: number;
    spread: number;
    confidence: "high" | "medium" | "low";
  }> {
    try {
      // Get recent successful orders
      const ordersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("asset", "==", params.asset)
        .where("fiatCurrency", "==", params.fiatCurrency)
        .where("status", "==", "completed")
        .orderBy("completedAt", "desc")
        .limit(50)
        .get();

      if (ordersSnapshot.empty) {
        // No market data, use external API or default
        return {
          suggestedPrice: 0,
          marketPrice: 0,
          spread: 0,
          confidence: "low",
        };
      }

      // Calculate average price from recent trades
      const prices = ordersSnapshot.docs.map((doc) => doc.data().price);
      const marketPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

      // Get current best offers
      const depth = await this.getMarketDepth(params);

      // Calculate spread
      const bestBuy = depth.buyOrders[0]?.price || marketPrice;
      const bestSell = depth.sellOrders[0]?.price || marketPrice;
      const spread = bestSell - bestBuy;

      // Suggest competitive price
      let suggestedPrice: number;
      if (params.offerType === "buy") {
        // Slightly above best buy to be competitive
        suggestedPrice = bestBuy > 0 ? bestBuy * 1.001 : marketPrice * 0.998;
      } else {
        // Slightly below best sell to be competitive
        suggestedPrice = bestSell > 0 ? bestSell * 0.999 : marketPrice * 1.002;
      }

      // Determine confidence based on data quality
      const confidence =
        prices.length > 30 ? "high" : prices.length > 10 ? "medium" : "low";

      return {
        suggestedPrice,
        marketPrice,
        spread,
        confidence,
      };
    } catch (error) {
      console.error("Error suggesting price:", error);
      throw new Error("Failed to calculate price suggestion");
    }
  }

  /**
   * Send notifications for matched orders
   */
  private static async notifyMatch(
    userId1: string,
    userId2: string,
    orderId: string,
    offer: P2POffer
  ): Promise<void> {
    try {
      // Notify buyer
      await NotificationService.sendNotification({
        userId: userId1,
        title: "Order Matched! 🎉",
        body: `Your order has been matched with a ${offer.offerType} offer for ${offer.asset}`,
        data: {
          type: "order-matched",
          orderId,
          offerId: offer.id,
        },
      });

      // Notify seller
      await NotificationService.sendNotification({
        userId: userId2,
        title: "New Order! 💰",
        body: `You have a new order for your ${offer.offerType} offer`,
        data: {
          type: "order-matched",
          orderId,
          offerId: offer.id,
        },
      });
    } catch (error) {
      console.error("Error sending match notifications:", error);
      // Don't throw, notifications are not critical
    }
  }

  /**
   * Get matching statistics for analytics
   */
  static async getMatchingStats(params: {
    asset: string;
    fiatCurrency: string;
    timeframe?: "1h" | "24h" | "7d" | "30d";
  }): Promise<{
    totalMatches: number;
    avgMatchTime: number;
    successRate: number;
    volumeTraded: number;
  }> {
    try {
      const timeframe = params.timeframe || "24h";
      const hours = timeframe === "1h" ? 1 : timeframe === "24h" ? 24 : timeframe === "7d" ? 168 : 720;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);

      const snapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("asset", "==", params.asset)
        .where("fiatCurrency", "==", params.fiatCurrency)
        .where("createdAt", ">=", since)
        .get();

      const orders = snapshot.docs.map((doc) => doc.data() as P2POrder);

      const completedOrders = orders.filter((o) => o.status === "completed");
      const totalMatches = orders.length;
      const successRate = totalMatches > 0 ? (completedOrders.length / totalMatches) * 100 : 0;

      // Calculate average match time (time to complete)
      let totalTime = 0;
      completedOrders.forEach((order) => {
        if (order.completedAt && order.createdAt) {
          const time = order.completedAt.getTime() - order.createdAt.getTime();
          totalTime += time;
        }
      });
      const avgMatchTime = completedOrders.length > 0 ? totalTime / completedOrders.length : 0;

      // Calculate volume traded
      const volumeTraded = completedOrders.reduce((sum, order) => sum + order.fiatAmount, 0);

      return {
        totalMatches,
        avgMatchTime: Math.round(avgMatchTime / 1000), // Convert to seconds
        successRate: Math.round(successRate * 100) / 100,
        volumeTraded,
      };
    } catch (error) {
      console.error("Error getting matching stats:", error);
      throw new Error("Failed to get matching statistics");
    }
  }
}
