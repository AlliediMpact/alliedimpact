import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Stage, MASTERY_THRESHOLDS } from '@/lib/types/game';

export interface StageProgress {
  stage: Stage;
  journeysCompleted: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  isUnlocked: boolean;
  isMastered: boolean;
  masteryDate?: Date;
  nextRequirements?: string;
}

export interface MasteryResult {
  canAdvance: boolean;
  currentStage: Stage;
  nextStage: Stage | null;
  reason: string;
  requirementsLeft?: string[];
}

export interface Badge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  category: 'journey' | 'mastery' | 'streak' | 'achievement';
  earnedAt?: Date;
  progress?: number;
  required?: number;
}

const STAGE_ORDER: Stage[] = ['beginner', 'intermediate', 'advanced', 'k53'];

const STAGE_REQUIREMENTS = {
  beginner: {
    minJourneys: 3,
    minScore: 95,
  },
  intermediate: {
    minJourneys: 5,
    minScore: 97,
  },
  advanced: {
    minJourneys: 5,
    minScore: 98,
  },
  k53: {
    minJourneys: 3,
    minScore: 100,
  },
};

const BADGE_DEFINITIONS: Record<string, Omit<Badge, 'earnedAt' | 'progress'>> = {
  'first-journey': {
    badgeId: 'first-journey',
    name: 'First Steps',
    description: 'Complete your first journey',
    icon: '🚗',
    category: 'journey',
  },
  'perfect-journey': {
    badgeId: 'perfect-journey',
    name: 'Perfection',
    description: 'Score 100% on any journey',
    icon: '⭐',
    category: 'achievement',
  },
  'beginner-master': {
    badgeId: 'beginner-master',
    name: 'Beginner Master',
    description: 'Complete Beginner stage with 95%+ average',
    icon: '🥉',
    category: 'mastery',
  },
  'intermediate-master': {
    badgeId: 'intermediate-master',
    name: 'Intermediate Master',
    description: 'Complete Intermediate stage with 97%+ average',
    icon: '🥈',
    category: 'mastery',
  },
  'advanced-master': {
    badgeId: 'advanced-master',
    name: 'Advanced Master',
    description: 'Complete Advanced stage with 98%+ average',
    icon: '🥇',
    category: 'mastery',
  },
  'k53-master': {
    badgeId: 'k53-master',
    name: 'K53 Champion',
    description: 'Pass K53 simulation with 100%',
    icon: '🏆',
    category: 'mastery',
  },
  'streak-7': {
    badgeId: 'streak-7',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
  },
  'streak-30': {
    badgeId: 'streak-30',
    name: 'Monthly Dedication',
    description: 'Maintain a 30-day streak',
    icon: '💎',
    category: 'streak',
  },
  'all-stages': {
    badgeId: 'all-stages',
    name: 'Road Master',
    description: 'Master all stages',
    icon: '👑',
    category: 'mastery',
  },
};

