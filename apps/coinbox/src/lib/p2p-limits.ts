/**
 * P2P Crypto Trading Limits
 * 
 * These limits are ONLY for P2P crypto trading and do not affect:
 * - Existing membership tiers in membership-tiers.ts
 * - ZAR trading limits
 * - Loan/investment limits
 * - Existing wallet functionality
 * 
 * Isolated module for P2P crypto marketplace feature
 */

import { MembershipTierType } from './membership-tiers';

export interface P2PCryptoLimits {
  maxTradeAmount: number; // Maximum single trade in ZAR
  maxWeeklyVolume: number; // Maximum weekly volume in ZAR
  maxActiveListings: number; // Maximum concurrent active listings
  canAutoMatch: boolean; // Can use auto-matching feature
  canAccessAdvancedAI: boolean; // Can access AI predictions
}

/**
 * P2P Trading Limits per Membership Tier
 * Applies ONLY to crypto P2P trades, not ZAR trading
 */
export const P2P_CRYPTO_LIMITS: Record<MembershipTierType, P2PCryptoLimits> = {
  Basic: {
    maxTradeAmount: 5000, // R5,000 per trade
    maxWeeklyVolume: 15000, // R15,000 per week
    maxActiveListings: 2, // 2 active listings
    canAutoMatch: false,
    canAccessAdvancedAI: false,
  },
  Ambassador: {
    maxTradeAmount: 20000, // R20,000 per trade
    maxWeeklyVolume: 60000, // R60,000 per week
    maxActiveListings: 5, // 5 active listings
    canAutoMatch: true,
    canAccessAdvancedAI: false,
  },
  VIP: {
    maxTradeAmount: 100000, // R100,000 per trade
    maxWeeklyVolume: 300000, // R300,000 per week
    maxActiveListings: 10, // 10 active listings
    canAutoMatch: true,
    canAccessAdvancedAI: true,
  },
  Business: {
    maxTradeAmount: Infinity, // Unlimited
    maxWeeklyVolume: Infinity, // Unlimited
    maxActiveListings: Infinity, // Unlimited
    canAutoMatch: true,
    canAccessAdvancedAI: true,
  },
};

/**
 * P2P Fee Structure
 * Fixed 0.5% fee on all crypto P2P trades
 * Hybrid Model: Internal matching (free) + Luno custody (secure)
 * Does NOT affect existing transaction fees in membership-tiers.ts
 * 
 * Fee Breakdown:
 * - Internal P2P trades: 0.5% platform fee (instant, no blockchain fees)
 * - External withdrawals: Network fees only (paid to blockchain)
 * - Luno custody: Handles security, we handle matching
 */
export const P2P_CRYPTO_FEE = {
  PERCENTAGE: 0.5, // 0.5% fee
  CHARGED_TO: 'creator' as const, // Fee charged to listing creator
  MIN_FEE: 2.5, // Minimum R2.50 fee
  MAX_FEE: 5000, // Maximum R5,000 fee (for Business tier protection)
};

/**
 * Calculate P2P trade fee
 * @param tradeAmount - Amount in ZAR
 * @returns Fee amount in ZAR
 */
export function calculateP2PFee(tradeAmount: number): number {
  const fee = (tradeAmount * P2P_CRYPTO_FEE.PERCENTAGE) / 100;
  return Math.max(
    P2P_CRYPTO_FEE.MIN_FEE,
    Math.min(fee, P2P_CRYPTO_FEE.MAX_FEE)
  );
}

/**
 * Get P2P limits for a membership tier
 * @param tier - User's membership tier
 * @returns P2P trading limits
 */
export function getP2PLimits(tier: MembershipTierType): P2PCryptoLimits {
  return P2P_CRYPTO_LIMITS[tier];
}

/**
 * Check if user can create a trade within their limits
 * @param tier - User's membership tier
 * @param tradeAmount - Proposed trade amount in ZAR
 * @param currentWeeklyVolume - User's current weekly volume
 * @param activeListingsCount - Number of active listings
 * @returns Validation result
 */
