/**
 * Journey Attempt Service
 * Manages storing and retrieving journey attempt records
 */

import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

export interface JourneyAttempt {
  attemptId: string;
  userId: string;
  journeyId: string;
  journeyName: string;
  stage: string;
  score: number;
  masteryRequired: number;
  correctAnswers: number;
  totalQuestions: number;
  startedAt: Date;
  completedAt: Date | null;
  certificateId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class JourneyAttemptService {
  private collectionPath = 'journeyAttempts';

  /**
   * Create a new journey attempt record
   */
  async createAttempt(data: Omit<JourneyAttempt, 'attemptId' | 'createdAt' | 'updatedAt'>): Promise<JourneyAttempt> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, this.collectionPath), {
        ...data,
        startedAt: Timestamp.fromDate(data.startedAt),
        completedAt: data.completedAt ? Timestamp.fromDate(data.completedAt) : null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
      });

      return {
        attemptId: docRef.id,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      console.error('Error creating journey attempt:', error);
      throw error;
    }
  }

  /**
   * Get all attempts for a specific user
   */
  async getUserAttempts(userId: string): Promise<JourneyAttempt[]> {
    try {
      const q = query(
        collection(db, this.collectionPath),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const attempts: JourneyAttempt[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        attempts.push({
          attemptId: doc.id,
          userId: data.userId,
          journeyId: data.journeyId,
          journeyName: data.journeyName,
          stage: data.stage,
          score: data.score,
          masteryRequired: data.masteryRequired,
          correctAnswers: data.correctAnswers,
          totalQuestions: data.totalQuestions,
          startedAt: data.startedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || null,
          certificateId: data.certificateId || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return attempts;
    } catch (error) {
      console.error('Error fetching user attempts:', error);
      throw error;
    }
  }

  /**
   * Get attempts for a specific journey
   */
  async getJourneyAttempts(journeyId: string): Promise<JourneyAttempt[]> {
    try {
      const q = query(
        collection(db, this.collectionPath),
        where('journeyId', '==', journeyId)
      );

      const snapshot = await getDocs(q);
      const attempts: JourneyAttempt[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        attempts.push({
          attemptId: doc.id,
          userId: data.userId,
          journeyId: data.journeyId,
          journeyName: data.journeyName,
          stage: data.stage,
          score: data.score,
          masteryRequired: data.masteryRequired,
          correctAnswers: data.correctAnswers,
          totalQuestions: data.totalQuestions,
          startedAt: data.startedAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate() || null,
          certificateId: data.certificateId || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return attempts;
    } catch (error) {
      console.error('Error fetching journey attempts:', error);
      throw error;
    }
  }

  /**
   * Update attempt by ID
   */
  async updateAttempt(attemptId: string, data: Partial<JourneyAttempt>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionPath, attemptId);
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Convert Date objects to Timestamps
      if (data.startedAt) {
        updateData.startedAt = Timestamp.fromDate(data.startedAt);
      }
      if (data.completedAt) {
        updateData.completedAt = Timestamp.fromDate(data.completedAt);
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating journey attempt:', error);
      throw error;
    }
  }

  /**
   * Calculate attempt statistics for a user
   */
  async getUserStatistics(userId: string) {
    try {
      const attempts = await this.getUserAttempts(userId);

      const stats = {
        totalAttempts: attempts.length,
        passedAttempts: attempts.filter((a) => a.score >= a.masteryRequired).length,
        failedAttempts: attempts.filter((a) => a.score < a.masteryRequired).length,
        averageScore: attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
          : 0,
        totalTimeMinutes: attempts.reduce((sum, a) => {
          if (a.completedAt && a.startedAt) {
            return sum + (a.completedAt.getTime() - a.startedAt.getTime()) / 60000;
          }
          return sum;
        }, 0),
      };

      return stats;
    } catch (error) {
      console.error('Error calculating user statistics:', error);
      throw error;
    }
  }
}
