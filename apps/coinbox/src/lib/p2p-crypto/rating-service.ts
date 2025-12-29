/**
 * User Rating & Review System for P2P Trades
 * 
 * Handles:
 * - User ratings (1-5 stars)
 * - Trade reviews
 * - Reputation scores
 * - Rating statistics
 * - Verified trader badges
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
  orderBy,
  limit,
  getDocs,
  Timestamp,
  increment,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

export interface TradeRating {
  id?: string;
  tradeId: string;
  raterId: string;  // User who gave the rating
  raterName: string;
  ratedUserId: string;  // User being rated
  ratedUserName: string;
  rating: number;  // 1-5 stars
  review?: string;
  categories?: {
    communication?: number;  // 1-5
    reliability?: number;    // 1-5
    speed?: number;          // 1-5
  };
  tradeType: 'buy' | 'sell';
  asset: string;
  amount: number;
  createdAt: Timestamp | Date;
  helpful?: number;  // How many found this review helpful
  flagged?: boolean;
}

export interface UserReputation {
  userId: string;
  username: string;
  
  // Overall statistics
  totalRatings: number;
  averageRating: number;
  
  // Category breakdowns
  communicationRating: number;
  reliabilityRating: number;
  speedRating: number;
  
  // Trade counts
  totalTrades: number;
  completedTrades: number;
  cancelledTrades: number;
  disputedTrades: number;
  
  // Completion rates
  completionRate: number;  // percentage
  responseTime: number;    // average minutes
  
  // Badges
  badges: ('verified' | 'top_trader' | 'fast_trader' | 'trusted' | 'new')[];
  
  // Volume
  totalVolume: number;  // Total ZAR traded
  
  updatedAt: Timestamp | Date;
}

/**
 * Rating & Reputation Service
 */
export class RatingService {
  private static RATINGS_COLLECTION = 'p2p_ratings';
  private static REPUTATION_COLLECTION = 'p2p_reputation';