export function validateP2PTrade(params: {
  tier: MembershipTierType;
  tradeAmount: number;
  currentWeeklyVolume: number;
  activeListingsCount: number;
}): {
  allowed: boolean;
  reason?: string;
  limits: P2PCryptoLimits;
} {
  const limits = getP2PLimits(params.tier);

  // Check single trade amount
  if (params.tradeAmount > limits.maxTradeAmount) {
    return {
      allowed: false,
      reason: `Trade amount (R${params.tradeAmount.toLocaleString()}) exceeds your tier limit of R${limits.maxTradeAmount.toLocaleString()}. Upgrade to a higher tier.`,
      limits,
    };
  }

  // Check weekly volume
  const projectedVolume = params.currentWeeklyVolume + params.tradeAmount;
  if (projectedVolume > limits.maxWeeklyVolume) {
    return {
      allowed: false,
      reason: `This trade would exceed your weekly volume limit of R${limits.maxWeeklyVolume.toLocaleString()}. Current: R${params.currentWeeklyVolume.toLocaleString()}`,
      limits,
    };
  }

  // Check active listings
  if (params.activeListingsCount >= limits.maxActiveListings) {
    return {
      allowed: false,
      reason: `You have reached your maximum of ${limits.maxActiveListings} active listings. Close some listings or upgrade your tier.`,
      limits,
    };
  }

  return {
    allowed: true,
    limits,
  };
}

/**
 * P2P Trade Statuses
 */
export type P2PTradeStatus =
  | 'active' // Listing is active
  | 'matched' // Buyer matched with seller
  | 'escrowed' // Funds locked in escrow
  | 'payment-pending' // Waiting for payment
  | 'payment-confirmed' // Payment confirmed by buyer
  | 'completed' // Trade completed successfully
  | 'cancelled' // Trade cancelled
  | 'disputed' // Trade under dispute
  | 'expired'; // Listing expired

/**
 * Supported crypto assets for P2P trading
 */
export const P2P_SUPPORTED_ASSETS = ['BTC', 'ETH', 'USDT', 'USDC'] as const;
export type P2PCryptoAsset = (typeof P2P_SUPPORTED_ASSETS)[number];

/**
 * P2P Escrow Configuration
 */
export const P2P_ESCROW_CONFIG = {
  TIMEOUT_MINUTES: 30, // 30 minutes to complete trade
  AUTO_RELEASE_DELAY: 5, // 5 minutes delay before auto-release
  DISPUTE_WINDOW_HOURS: 24, // 24 hours to open dispute
};

/**
 * Check if user has access to advanced features
 */
export function hasP2PFeatureAccess(
  tier: MembershipTierType,
  feature: 'auto-match' | 'advanced-ai'
): boolean {
  const limits = getP2PLimits(tier);
  
  if (feature === 'auto-match') {
    return limits.canAutoMatch;
  }
  
  if (feature === 'advanced-ai') {
    return limits.canAccessAdvancedAI;
  }
  
  return false;
}

/**
 * Format P2P limits for display
 */
export function formatP2PLimits(tier: MembershipTierType): {
  maxTradeAmount: string;
  maxWeeklyVolume: string;
  maxActiveListings: string;
  features: string[];
} {
  const limits = getP2PLimits(tier);
  
  return {
    maxTradeAmount:
      limits.maxTradeAmount === Infinity
        ? 'Unlimited'
        : `R${limits.maxTradeAmount.toLocaleString()}`,
    maxWeeklyVolume:
      limits.maxWeeklyVolume === Infinity
        ? 'Unlimited'
        : `R${limits.maxWeeklyVolume.toLocaleString()}`,
    maxActiveListings:
      limits.maxActiveListings === Infinity
        ? 'Unlimited'
        : `${limits.maxActiveListings}`,
    features: [
      limits.canAutoMatch ? 'Auto-Match' : '',
      limits.canAccessAdvancedAI ? 'AI Predictions' : '',
    ].filter(Boolean),
  };
}
