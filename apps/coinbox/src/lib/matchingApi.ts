/**
 * Matching Engine Client API
 * Phase 3: Order Matching System
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";

export interface MatchingCriteria {
  orderType: "buy" | "sell";
  asset: string;
  fiatCurrency: string;
  amount: number;
  minPrice?: number;
  maxPrice?: number;
  paymentMethod?: string;
}

export interface MatchResult {
  matched: boolean;
  offers: any[];
  bestMatch?: any;
  reason?: string;
}

export interface MarketDepth {
  buyOrders: Array<{ price: number; amount: number; count: number }>;
  sellOrders: Array<{ price: number; amount: number; count: number }>;
}

export interface PriceSuggestion {
  suggestedPrice: number;
  marketPrice: number;
  spread: number;
  confidence: "high" | "medium" | "low";
}

export interface MatchingStats {
  totalMatches: number;
  avgMatchTime: number;
  successRate: number;
  volumeTraded: number;
}

/**
 * Find matching offers for given criteria
 */
export async function findMatches(criteria: MatchingCriteria): Promise<MatchResult> {
  try {
    const findMatchesFn = httpsCallable(functions, "findMatches");
    const result = await findMatchesFn(criteria);
    
    if (!result.data) {
      throw new Error("No data returned from findMatches");
    }
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to find matches");
    }
    
    return response.data as MatchResult;
  } catch (error: any) {
    console.error("Find matches error:", error);
    throw new Error(error.message || "Failed to find matching offers");
  }
}

/**
 * Auto-match order with best available offer
 */
export async function autoMatchOrder(params: {
  orderType: "buy" | "sell";
  asset: string;
  fiatCurrency: string;
  amount: number;
  paymentMethod?: string;
}): Promise<{ matched: boolean; orderId?: string; offer?: any }> {
  try {
    const autoMatchFn = httpsCallable(functions, "autoMatchOrder");
    const result = await autoMatchFn(params);
    
    if (!result.data) {
      throw new Error("No data returned from autoMatchOrder");
    }
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to auto-match order");
    }
    
    return response.data;
  } catch (error: any) {
    console.error("Auto-match order error:", error);
    throw new Error(error.message || "Failed to automatically match order");
  }
}

/**
 * Get market depth for asset pair
 */
export async function getMarketDepth(params: {
  asset: string;
  fiatCurrency: string;
}): Promise<MarketDepth> {
  try {
    const getMarketDepthFn = httpsCallable(functions, "getMarketDepth");
    const result = await getMarketDepthFn(params);
    
    if (!result.data) {
      throw new Error("No data returned from getMarketDepth");
    }
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to get market depth");
    }
    
    return response.data as MarketDepth;
  } catch (error: any) {
    console.error("Get market depth error:", error);
    throw new Error(error.message || "Failed to fetch market depth");
  }
}

/**
 * Get price suggestion based on market conditions
 */
export async function suggestPrice(params: {
  offerType: "buy" | "sell";
  asset: string;
  fiatCurrency: string;
}): Promise<PriceSuggestion> {
  try {
    const suggestPriceFn = httpsCallable(functions, "suggestPrice");
    const result = await suggestPriceFn(params);
    
    if (!result.data) {
      throw new Error("No data returned from suggestPrice");
    }
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to suggest price");
    }
    
    return response.data as PriceSuggestion;
  } catch (error: any) {
    console.error("Suggest price error:", error);
    throw new Error(error.message || "Failed to get price suggestion");
  }
}

/**
 * Get matching statistics for analytics
 */
export async function getMatchingStats(params: {
  asset: string;
  fiatCurrency: string;
  timeframe?: "1h" | "24h" | "7d" | "30d";
}): Promise<MatchingStats> {
  try {
    const getStatsFn = httpsCallable(functions, "getMatchingStats");
    const result = await getStatsFn(params);
    
    if (!result.data) {
      throw new Error("No data returned from getMatchingStats");
    }
    
    const response = result.data as any;
    
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to get matching stats");
    }
    
    return response.data as MatchingStats;
  } catch (error: any) {
    console.error("Get matching stats error:", error);
    throw new Error(error.message || "Failed to fetch matching statistics");
  }
}
