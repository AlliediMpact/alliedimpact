import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CREDIT_RULES } from '@/lib/types/game';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  streakBonusEarned: boolean;
  nextStreakReward: number;
}

export interface CreditTransaction {
  amount: number;
  reason: string;
  timestamp: Date;
  newBalance: number;
}

export class GamificationService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Check and update daily streak
   */
  async checkDailyStreak(): Promise<StreakInfo> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const lastActive = userData.lastActiveDate?.toDate() || new Date(0);
    const lastActiveDay = new Date(
      lastActive.getFullYear(),
      lastActive.getMonth(),
      lastActive.getDate()
    );

    const daysDifference = Math.floor(
      (today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24)
    );

    let currentStreak = userData.currentStreak || 0;
    let longestStreak = userData.longestStreak || 0;
    let streakBonusEarned = false;
    let shouldUpdate = false;

    // Same day - no update needed
    if (daysDifference === 0) {
      return {
        currentStreak,
        longestStreak,
        lastActiveDate: lastActive,
        streakBonusEarned: false,
        nextStreakReward: this.getNextStreakReward(currentStreak),
      };
    }

    // Consecutive day - increment streak and award bonus
    if (daysDifference === 1) {
      currentStreak += 1;
      longestStreak = Math.max(currentStreak, longestStreak);
      streakBonusEarned = true;
      shouldUpdate = true;

      // Award daily login bonus
      const newCredits = (userData.credits || 0) + CREDIT_RULES.earn.dailyLogin;

      await updateDoc(userRef, {
        currentStreak,
        longestStreak,
        credits: newCredits,
        lastActiveDate: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });

      return {
        currentStreak,
        longestStreak,
        lastActiveDate: now,
        streakBonusEarned: true,
        nextStreakReward: this.getNextStreakReward(currentStreak),
      };
    }

    // Streak broken - reset to 1
    if (daysDifference > 1) {
      currentStreak = 1;
      shouldUpdate = true;

      await updateDoc(userRef, {
        currentStreak,
        lastActiveDate: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });

      return {
        currentStreak,
        longestStreak,
        lastActiveDate: now,
        streakBonusEarned: false,
        nextStreakReward: this.getNextStreakReward(currentStreak),
      };
    }

    return {
      currentStreak,
      longestStreak,
      lastActiveDate: lastActive,
      streakBonusEarned: false,
      nextStreakReward: this.getNextStreakReward(currentStreak),
    };
  }

  /**
   * Get the next streak milestone reward
   */
  private getNextStreakReward(currentStreak: number): number {
    const milestones = [7, 30, 90, 180, 365];
    for (const milestone of milestones) {
      if (currentStreak < milestone) {
        return milestone;
      }
    }
    return 365; // Max milestone
  }

  /**
   * Get streak information
   */
  async getStreakInfo(): Promise<StreakInfo> {
    return this.checkDailyStreak();
  }

  /**
   * Award credits
   */
  async awardCredits(amount: number, reason: string): Promise<number> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const currentCredits = userData.credits || 0;
    const newCredits = currentCredits + amount;

    await updateDoc(userRef, {
      credits: newCredits,
      totalCreditsEarned: (userData.totalCreditsEarned || 0) + amount,
      updatedAt: Timestamp.fromDate(new Date()),
    });

    return newCredits;
  }

  /**
   * Deduct credits
   */
  async deductCredits(amount: number, reason: string): Promise<number> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const currentCredits = userData.credits || 0;
    const newCredits = Math.max(0, currentCredits - amount); // Never go below 0

    await updateDoc(userRef, {
      credits: newCredits,
      totalCreditsSpent: (userData.totalCreditsSpent || 0) + amount,
      updatedAt: Timestamp.fromDate(new Date()),
    });

    // Check for bankruptcy
    if (newCredits === 0) {
      await this.handleBankruptcy();
    }

    return newCredits;
  }

  /**
   * Get current credit balance
   */
  async getCreditBalance(): Promise<number> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return 0;
    }

    return userDoc.data().credits || 0;
  }

  /**
   * Check if user is bankrupt (0 credits)
   */
  async isBankrupt(): Promise<boolean> {
    const credits = await this.getCreditBalance();
    return credits === 0;
  }

  /**
   * Handle bankruptcy scenario
   */
  private async handleBankruptcy(): Promise<void> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const bankruptcyCount = (userData.bankruptcyCount || 0) + 1;
    const lastBankruptcyDate = Timestamp.fromDate(new Date());

    await updateDoc(userRef, {
      bankruptcyCount,
      lastBankruptcyDate,
      isBankrupt: true,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  /**
   * Offer bankruptcy recovery - free journey daily
   */
  async offerBankruptcyRecovery(): Promise<boolean> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return false;

    const userData = userDoc.data();
    const lastRecoveryDate = userData.lastBankruptcyRecoveryDate?.toDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already got recovery today
    if (lastRecoveryDate) {
      const recoveryDay = new Date(lastRecoveryDate);
      recoveryDay.setHours(0, 0, 0, 0);

      if (recoveryDay.getTime() === today.getTime()) {
        return false; // Already used today's free journey
      }
    }

    // Award minimum credits for one journey (approximately 50 credits)
    await updateDoc(userRef, {
      credits: 50,
      isBankrupt: false,
      lastBankruptcyRecoveryDate: Timestamp.fromDate(new Date()),
      totalBankruptcyRecoveries: (userData.totalBankruptcyRecoveries || 0) + 1,
      updatedAt: Timestamp.fromDate(new Date()),
    });

    return true;
  }

  /**
   * Get gamification stats
   */
  async getGamificationStats() {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const streakInfo = await this.checkDailyStreak();

    return {
      credits: userData.credits || 0,
      totalCreditsEarned: userData.totalCreditsEarned || 0,
      totalCreditsSpent: userData.totalCreditsSpent || 0,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      badges: userData.badges || [],
      totalJourneys: userData.totalJourneysCompleted || 0,
      averageScore: userData.averageScore || 0,
      bankruptcyCount: userData.bankruptcyCount || 0,
      isBankrupt: userData.isBankrupt || false,
    };
  }

  /**
   * Award streak milestone bonus
   */
  async awardStreakMilestoneBonus(streak: number): Promise<number> {
    let bonus = 0;

    if (streak === 7) {
      bonus = 100; // Weekly streak
    } else if (streak === 30) {
      bonus = 500; // Monthly streak
    } else if (streak === 90) {
      bonus = 1500; // Quarterly streak
    } else if (streak === 180) {
      bonus = 3000; // Half-year streak
    } else if (streak === 365) {
      bonus = 10000; // Annual streak
    }

    if (bonus > 0) {
      await this.awardCredits(bonus, `${streak}-day streak milestone`);
    }

    return bonus;
  }

  /**
   * Check and award streak milestones
   */
  async checkStreakMilestones(): Promise<number> {
    const streakInfo = await this.getStreakInfo();
    const streak = streakInfo.currentStreak;

    // Check if user just hit a milestone
    if ([7, 30, 90, 180, 365].includes(streak)) {
      return await this.awardStreakMilestoneBonus(streak);
    }

    return 0;
  }

  /**
   * Get recent credit transactions (mock for now - would need transaction history collection)
   */
  async getRecentTransactions(limit: number = 10): Promise<CreditTransaction[]> {
    // In production, this would query a transactions subcollection
    // For now, return empty array
    return [];
  }

  /**
   * Calculate credits needed for next journey (based on average cost)
   */
  async getCreditsNeededForJourney(): Promise<number> {
    // Average journey has ~10 questions
    // Assume 70% accuracy: 7 correct (+70) and 3 incorrect (-15)
    // Net: +55 credits potential
    // Safe amount to start: 50 credits
    return 50;
  }
}
