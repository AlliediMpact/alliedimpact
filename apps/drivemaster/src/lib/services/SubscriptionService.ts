import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Stage } from '@/lib/types/game';

export type SubscriptionTier = 'free' | 'trial' | 'paid';

export interface TrialInfo {
  isEligible: boolean;
  isActive: boolean;
  activatedAt?: Date;
  expiresAt?: Date;
  daysRemaining?: number;
  hasUsedTrial: boolean;
  ineligibilityReason?: string;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  trialInfo?: TrialInfo;
  paidAt?: Date;
  unlockedStages: Stage[];
  journeysToday: number;
  maxJourneysPerDay: number;
  canAccessStage: (stage: Stage) => boolean;
}

export class SubscriptionService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Get current subscription information
   */
  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const tier = userData.subscriptionTier || 'free';
    const unlockedStages = userData.unlockedStages || ['beginner'];

    // Get today's journey count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastJourneyDate = userData.lastJourneyDate?.toDate();
    const lastJourneyDay = lastJourneyDate
      ? new Date(lastJourneyDate.getFullYear(), lastJourneyDate.getMonth(), lastJourneyDate.getDate())
      : null;

    const journeysToday =
      lastJourneyDay && lastJourneyDay.getTime() === today.getTime()
        ? userData.journeysToday || 0
        : 0;

    const maxJourneysPerDay = tier === 'free' ? 3 : Infinity;

    // Check trial status if applicable
    let trialInfo: TrialInfo | undefined;
    if (tier === 'trial' || userData.hasUsedTrial) {
      trialInfo = await this.checkTrialEligibility();
    }

    return {
      tier,
      trialInfo,
      paidAt: userData.paidAt?.toDate(),
      unlockedStages,
      journeysToday,
      maxJourneysPerDay,
      canAccessStage: (stage: Stage) => {
        if (tier === 'free') {
          return stage === 'beginner';
        }
        // Trial and paid users can access unlocked stages based on progression
        return unlockedStages.includes(stage);
      },
    };
  }

  /**
   * Check trial eligibility
   */
  async checkTrialEligibility(): Promise<TrialInfo> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        isEligible: false,
        isActive: false,
        hasUsedTrial: false,
        ineligibilityReason: 'User not found',
      };
    }

    const userData = userDoc.data();

    // Check if already used trial
    if (userData.hasUsedTrial) {
      return {
        isEligible: false,
        isActive: false,
        hasUsedTrial: true,
        ineligibilityReason: 'Trial already used',
      };
    }

    // Check if email is verified
    if (!userData.emailVerified) {
      return {
        isEligible: false,
        isActive: false,
        hasUsedTrial: false,
        ineligibilityReason: 'Email not verified',
      };
    }

    // Check if trial is currently active
    if (userData.subscriptionTier === 'trial') {
      const expiresAt = userData.trialExpiresAt?.toDate();
      const now = new Date();

      if (expiresAt && expiresAt > now) {
        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          isEligible: false,
          isActive: true,
          hasUsedTrial: true,
          activatedAt: userData.trialActivatedAt?.toDate(),
          expiresAt,
          daysRemaining,
        };
      } else {
        // Trial expired - auto-downgrade
        await this.downgradeFromTrial();
        return {
          isEligible: false,
          isActive: false,
          hasUsedTrial: true,
          ineligibilityReason: 'Trial expired',
        };
      }
    }

    // User is eligible for trial
    return {
      isEligible: true,
      isActive: false,
      hasUsedTrial: false,
    };
  }

  /**
   * Activate trial subscription
   */
  async activateTrial(): Promise<boolean> {
    const eligibility = await this.checkTrialEligibility();

    if (!eligibility.isEligible) {
      throw new Error(eligibility.ineligibilityReason || 'Not eligible for trial');
    }

    const userRef = doc(db, 'drivemaster_users', this.userId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await updateDoc(userRef, {
      subscriptionTier: 'trial',
      hasUsedTrial: true,
      trialActivatedAt: Timestamp.fromDate(now),
      trialExpiresAt: Timestamp.fromDate(expiresAt),
      // Unlock all stages for trial
      unlockedStages: ['beginner', 'intermediate', 'advanced', 'k53'],
      updatedAt: Timestamp.fromDate(now),
    });

    return true;
  }

  /**
   * Upgrade to paid subscription
   */
  async upgradeToPaid(paymentReference: string): Promise<boolean> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const now = new Date();

    await updateDoc(userRef, {
      subscriptionTier: 'paid',
      paidAt: Timestamp.fromDate(now),
      paymentReference,
      // Unlock all stages for paid users
      unlockedStages: ['beginner', 'intermediate', 'advanced', 'k53'],
      updatedAt: Timestamp.fromDate(now),
    });

    return true;
  }

  /**
   * Downgrade from trial to free
   */
  private async downgradeFromTrial(): Promise<void> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const currentStage = userData.currentStage || 'beginner';

    // Keep only unlocked stages through progression
    const unlockedStages = userData.unlockedStages || ['beginner'];
    const progressionUnlocked = unlockedStages.filter((stage: Stage) => {
      // Keep stages that were unlocked through mastery
      return userData[`${stage}MasteryDate`];
    });

    // Free users can only access beginner
    const freeUnlockedStages = progressionUnlocked.length > 0 ? progressionUnlocked : ['beginner'];

    await updateDoc(userRef, {
      subscriptionTier: 'free',
      unlockedStages: freeUnlockedStages,
      currentStage: freeUnlockedStages.includes(currentStage) ? currentStage : 'beginner',
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  /**
   * Check if user can start a new journey today
   */
  async canStartJourney(): Promise<{ allowed: boolean; reason?: string }> {
    const info = await this.getSubscriptionInfo();

    if (info.tier === 'free') {
      if (info.journeysToday >= info.maxJourneysPerDay) {
        return {
          allowed: false,
          reason: `Daily limit reached (${info.maxJourneysPerDay} journeys/day for Free tier)`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Record a journey start (for daily limit tracking)
   */
  async recordJourneyStart(): Promise<void> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const lastJourneyDate = userData.lastJourneyDate?.toDate();
    const lastJourneyDay = lastJourneyDate
      ? new Date(lastJourneyDate.getFullYear(), lastJourneyDate.getMonth(), lastJourneyDate.getDate())
      : null;

    const journeysToday =
      lastJourneyDay && lastJourneyDay.getTime() === today.getTime()
        ? (userData.journeysToday || 0) + 1
        : 1;

    await updateDoc(userRef, {
      journeysToday,
      lastJourneyDate: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
  }

  /**
   * Get PayFast payment data for R99 lifetime subscription
   */
  getPayFastPaymentData(returnUrl: string, cancelUrl: string, notifyUrl: string) {
    const merchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '10000100';
    const merchantKey = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || '46f0cd694581a';
    const amount = '99.00'; // R99
    const itemName = 'DriveMaster Lifetime Access';

    return {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      amount,
      item_name: itemName,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      email_address: '', // Will be filled from user profile
      m_payment_id: this.userId, // User ID as payment reference
      amount_gross: amount,
      custom_str1: this.userId,
    };
  }

  /**
   * Check if trial is expiring soon (within 2 days)
   */
  async isTrialExpiringSoon(): Promise<boolean> {
    const info = await this.getSubscriptionInfo();

    if (info.tier === 'trial' && info.trialInfo?.daysRemaining) {
      return info.trialInfo.daysRemaining <= 2;
    }

    return false;
  }

  /**
   * Get subscription tier benefits
   */
  getTierBenefits(tier: SubscriptionTier): string[] {
    switch (tier) {
      case 'free':
        return [
          'Access to Beginner stage only',
          '3 journeys per day',
          'Basic progress tracking',
          'Credits system',
          'Daily streak bonuses',
        ];
      case 'trial':
        return [
          'Full access to all stages',
          'Unlimited journeys',
          'Complete progress tracking',
          'All badges and achievements',
          'Valid for 7 days',
        ];
      case 'paid':
        return [
          'Lifetime access to all stages',
          'Unlimited journeys',
          'Priority support',
          'All future updates',
          'Downloadable certificates',
          'No ads (future)',
        ];
      default:
        return [];
    }
  }
}
