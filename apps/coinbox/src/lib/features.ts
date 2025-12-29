/**
 * Feature Flags Configuration
 * 
 * Controls which features are enabled in the application.
 * All features are disabled by default for safety.
 * 
 * Enable features via environment variables:
 * - NEXT_PUBLIC_FEATURE_SAVINGS_JAR=true
 * - NEXT_PUBLIC_FEATURE_STOKVEL=true
 * - NEXT_PUBLIC_FEATURE_MICRO_LOANS=true
 */

export interface FeatureFlags {
  SAVINGS_JAR: boolean;
  STOKVEL: boolean;
  MICRO_LOANS: boolean;
  SAVINGS_JAR_ON_STOKVEL_PAYOUT: boolean;
}

export const FEATURES: FeatureFlags = {
  // Savings Jar - Auto-save 1% from profits
  SAVINGS_JAR: process.env.NEXT_PUBLIC_FEATURE_SAVINGS_JAR === 'true',
  
  // Stokvel - Peer group savings with rotation
  STOKVEL: process.env.NEXT_PUBLIC_FEATURE_STOKVEL === 'true',
  
  // Emergency Micro-Loans - 7-day, 10% interest
  MICRO_LOANS: process.env.NEXT_PUBLIC_FEATURE_MICRO_LOANS === 'true',
  
  // Auto-add 1% of stokvel payouts to Savings Jar
  SAVINGS_JAR_ON_STOKVEL_PAYOUT: process.env.NEXT_PUBLIC_SAVINGS_JAR_ON_STOKVEL_PAYOUT !== 'false',
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return FEATURES[feature] === true;
}

/**
 * Savings Jar Configuration
 */
export const SAVINGS_JAR_CONFIG = {
  AUTO_PERCENTAGE: parseFloat(process.env.SAVINGS_JAR_AUTO_PERCENTAGE || '0.01'), // 1%
  WITHDRAWAL_FEE: parseFloat(process.env.SAVINGS_JAR_WITHDRAWAL_FEE || '0.01'), // 1%
  MIN_WITHDRAWAL: parseFloat(process.env.SAVINGS_JAR_MIN_WITHDRAWAL || '100'), // R100
  MIN_THRESHOLD: 100, // R100 minimum threshold
};

/**
 * Get feature status for admin dashboard
 */
export function getFeatureStatus(): Record<string, boolean> {
  return {
    'Savings Jar': FEATURES.SAVINGS_JAR,
    'Stokvel': FEATURES.STOKVEL,
    'Micro-Loans': FEATURES.MICRO_LOANS,
  };
}