export class MasteryService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Get progress for a specific stage
   */
  async getStageProgress(stage: Stage): Promise<StageProgress> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const progressRef = collection(db, `drivemaster_users/${this.userId}/progress`);
    const stageQuery = query(progressRef, where('journeyStage', '==', stage));
    const progressDocs = await getDocs(stageQuery);

    const attempts = progressDocs.docs.map((doc) => doc.data());
    const completedJourneys = attempts.filter((a) => a.passed);
    const scores = attempts.map((a) => a.score);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    const threshold = MASTERY_THRESHOLDS[stage];
    const requirements = STAGE_REQUIREMENTS[stage];
    const isMastered =
      completedJourneys.length >= requirements.minJourneys &&
      averageScore >= threshold.min;

    const unlockedStages = userData.unlockedStages || ['beginner'];
    const isUnlocked = unlockedStages.includes(stage);

    let nextRequirements = '';
    if (!isMastered && isUnlocked) {
      const journeysLeft = Math.max(0, requirements.minJourneys - completedJourneys.length);
      const scoreGap = Math.max(0, threshold.min - averageScore);
      if (journeysLeft > 0) {
        nextRequirements = `Complete ${journeysLeft} more journey(s) with ${threshold.min}%+ average`;
      } else if (scoreGap > 0) {
        nextRequirements = `Improve average score by ${scoreGap.toFixed(1)}%`;
      }
    }

    return {
      stage,
      journeysCompleted: completedJourneys.length,
      totalAttempts: attempts.length,
      averageScore,
      bestScore,
      isUnlocked,
      isMastered,
      masteryDate: isMastered ? userData[`${stage}MasteryDate`]?.toDate() : undefined,
      nextRequirements: nextRequirements || undefined,
    };
  }

  /**
   * Get progress for all stages
   */
  async getAllStagesProgress(): Promise<StageProgress[]> {
    return Promise.all(STAGE_ORDER.map((stage) => this.getStageProgress(stage)));
  }

  /**
   * Check if user can advance to the next stage
   */
  async checkAdvancement(currentStage: Stage): Promise<MasteryResult> {
    const stageIndex = STAGE_ORDER.indexOf(currentStage);
    const nextStage = stageIndex < STAGE_ORDER.length - 1 ? STAGE_ORDER[stageIndex + 1] : null;

    if (!nextStage) {
      return {
        canAdvance: false,
        currentStage,
        nextStage: null,
        reason: 'You have completed all stages!',
      };
    }

    const progress = await this.getStageProgress(currentStage);
    const threshold = MASTERY_THRESHOLDS[currentStage];
    const requirements = STAGE_REQUIREMENTS[currentStage];

    const requirementsLeft: string[] = [];

    if (progress.journeysCompleted < requirements.minJourneys) {
      requirementsLeft.push(
        `Complete ${requirements.minJourneys - progress.journeysCompleted} more journey(s)`
      );
    }

    if (progress.averageScore < threshold.min) {
      requirementsLeft.push(
        `Achieve ${threshold.min}%+ average score (currently ${progress.averageScore.toFixed(1)}%)`
      );
    }

    if (requirementsLeft.length > 0) {
      return {
        canAdvance: false,
        currentStage,
        nextStage,
        reason: `Complete ${currentStage} mastery requirements to unlock ${nextStage}`,
        requirementsLeft,
      };
    }

    return {
      canAdvance: true,
      currentStage,
      nextStage,
      reason: `Congratulations! You can now advance to ${nextStage}`,
    };
  }

  /**
   * Unlock the next stage for the user
   */
  async unlockNextStage(currentStage: Stage): Promise<boolean> {
    const advancement = await this.checkAdvancement(currentStage);

    if (!advancement.canAdvance || !advancement.nextStage) {
      return false;
    }

    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const unlockedStages = userData.unlockedStages || ['beginner'];

    if (!unlockedStages.includes(advancement.nextStage)) {
      unlockedStages.push(advancement.nextStage);

      await updateDoc(userRef, {
        unlockedStages,
        [`${currentStage}MasteryDate`]: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Award mastery badge
      await this.awardBadge(`${currentStage}-master`);

      return true;
    }

    return false;
  }

  /**
   * Check if user has mastered a stage
   */
  async checkStageMastery(stage: Stage): Promise<boolean> {
    const progress = await this.getStageProgress(stage);
    return progress.isMastered;
  }

  /**
   * Get all earned badges for the user
   */
  async getEarnedBadges(): Promise<Badge[]> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    const userData = userDoc.data();
    const earnedBadgeIds = userData.badges || [];

    return earnedBadgeIds.map((badgeId: string) => {
      const definition = BADGE_DEFINITIONS[badgeId];
      return {
        ...definition,
        earnedAt: userData[`badge_${badgeId}_earnedAt`]?.toDate(),
      };
    });
  }

  /**
   * Get all available badges with progress
   */
  async getAllBadgesWithProgress(): Promise<Badge[]> {
    const earned = await this.getEarnedBadges();
    const earnedIds = new Set(earned.map((b) => b.badgeId));

    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : {};

    const allBadges: Badge[] = Object.values(BADGE_DEFINITIONS).map((def) => {
      if (earnedIds.has(def.badgeId)) {
        return earned.find((b) => b.badgeId === def.badgeId)!;
      }

      // Calculate progress for unearned badges
      let progress = 0;
      let required = 1;

      switch (def.badgeId) {
        case 'first-journey':
          progress = userData.totalJourneysCompleted || 0;
          required = 1;
          break;
        case 'perfect-journey':
          // Check if any journey has 100% score
          progress = userData.perfectJourneys || 0;
          required = 1;
          break;
        case 'streak-7':
          progress = userData.currentStreak || 0;
          required = 7;
          break;
        case 'streak-30':
          progress = userData.currentStreak || 0;
          required = 30;
          break;
        default:
          progress = 0;
          required = 1;
      }

      return {
        ...def,
        progress: Math.min(progress, required),
        required,
      };
    });

    return allBadges;
  }

  /**
   * Award a badge to the user
   */
  async awardBadge(badgeId: string): Promise<boolean> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    const badges = userData.badges || [];

    if (badges.includes(badgeId)) {
      return false; // Already earned
    }

    badges.push(badgeId);

    await updateDoc(userRef, {
      badges,
      [`badge_${badgeId}_earnedAt`]: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return true;
  }

  /**
   * Check and award automatic badges based on user activity
   */
  async checkAndAwardBadges(): Promise<string[]> {
    const userRef = doc(db, 'drivemaster_users', this.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    const userData = userDoc.data();
    const currentBadges = userData.badges || [];
    const newlyAwarded: string[] = [];

    // First Journey
    if (!currentBadges.includes('first-journey') && userData.totalJourneysCompleted >= 1) {
      if (await this.awardBadge('first-journey')) {
        newlyAwarded.push('first-journey');
      }
    }

    // Perfect Journey
    if (!currentBadges.includes('perfect-journey') && userData.perfectJourneys >= 1) {
      if (await this.awardBadge('perfect-journey')) {
        newlyAwarded.push('perfect-journey');
      }
    }

    // Streak badges
    const streak = userData.currentStreak || 0;
    if (!currentBadges.includes('streak-7') && streak >= 7) {
      if (await this.awardBadge('streak-7')) {
        newlyAwarded.push('streak-7');
      }
    }
    if (!currentBadges.includes('streak-30') && streak >= 30) {
      if (await this.awardBadge('streak-30')) {
        newlyAwarded.push('streak-30');
      }
    }

    // All Stages mastered
    if (!currentBadges.includes('all-stages')) {
      const allProgress = await this.getAllStagesProgress();
      const allMastered = allProgress.every((p) => p.isMastered);
      if (allMastered) {
        if (await this.awardBadge('all-stages')) {
          newlyAwarded.push('all-stages');
        }
      }
    }

    return newlyAwarded;
  }

  /**
   * Get weak areas analysis for a stage
   */
  async getWeakAreas(stage: Stage): Promise<{ eventType: string; accuracy: number }[]> {
    const progressRef = collection(db, `drivemaster_users/${this.userId}/progress`);
    const stageQuery = query(progressRef, where('journeyStage', '==', stage));
    const progressDocs = await getDocs(stageQuery);

    const eventStats: Record<string, { correct: number; total: number }> = {};

    progressDocs.forEach((doc) => {
      const attempt = doc.data();
      attempt.events?.forEach((event: any) => {
        const type = event.eventType || 'unknown';
        if (!eventStats[type]) {
          eventStats[type] = { correct: 0, total: 0 };
        }
        eventStats[type].total++;
        if (event.isCorrect) {
          eventStats[type].correct++;
        }
      });
    });

    return Object.entries(eventStats)
      .map(([eventType, stats]) => ({
        eventType,
        accuracy: (stats.correct / stats.total) * 100,
      }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }

  /**
   * Get attempt history for a specific journey
   */
  async getJourneyHistory(journeyId: string): Promise<any[]> {
    const progressRef = collection(db, `drivemaster_users/${this.userId}/progress`);
    const journeyQuery = query(progressRef, where('journeyId', '==', journeyId));
    const progressDocs = await getDocs(journeyQuery);

    return progressDocs.docs
      .map((doc) => {
        const data = doc.data();
        return {
          attemptId: doc.id,
          attemptNumber: data.attemptNumber,
          score: data.score,
          passed: data.passed,
          completedAt: data.completedAt?.toDate(),
          duration: data.duration,
          correctAnswers: data.correctAnswers,
          incorrectAnswers: data.incorrectAnswers,
        };
      })
      .sort((a, b) => b.attemptNumber - a.attemptNumber);
  }
}
