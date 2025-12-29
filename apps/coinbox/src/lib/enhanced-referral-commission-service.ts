/**
 * Enhanced Referral Commission Service
 * 
 * Handles 3-level referral commissions for sign-ups and membership upgrades ONLY.
 * 
 * Features:
 * - 3-level commission calculation (Level 1, 2, 3)
 * - Idempotent commission processing (no double-payments)
 * - Automatic wallet credit using existing wallet service
 * - Firestore transaction-based operations for consistency
 * - Badge achievement detection and rewards
 * - XP tracking
 * 
 * @important This service extends existing referral-service.ts, does not replace it
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  runTransaction,
  Timestamp,
  increment,
  arrayUnion,
} from 'firebase/firestore';
import {
  REFERRAL_COMMISSION_RATES,
  BADGE_SYSTEM,
  REFERRAL_COLLECTIONS,
  CommissionEventType,
  CommissionStatus,
  MembershipTier,
  getCommissionRate,
  checkBadgeQualification,
} from '@/config/referral-commission-config';
import { membershipService } from '@/lib/membership-service';
import { notificationService } from '@/lib/notification-service';

/**
 * Interface for referral chain (ancestry tracking)
 */
export interface ReferralChain {
  level1?: string;  // Direct referrer (parent)
  level2?: string;  // Level 2 referrer (grandparent)
  level3?: string;  // Level 3 referrer (great-grandparent)
}

/**
 * Interface for commission record
 */
export interface ReferralCommission {
  id: string;
  referrerId: string;            // Who receives the commission
  referredUserId: string;        // Who triggered the commission
  eventType: CommissionEventType; // signup or upgrade
  eventId: string;               // Unique event identifier for idempotency
  level: 1 | 2 | 3;             // Commission level
  amount: number;                // ZAR amount
  commissionRate: number;        // Percentage applied
  referrerTier: MembershipTier;  // Tier of the referrer
  status: CommissionStatus;
  createdAt: Timestamp;
  paidAt?: Timestamp;
  transactionId?: string;
}

/**
 * Interface for user achievement
 */