  /**
   * Submit a rating for a completed trade
   */
  static async submitRating(
    ratingData: Omit<TradeRating, 'id' | 'createdAt' | 'helpful' | 'flagged'>
  ): Promise<string> {
    // Validate rating
    if (ratingData.rating < 1 || ratingData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if rating already exists
    const existingQuery = query(
      collection(db, this.RATINGS_COLLECTION),
      where('tradeId', '==', ratingData.tradeId),
      where('raterId', '==', ratingData.raterId)
    );
    const existingRatings = await getDocs(existingQuery);
    
    if (!existingRatings.empty) {
      throw new Error('You have already rated this trade');
    }

    // Create rating
    const ratingRef = doc(collection(db, this.RATINGS_COLLECTION));
    const rating: TradeRating = {
      ...ratingData,
      createdAt: serverTimestamp() as Timestamp,
      helpful: 0,
      flagged: false,
    };

    await setDoc(ratingRef, rating);

    // Update user reputation
    await this.updateUserReputation(ratingData.ratedUserId);

    return ratingRef.id;
  }

  /**
   * Get ratings for a user
   */
  static async getUserRatings(
    userId: string,
    limitCount: number = 20
  ): Promise<TradeRating[]> {
    const ratingsQuery = query(
      collection(db, this.RATINGS_COLLECTION),
      where('ratedUserId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(ratingsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as TradeRating[];
  }

  /**
   * Get user's reputation score
   */
  static async getUserReputation(userId: string): Promise<UserReputation | null> {
    const reputationRef = doc(db, this.REPUTATION_COLLECTION, userId);
    const reputationDoc = await getDoc(reputationRef);

    if (!reputationDoc.exists()) {
      return null;
    }

    return {
      ...reputationDoc.data(),
      userId: reputationDoc.id,
      updatedAt: reputationDoc.data().updatedAt?.toDate() || new Date(),
    } as UserReputation;
  }

  /**
   * Update user reputation based on their ratings
   */
  static async updateUserReputation(userId: string): Promise<void> {
    // Get all ratings for this user
    const ratingsQuery = query(
      collection(db, this.RATINGS_COLLECTION),
      where('ratedUserId', '==', userId)
    );
    const ratingsSnapshot = await getDocs(ratingsQuery);
    const ratings = ratingsSnapshot.docs.map(doc => doc.data() as TradeRating);

    if (ratings.length === 0) {
      return;
    }

    // Calculate statistics
    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    
    const commRatings = ratings.filter(r => r.categories?.communication).length;
    const communicationRating = commRatings > 0
      ? ratings.reduce((sum, r) => sum + (r.categories?.communication || 0), 0) / commRatings
      : 0;
    
    const relRatings = ratings.filter(r => r.categories?.reliability).length;
    const reliabilityRating = relRatings > 0
      ? ratings.reduce((sum, r) => sum + (r.categories?.reliability || 0), 0) / relRatings
      : 0;
    
    const speedRatings = ratings.filter(r => r.categories?.speed).length;
    const speedRating = speedRatings > 0
      ? ratings.reduce((sum, r) => sum + (r.categories?.speed || 0), 0) / speedRatings
      : 0;

    // Get trade statistics
    const tradesQuery = query(
      collection(db, 'p2p_crypto_transactions'),
      where('participants', 'array-contains', userId)
    );
    const tradesSnapshot = await getDocs(tradesQuery);
    const trades = tradesSnapshot.docs.map(doc => doc.data());

    const totalTrades = trades.length;
    const completedTrades = trades.filter(t => t.status === 'completed').length;
    const cancelledTrades = trades.filter(t => t.status === 'cancelled').length;
    const disputedTrades = trades.filter(t => t.status === 'disputed').length;
    const completionRate = totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 0;
    const totalVolume = trades.reduce((sum, t) => sum + (t.totalZAR || 0), 0);

    // Calculate response time (mock for now)
    const responseTime = 15; // TODO: Calculate actual response time

    // Determine badges
    const badges: UserReputation['badges'] = [];
    if (totalTrades < 5) badges.push('new');
    if (completedTrades >= 100) badges.push('top_trader');
    if (averageRating >= 4.5 && totalRatings >= 10) badges.push('trusted');
    if (speedRating >= 4.5 && speedRatings >= 5) badges.push('fast_trader');
    if (completedTrades >= 10 && completionRate >= 95) badges.push('verified');

    // Get username
    const userDoc = await getDoc(doc(db, 'users', userId));
    const username = userDoc.exists() ? userDoc.data().displayName || 'Unknown' : 'Unknown';

    // Update reputation document
    const reputation: UserReputation = {
      userId,
      username,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      communicationRating: Math.round(communicationRating * 10) / 10,
      reliabilityRating: Math.round(reliabilityRating * 10) / 10,
      speedRating: Math.round(speedRating * 10) / 10,
      totalTrades,
      completedTrades,
      cancelledTrades,
      disputedTrades,
      completionRate: Math.round(completionRate * 10) / 10,
      responseTime,
      badges,
      totalVolume,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const reputationRef = doc(db, this.REPUTATION_COLLECTION, userId);
    await setDoc(reputationRef, reputation, { merge: true });
  }

  /**
   * Mark a review as helpful
   */
  static async markReviewHelpful(ratingId: string): Promise<void> {
    const ratingRef = doc(db, this.RATINGS_COLLECTION, ratingId);
    await updateDoc(ratingRef, {
      helpful: increment(1),
    });
  }

  /**
   * Flag a review as inappropriate
   */
  static async flagReview(ratingId: string): Promise<void> {
    const ratingRef = doc(db, this.RATINGS_COLLECTION, ratingId);
    await updateDoc(ratingRef, {
      flagged: true,
    });
  }

  /**
   * Get top-rated users
   */
  static async getTopRatedUsers(limitCount: number = 10): Promise<UserReputation[]> {
    const reputationQuery = query(
      collection(db, this.REPUTATION_COLLECTION),
      where('totalRatings', '>=', 5),
      orderBy('totalRatings', 'desc'),
      orderBy('averageRating', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(reputationQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      userId: doc.id,
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as UserReputation[];
  }

  /**
   * Check if user can be rated for a trade
   */
  static async canRateTrade(tradeId: string, raterId: string): Promise<boolean> {
    // Check if trade is completed
    const tradeRef = doc(db, 'p2p_crypto_transactions', tradeId);
    const tradeDoc = await getDoc(tradeRef);
    
    if (!tradeDoc.exists() || tradeDoc.data().status !== 'completed') {
      return false;
    }

    // Check if already rated
    const ratingQuery = query(
      collection(db, this.RATINGS_COLLECTION),
      where('tradeId', '==', tradeId),
      where('raterId', '==', raterId)
    );
    const existingRatings = await getDocs(ratingQuery);

    return existingRatings.empty;
  }

  /**
   * Get rating statistics for display
   */
  static async getRatingStats(userId: string): Promise<{
    distribution: Record<number, number>;
    recentTrend: 'up' | 'down' | 'stable';
    percentageRecommend: number;
  }> {
    const ratings = await this.getUserRatings(userId, 100);

    // Rating distribution
    const distribution: Record<number, number> = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
    };
    ratings.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    // Recent trend (last 10 vs previous 10)
    const recent10 = ratings.slice(0, 10);
    const previous10 = ratings.slice(10, 20);
    const recentAvg = recent10.reduce((sum, r) => sum + r.rating, 0) / recent10.length;
    const previousAvg = previous10.length > 0 
      ? previous10.reduce((sum, r) => sum + r.rating, 0) / previous10.length 
      : recentAvg;
    
    const recentTrend = recentAvg > previousAvg + 0.2 ? 'up' 
      : recentAvg < previousAvg - 0.2 ? 'down' 
      : 'stable';

    // Percentage who would recommend (4-5 star ratings)
    const recommendCount = ratings.filter(r => r.rating >= 4).length;
    const percentageRecommend = ratings.length > 0 
      ? Math.round((recommendCount / ratings.length) * 100) 
      : 0;

    return {
      distribution,
      recentTrend,
      percentageRecommend,
    };
  }
}

// Export singleton
export const ratingService = RatingService;
