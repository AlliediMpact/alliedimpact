/**
 * Referral Commission Configuration
 * 
 * This config file defines all commission rates, badge requirements, and XP rewards
 * for the referral program. All values are centralized here for easy updates.
 * 
 * @important DO NOT hardcode commission rates elsewhere in the codebase
 */

export type MembershipTier = 'Basic' | 'Ambassador' | 'VIP' | 'Business';

/**
 * 3-Level Referral Commission Rates
 * 
 * Commission Structure:
 * - Level 1: Direct referral (you referred them)
 * - Level 2: Your referral's referral (grandchild)
 * - Level 3: Level 2's referral (great-grandchild)
 * 
 * Rules:
 * - Commissions apply ONLY to sign-up and membership upgrades
 * - NO commissions for trades or other transactions
 * - Use referrer's tier to determine percentage
 * - If parent doesn't exist for a level, skip it
 */
export const REFERRAL_COMMISSION_RATES: Record<MembershipTier, {
  level1: number;  // Direct referral commission %
  level2: number;  // Level 2 commission %
  level3: number;  // Level 3 commission %
}> = {
  Basic: {
    level1: 2,    // 2% of referred user's membership fee
    level2: 0.5,  // 0.5% of level 2 user's membership fee
    level3: 0.1,  // 0.1% of level 3 user's membership fee
  },
  Ambassador: {
    level1: 3,    // 3% of referred user's membership fee
    level2: 0.5,  // 0.5% of level 2 user's membership fee
    level3: 0.1,  // 0.1% of level 3 user's membership fee
  },
  VIP: {
    level1: 4,    // 4% of referred user's membership fee
    level2: 0.5,  // 0.5% of level 2 user's membership fee
    level3: 0.1,  // 0.1% of level 3 user's membership fee
  },
  Business: {
    level1: 5,    // 5% of referred user's membership fee
    level2: 0.5,  // 0.5% of level 2 user's membership fee
    level3: 0.1,  // 0.1% of level 3 user's membership fee
  },
};

/**
 * Badge Achievement System
 * 
 * Badges unlock based on DIRECT referrals only (Level 1)
 * Each badge can only be earned once per user
 * Rewards are credited immediately to wallet upon unlock
 */
export interface BadgeRequirement {
  name: string;
  directReferralsRequired: number;
  rewardAmount: number;  // ZAR amount credited to wallet
  xpReward: number;      // XP points awarded
  icon: string;          // Icon identifier for UI
  color: string;         // Color hex for UI
}

export const BADGE_SYSTEM: Record<string, BadgeRequirement> = {
  BRONZE: {
    name: 'Bronze Referrer',
    directReferralsRequired: 4,
    rewardAmount: 50,      // R50
    xpReward: 20,          // 20 XP
    icon: 'bronze-medal',
    color: '#CD7F32',
  },
  SILVER: {
    name: 'Silver Referrer',
    directReferralsRequired: 12,
    rewardAmount: 100,     // R100
    xpReward: 40,          // 40 XP
    icon: 'silver-medal',
    color: '#C0C0C0',
  },
  GOLD: {
    name: 'Gold Referrer',
    directReferralsRequired: 25,
    rewardAmount: 200,     // R200
    xpReward: 75,          // 75 XP
    icon: 'gold-medal',
    color: '#FFD700',
  },
  DIAMOND: {
    name: 'Diamond Referrer',
    directReferralsRequired: 100,
    rewardAmount: 500,     // R500
    xpReward: 200,         // 200 XP
    icon: 'diamond',
    color: '#B9F2FF',
  },
};

/**
 * Get all badges in order of progression
 */
export const BADGE_PROGRESSION = [
  BADGE_SYSTEM.BRONZE,
  BADGE_SYSTEM.SILVER,
  BADGE_SYSTEM.GOLD,
  BADGE_SYSTEM.DIAMOND,
];

/**
 * Commission Event Types
 * 
 * Defines which events trigger referral commissions
 */
export enum CommissionEventType {
  USER_SIGNUP = 'user_signup',           // New user completes registration
  MEMBERSHIP_UPGRADE = 'membership_upgrade', // User upgrades membership tier
}

/**
 * Helper function to get commission rate for a specific level
 */
export function getCommissionRate(
  referrerTier: MembershipTier,
  level: 1 | 2 | 3
): number {
  const rates = REFERRAL_COMMISSION_RATES[referrerTier];
  
  switch (level) {
    case 1:
      return rates.level1;
    case 2:
      return rates.level2;
    case 3:
      return rates.level3;
    default:
      return 0;
  }
}

/**
 * Helper function to get next badge requirement
 */
export function getNextBadge(currentDirectReferrals: number): BadgeRequirement | null {
  return BADGE_PROGRESSION.find(
    badge => badge.directReferralsRequired > currentDirectReferrals
  ) || null;
}

/**
 * Helper function to check if user qualifies for a badge
 */
export function checkBadgeQualification(
  currentDirectReferrals: number,
  unlockedBadges: string[]
): BadgeRequirement | null {
  // Find the highest badge the user qualifies for but hasn't unlocked yet
  for (let i = BADGE_PROGRESSION.length - 1; i >= 0; i--) {
    const badge = BADGE_PROGRESSION[i];
    const badgeKey = Object.keys(BADGE_SYSTEM).find(
      key => BADGE_SYSTEM[key].name === badge.name
    );
    
    if (
      currentDirectReferrals >= badge.directReferralsRequired &&
      badgeKey &&
      !unlockedBadges.includes(badgeKey)
    ) {
      return badge;
    }
  }
  
  return null;
}

/**
 * Firestore collection names for referral system
 */
export const REFERRAL_COLLECTIONS = {
  REFERRAL_COMMISSIONS: 'referralCommissions',
  REFERRAL_STATS: 'referralStats',
  USER_ACHIEVEMENTS: 'userAchievements',
  REFERRALS: 'referrals',
  USERS: 'users',
  WALLETS: 'wallets',
} as const;

/**
 * Commission status types
 */
export enum CommissionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
}

/**
 * Achievement types
 */
export enum AchievementType {
  BADGE = 'badge',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
}