export interface UserAchievement {
  userId: string;
  badgesUnlocked: string[];      // Array of badge keys (BRONZE, SILVER, etc.)
  totalXP: number;
  lastBadgeUnlockedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class EnhancedReferralCommissionService {
  
  /**
   * Get the referral chain for a user (3 levels)
   * 
   * Returns the userId's of Level 1, 2, and 3 referrers
   * 
   * @param userId - The user whose referral chain to fetch
   * @returns ReferralChain object with level1, level2, level3
   */
  async getReferralChain(userId: string): Promise<ReferralChain> {
    try {
      const userDoc = await getDoc(doc(db, REFERRAL_COLLECTIONS.USERS, userId));
      
      if (!userDoc.exists()) {
        return {};
      }
      
      const userData = userDoc.data();
      const level1 = userData.referrerId || null;
      
      if (!level1) {
        return {}; // No referrer at all
      }
      
      // Get level 2 (referrer's referrer)
      const level1Doc = await getDoc(doc(db, REFERRAL_COLLECTIONS.USERS, level1));
      const level2 = level1Doc.exists() ? level1Doc.data().referrerId || null : null;
      
      // Get level 3 (level 2's referrer)
      let level3 = null;
      if (level2) {
        const level2Doc = await getDoc(doc(db, REFERRAL_COLLECTIONS.USERS, level2));
        level3 = level2Doc.exists() ? level2Doc.data().referrerId || null : null;
      }
      
      return {
        level1: level1 || undefined,
        level2: level2 || undefined,
        level3: level3 || undefined,
      };
    } catch (error) {
      console.error('[Enhanced Referral] Error getting referral chain:', error);
      return {};
    }
  }
  
  /**
   * Process 3-level commissions for a sign-up or upgrade event
   * 
   * This is the main function called when a user signs up or upgrades.
   * It calculates and credits commissions to Level 1, 2, and 3 referrers.
   * 
   * @param referredUserId - The user who signed up or upgraded
   * @param eventType - Type of event (signup or upgrade)
   * @param membershipFee - The amount of the membership fee
   * @param eventId - Unique identifier for idempotency (e.g., "signup_userId" or "upgrade_userId_timestamp")
   * 
   * @returns Promise<{ success: boolean, commissionsProcessed: number, totalAmount: number }>
   */
  async processCommissions(
    referredUserId: string,
    eventType: CommissionEventType,
    membershipFee: number,
    eventId: string
  ): Promise<{ success: boolean; commissionsProcessed: number; totalAmount: number; error?: string }> {
    try {
      // Check if event already processed (idempotency)
      const existingCommissions = await getDocs(
        query(
          collection(db, REFERRAL_COLLECTIONS.REFERRAL_COMMISSIONS),
          where('eventId', '==', eventId)
        )
      );
      
      if (!existingCommissions.empty) {
        console.log(`[Enhanced Referral] Event ${eventId} already processed. Skipping.`);
        return {
          success: true,
          commissionsProcessed: 0,
          totalAmount: 0,
          error: 'Event already processed',
        };
      }
      
      // Get referral chain
      const chain = await this.getReferralChain(referredUserId);
      
      if (!chain.level1) {
        console.log(`[Enhanced Referral] No referrer found for user ${referredUserId}`);
        return {
          success: true,
          commissionsProcessed: 0,
          totalAmount: 0,
          error: 'No referrer',
        };
      }
      
      let commissionsProcessed = 0;
      let totalAmount = 0;
      
      // Process Level 1 commission
      if (chain.level1) {
        const result = await this.processLevelCommission(
          chain.level1,
          referredUserId,
          eventType,
          eventId,
          membershipFee,
          1
        );
        
        if (result.success) {
          commissionsProcessed++;
          totalAmount += result.amount;
        }
      }
      
      // Process Level 2 commission
      if (chain.level2) {
        const result = await this.processLevelCommission(
          chain.level2,
          referredUserId,
          eventType,
          eventId,
          membershipFee,
          2
        );
        
        if (result.success) {
          commissionsProcessed++;
          totalAmount += result.amount;
        }
      }
      
      // Process Level 3 commission
      if (chain.level3) {
        const result = await this.processLevelCommission(
          chain.level3,
          referredUserId,
          eventType,
          eventId,
          membershipFee,
          3
        );
        
        if (result.success) {
          commissionsProcessed++;
          totalAmount += result.amount;
        }
      }
      
      // Check for badge achievements (only for Level 1)
      if (chain.level1) {
        await this.checkAndAwardBadges(chain.level1);
      }
      
      console.log(
        `[Enhanced Referral] Processed ${commissionsProcessed} commissions for event ${eventId}, total: R${totalAmount}`
      );
      
      return {
        success: true,
        commissionsProcessed,
        totalAmount,
      };
    } catch (error) {
      console.error('[Enhanced Referral] Error processing commissions:', error);
      return {
        success: false,
        commissionsProcessed: 0,
        totalAmount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Process commission for a single level
   * 
   * @private
   */
  private async processLevelCommission(
    referrerId: string,
    referredUserId: string,
    eventType: CommissionEventType,
    eventId: string,
    membershipFee: number,
    level: 1 | 2 | 3
  ): Promise<{ success: boolean; amount: number }> {
    try {
      // Get referrer's membership tier
      const membership = await membershipService.getUserMembership(referrerId);
      const referrerTier = (membership?.currentTier || 'Basic') as MembershipTier;
      
      // Calculate commission
      const commissionRate = getCommissionRate(referrerTier, level);
      const commissionAmount = (membershipFee * commissionRate) / 100;
      
      if (commissionAmount <= 0) {
        return { success: false, amount: 0 };
      }
      
      // Create commission record and update wallet atomically
      await runTransaction(db, async (transaction) => {
        // Create commission record
        const commissionRef = doc(collection(db, REFERRAL_COLLECTIONS.REFERRAL_COMMISSIONS));
        const commission: Omit<ReferralCommission, 'id'> = {
          referrerId,
          referredUserId,
          eventType,
          eventId,
          level,
          amount: commissionAmount,
          commissionRate,
          referrerTier,
          status: CommissionStatus.PAID,
          createdAt: Timestamp.now(),
          paidAt: Timestamp.now(),
        };
        
        transaction.set(commissionRef, commission);
        
        // Update wallet balance (credit commission)
        const walletRef = doc(db, REFERRAL_COLLECTIONS.WALLETS, referrerId);
        const walletDoc = await transaction.get(walletRef);
        
        if (walletDoc.exists()) {
          transaction.update(walletRef, {
            balance: increment(commissionAmount),
            updatedAt: Timestamp.now(),
          });
        }
        
        // Update referral stats
        const statsRef = doc(db, REFERRAL_COLLECTIONS.REFERRAL_STATS, referrerId);
        const statsDoc = await transaction.get(statsRef);
        
        if (statsDoc.exists()) {
          transaction.update(statsRef, {
            totalCommissions: increment(commissionAmount),
            lastUpdated: Timestamp.now(),
          });
        } else {
          transaction.set(statsRef, {
            userId: referrerId,
            totalCommissions: commissionAmount,
            pendingCommissions: 0,
            activeReferrals: 0,
            totalReferrals: 0,
            createdAt: Timestamp.now(),
            lastUpdated: Timestamp.now(),
          });
        }
      });
      
      // Send notification
      await notificationService.createNotification({
        userId: referrerId,
        type: 'commission',
        title: `Level ${level} Commission Earned!`,
        message: `You earned R${commissionAmount.toFixed(2)} from a ${eventType === CommissionEventType.USER_SIGNUP ? 'new signup' : 'membership upgrade'}.`,
        priority: 'normal',
        metadata: {
          amount: commissionAmount,
        },
      });
      
      console.log(
        `[Enhanced Referral] Credited R${commissionAmount} to ${referrerId} (Level ${level}, ${referrerTier} tier)`
      );
      
      return {
        success: true,
        amount: commissionAmount,
      };
    } catch (error) {
      console.error(`[Enhanced Referral] Error processing Level ${level} commission:`, error);
      return { success: false, amount: 0 };
    }
  }
  
  /**
   * Check if user qualifies for badges and award them
   * 
   * This function:
   * 1. Counts direct referrals
   * 2. Checks if user qualifies for any badges
   * 3. Awards badge rewards (wallet credit + XP)
   * 4. Sends notification
   */
  async checkAndAwardBadges(userId: string): Promise<void> {
    try {
      // Get user's achievement record
      const achievementRef = doc(db, REFERRAL_COLLECTIONS.USER_ACHIEVEMENTS, userId);
      const achievementDoc = await getDoc(achievementRef);
      
      let unlockedBadges: string[] = [];
      let totalXP = 0;
      
      if (achievementDoc.exists()) {
        const data = achievementDoc.data() as UserAchievement;
        unlockedBadges = data.badgesUnlocked || [];
        totalXP = data.totalXP || 0;
      }
      
      // Count direct referrals
      const directReferralsQuery = query(
        collection(db, REFERRAL_COLLECTIONS.USERS),
        where('referrerId', '==', userId)
      );
      const directReferralsSnap = await getDocs(directReferralsQuery);
      const directReferralCount = directReferralsSnap.size;
      
      // Check if user qualifies for any badge
      const qualifiedBadge = checkBadgeQualification(directReferralCount, unlockedBadges);
      
      if (!qualifiedBadge) {
        return; // No new badges to award
      }
      
      // Find the badge key
      const badgeKey = Object.keys(BADGE_SYSTEM).find(
        key => BADGE_SYSTEM[key].name === qualifiedBadge.name
      );
      
      if (!badgeKey) {
        return;
      }
      
      // Award badge atomically
      await runTransaction(db, async (transaction) => {
        // Update achievement record
        if (achievementDoc.exists()) {
          transaction.update(achievementRef, {
            badgesUnlocked: arrayUnion(badgeKey),
            totalXP: increment(qualifiedBadge.xpReward),
            lastBadgeUnlockedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } else {
          transaction.set(achievementRef, {
            userId,
            badgesUnlocked: [badgeKey],
            totalXP: qualifiedBadge.xpReward,
            lastBadgeUnlockedAt: Timestamp.now(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
        
        // Credit reward to wallet
        const walletRef = doc(db, REFERRAL_COLLECTIONS.WALLETS, userId);
        const walletDoc = await transaction.get(walletRef);
        
        if (walletDoc.exists()) {
          transaction.update(walletRef, {
            balance: increment(qualifiedBadge.rewardAmount),
            updatedAt: Timestamp.now(),
          });
        }
      });
      
      // Send notification
      await notificationService.createNotification({
        userId,
        type: 'achievement',
        title: `🏆 ${qualifiedBadge.name} Badge Unlocked!`,
        message: `You've earned R${qualifiedBadge.rewardAmount} and ${qualifiedBadge.xpReward} XP for referring ${directReferralCount} users!`,
        priority: 'high',
        metadata: {
          amount: qualifiedBadge.rewardAmount,
        },
      });
      
      console.log(
        `[Enhanced Referral] Awarded ${badgeKey} badge to ${userId}: R${qualifiedBadge.rewardAmount} + ${qualifiedBadge.xpReward} XP`
      );
    } catch (error) {
      console.error('[Enhanced Referral] Error checking/awarding badges:', error);
    }
  }
  
  /**
   * Get user's referral stats including badges and XP
   */
  async getUserReferralStats(userId: string): Promise<{
    directReferrals: number;
    level2Referrals: number;
    level3Referrals: number;
    totalCommissions: number;
    pendingCommissions: number;
    badgesUnlocked: string[];
    totalXP: number;
    nextBadge: string | null;
    nextBadgeProgress: number;
  }> {
    try {
      // Get achievement data
      const achievementDoc = await getDoc(
        doc(db, REFERRAL_COLLECTIONS.USER_ACHIEVEMENTS, userId)
      );
      
      const badgesUnlocked = achievementDoc.exists() 
        ? (achievementDoc.data().badgesUnlocked || [])
        : [];
      const totalXP = achievementDoc.exists()
        ? (achievementDoc.data().totalXP || 0)
        : 0;
      
      // Count direct referrals (Level 1)
      const directReferralsQuery = query(
        collection(db, REFERRAL_COLLECTIONS.USERS),
        where('referrerId', '==', userId)
      );
      const directReferralsSnap = await getDocs(directReferralsQuery);
      const directReferrals = directReferralsSnap.size;
      
      // Count Level 2 and Level 3 referrals
      let level2Count = 0;
      let level3Count = 0;
      
      for (const referralDoc of directReferralsSnap.docs) {
        const referralId = referralDoc.id;
        
        // Count Level 2 (direct referral's referrals)
        const level2Query = query(
          collection(db, REFERRAL_COLLECTIONS.USERS),
          where('referrerId', '==', referralId)
        );
        const level2Snap = await getDocs(level2Query);
        level2Count += level2Snap.size;
        
        // Count Level 3 (Level 2's referrals)
        for (const level2Doc of level2Snap.docs) {
          const level2Id = level2Doc.id;
          const level3Query = query(
            collection(db, REFERRAL_COLLECTIONS.USERS),
            where('referrerId', '==', level2Id)
          );
          const level3Snap = await getDocs(level3Query);
          level3Count += level3Snap.size;
        }
      }
      
      // Get commission stats
      const statsDoc = await getDoc(
        doc(db, REFERRAL_COLLECTIONS.REFERRAL_STATS, userId)
      );
      
      const totalCommissions = statsDoc.exists() 
        ? (statsDoc.data().totalCommissions || 0)
        : 0;
      const pendingCommissions = statsDoc.exists()
        ? (statsDoc.data().pendingCommissions || 0)
        : 0;
      
      // Calculate next badge
      const qualifiedBadge = checkBadgeQualification(directReferrals, badgesUnlocked);
      const nextBadge = qualifiedBadge ? qualifiedBadge.name : null;
      
      // Calculate progress to next badge
      let nextBadgeProgress = 0;
      if (qualifiedBadge) {
        nextBadgeProgress = (directReferrals / qualifiedBadge.directReferralsRequired) * 100;
      } else {
        // Find next higher badge
        const allBadges = Object.values(BADGE_SYSTEM).sort(
          (a, b) => a.directReferralsRequired - b.directReferralsRequired
        );
        const nextHigherBadge = allBadges.find(
          badge => !badgesUnlocked.includes(
            Object.keys(BADGE_SYSTEM).find(k => BADGE_SYSTEM[k].name === badge.name) || ''
          )
        );
        
        if (nextHigherBadge) {
          nextBadgeProgress = (directReferrals / nextHigherBadge.directReferralsRequired) * 100;
        } else {
          nextBadgeProgress = 100; // All badges unlocked
        }
      }
      
      return {
        directReferrals,
        level2Referrals: level2Count,
        level3Referrals: level3Count,
        totalCommissions,
        pendingCommissions,
        badgesUnlocked,
        totalXP,
        nextBadge,
        nextBadgeProgress: Math.min(nextBadgeProgress, 100),
      };
    } catch (error) {
      console.error('[Enhanced Referral] Error getting user stats:', error);
      return {
        directReferrals: 0,
        level2Referrals: 0,
        level3Referrals: 0,
        totalCommissions: 0,
        pendingCommissions: 0,
        badgesUnlocked: [],
        totalXP: 0,
        nextBadge: null,
        nextBadgeProgress: 0,
      };
    }
  }
}

// Export singleton instance
export const enhancedReferralCommissionService = new EnhancedReferralCommissionService();

// Unit test marker: Tests should be added for this service
// TODO: Add unit tests for:
// - getReferralChain (3 levels)
// - processCommissions (idempotency, multi-level)
// - processLevelCommission (wallet credit, notification)
// - checkAndAwardBadges (badge unlock, reward credit)
// - getUserReferralStats (counting, progress calculation)
