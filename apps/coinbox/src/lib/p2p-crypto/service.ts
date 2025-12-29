/**
 * P2P Crypto Trading Service
 * 
 * Handles:
 * - Creating crypto trade listings
 * - Matching buyers and sellers
 * - Escrow management
 * - Fee collection (0.1% to creator)
 * - Trade completion
 * 
 * Does NOT modify:
 * - Existing wallet system
 * - Existing membership tiers
 * - Existing ZAR trading
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
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  P2PCryptoAsset,
  P2PTradeStatus,
  calculateP2PFee,
  validateP2PTrade,
  getP2PLimits,
  P2P_ESCROW_CONFIG,
} from '@/lib/p2p-limits';
import { MembershipTierType } from '@/lib/membership-tiers';
import { savingsJarService } from '@/lib/savings-jar-service';
import { isFeatureEnabled } from '@/lib/features';

/**
 * P2P Crypto Trade Listing
 */
export interface P2PCryptoListing {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorTier: MembershipTierType;
  type: 'buy' | 'sell';
  asset: P2PCryptoAsset;
  cryptoAmount: number;
  pricePerUnit: number;
  totalZAR: number;
  fee: number;
  paymentMethod: string;
  terms: string;
  status: P2PTradeStatus;
  createdAt: Date;
}

/**
 * P2P Trade Transaction
 */
export interface P2PTradeTransaction {
  id: string;
  listingId: string;
  sellerId: string;
  sellerName: string;
  sellerTier: MembershipTierType;
  buyerId: string;
  buyerName: string;
  buyerTier: MembershipTierType;
  asset: P2PCryptoAsset;
  cryptoAmount: number;
  pricePerUnit: number;
  totalZAR: number;
  fee: number;
  paymentMethod: string;
  terms: string;
  status: P2PTradeStatus;
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
}

/**
 * P2P Crypto Trading Service
 */
export class P2PCryptoService {
  private static LISTINGS_COLLECTION = 'p2p_crypto_listings';
  private static TRANSACTIONS_COLLECTION = 'p2p_crypto_transactions';
  private static STATS_COLLECTION = 'p2p_crypto_stats';
  private static ESCROW_COLLECTION = 'p2p_crypto_escrow';
  private static FEES_COLLECTION = 'p2p_crypto_fees';

  /**
   * Create a new P2P crypto listing
   */
  static async createListing(params: {
    userId: string;
    userName: string;
    userTier: MembershipTierType;
    type: 'buy' | 'sell';
    asset: P2PCryptoAsset;
    cryptoAmount: number;
    pricePerUnit: number;
    paymentMethod: string;
    terms?: string;
  }): Promise<{ success: boolean; listingId?: string; error?: string }> {
    try {
      const totalZAR = params.cryptoAmount * params.pricePerUnit;
      const fee = calculateP2PFee(totalZAR);

      // Get user stats
      const statsRef = doc(db, this.STATS_COLLECTION, params.userId);
      const statsDoc = await getDoc(statsRef);
      const stats = statsDoc.exists() ? statsDoc.data() : { weeklyVolume: 0, activeListings: 0 };

      // Validate trade
      const validation = validateP2PTrade({
        tier: params.userTier,
        tradeAmount: totalZAR,
        currentWeeklyVolume: stats.weeklyVolume || 0,
        activeListingsCount: stats.activeListings || 0,
      });

      if (!validation.allowed) {
        return {
          success: false,
          error: validation.reason,
        };
      }

      // Create listing
      const listing = {
        creatorId: params.userId,
        creatorName: params.userName,
        creatorTier: params.userTier,
        type: params.type,
        asset: params.asset,
        cryptoAmount: params.cryptoAmount,
        pricePerUnit: params.pricePerUnit,
        totalZAR,
        fee,
        paymentMethod: params.paymentMethod,
        terms: params.terms || '',
        status: 'active' as P2PTradeStatus,
        createdAt: new Date(),
      };

      const listingRef = await addDoc(collection(db, this.LISTINGS_COLLECTION), listing);
      const listingId = listingRef.id;

      // Update user stats
      await this.incrementActiveListings(params.userId);

      return {
        success: true,
        listingId,
      };
    } catch (error) {
      console.error('Error creating listing:', error);
      return {
        success: false,
        error: 'Failed to create listing',
      };
    }
  }

  /**
   * Match with a listing (buyer accepts seller's offer)
   */
  static async matchWithListing(params: {
    listingId: string;
    userId: string;
    userName: string;
    userTier: MembershipTierType;
  }): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Get listing
      const listingRef = doc(db, this.LISTINGS_COLLECTION, params.listingId);
      const listingDoc = await getDoc(listingRef);

      if (!listingDoc.exists()) {
        return { success: false, error: 'Listing not found' };
      }

      const listing = { id: listingDoc.id, ...listingDoc.data() } as P2PCryptoListing;

      if (listing.status !== 'active') {
        return { success: false, error: 'Listing is no longer active' };
      }

      if (listing.creatorId === params.userId) {
        return { success: false, error: 'Cannot accept your own listing' };
      }

      // Get buyer stats
      const statsRef = doc(db, this.STATS_COLLECTION, params.userId);
      const statsDoc = await getDoc(statsRef);
      const stats = statsDoc.exists() ? statsDoc.data() : { weeklyVolume: 0, activeListings: 0 };

      // Validate buyer's limits
      const validation = validateP2PTrade({
        tier: params.userTier,
        tradeAmount: listing.totalZAR,
        currentWeeklyVolume: stats.weeklyVolume || 0,
        activeListingsCount: stats.activeListings || 0,
      });

      if (!validation.allowed) {
        return { success: false, error: validation.reason };
      }

      // Calculate expiry time
      const expiryTime = new Date(Date.now() + P2P_ESCROW_CONFIG.timeoutMinutes * 60 * 1000);

      // Create transaction
      const transaction = {
        listingId: params.listingId,
        sellerId: listing.creatorId,
        sellerName: listing.creatorName,
        sellerTier: listing.creatorTier,
        buyerId: params.userId,
        buyerName: params.userName,
        buyerTier: params.userTier,
        asset: listing.asset,
        cryptoAmount: listing.cryptoAmount,
        pricePerUnit: listing.pricePerUnit,
        totalZAR: listing.totalZAR,
        fee: listing.fee,
        paymentMethod: listing.paymentMethod,
        terms: listing.terms,
        status: 'escrowed' as P2PTradeStatus,
        createdAt: new Date(),
        expiresAt: expiryTime,
      };

      const transactionRef = await addDoc(collection(db, this.TRANSACTIONS_COLLECTION), transaction);
      const transactionId = transactionRef.id;

      // Create escrow wallet
      await this.createEscrowWallet({
        transactionId,
        sellerId: listing.creatorId,
        buyerId: params.userId,
        asset: listing.asset,
        cryptoAmount: listing.cryptoAmount,
        expiresAt: expiryTime,
      });

      // Update listing status
      await updateDoc(listingRef, {
        status: 'matched',
      });

      return {
        success: true,
        transactionId,
      };
    } catch (error) {
      console.error('Error matching listing:', error);
      return {
        success: false,
        error: 'Failed to match listing',
      };
    }
  }

  /**
   * Buyer confirms payment has been sent
   */
  static async confirmPayment(params: {
    transactionId: string;
    userId: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const transactionRef = doc(db, this.TRANSACTIONS_COLLECTION, params.transactionId);
      const transactionDoc = await getDoc(transactionRef);

      if (!transactionDoc.exists()) {
        return { success: false, error: 'Transaction not found' };
      }

      const transaction = transactionDoc.data() as P2PTradeTransaction;

      if (transaction.buyerId !== params.userId) {
        return { success: false, error: 'Unauthorized' };
      }

      if (transaction.status !== 'escrowed') {
        return { success: false, error: 'Invalid transaction status' };
      }

      await updateDoc(transactionRef, {
        status: 'payment-confirmed',
      });

      return { success: true };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: 'Failed to confirm payment',
      };
    }
  }

  /**
   * Seller releases crypto to buyer
   */
  static async releaseCrypto(params: {
    transactionId: string;
    userId: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const transactionRef = doc(db, this.TRANSACTIONS_COLLECTION, params.transactionId);
      const transactionDoc = await getDoc(transactionRef);

      if (!transactionDoc.exists()) {
        return { success: false, error: 'Transaction not found' };
      }

      const transaction = transactionDoc.data() as P2PTradeTransaction;

      if (transaction.sellerId !== params.userId) {
        return { success: false, error: 'Unauthorized' };
      }

      if (transaction.status !== 'payment-confirmed') {
        return { success: false, error: 'Payment not yet confirmed' };
      }

      // Release escrow to buyer
      await this.releaseEscrowToBuyer(params.transactionId);

      // Collect fee
      await this.collectFee(transaction.sellerId, transaction.fee, params.transactionId);

      // Update transaction
      await updateDoc(transactionRef, {
        status: 'completed',
        completedAt: new Date(),
      });

      // Update stats for both users
      await this.updateStatsAfterCompletion(
        transaction.sellerId,
        transaction.buyerId,
        transaction.totalZAR
      );

      // Auto-deposit seller's profit to Savings Jar if feature is enabled
      if (isFeatureEnabled('SAVINGS_JAR')) {
        try {
          // Calculate seller's profit (proceeds minus fee)
          const sellerProceeds = transaction.totalZAR - transaction.fee;
          
          // Note: In a real scenario, you'd track the seller's cost basis
          // For now, we'll deposit 1% of the total proceeds as a conservative estimate
          // This should be replaced with actual profit calculation when cost basis is tracked
          
          const operationId = savingsJarService.generateOperationId(
            transaction.sellerId,
            'auto_save_crypto'
          );
          
          await savingsJarService.autoDeposit(
            transaction.sellerId,
            sellerProceeds,
            'crypto_profit',
            operationId,
            {
              transactionId: params.transactionId,
              cryptocurrency: transaction.cryptocurrency,
              amount: sellerProceeds
            }
          );
        } catch (savingsError) {
          console.error('Error auto-depositing to Savings Jar:', savingsError);
          // Don't fail the trade completion if savings deposit fails
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error releasing crypto:', error);
      return {
        success: false,
        error: 'Failed to release crypto',
      };
    }
  }

  /**
   * Cancel a trade and return escrow
   */
  static async cancelTrade(params: {
    transactionId: string;
    userId: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const transactionRef = doc(db, this.TRANSACTIONS_COLLECTION, params.transactionId);
      const transactionDoc = await getDoc(transactionRef);

      if (!transactionDoc.exists()) {
        return { success: false, error: 'Transaction not found' };
      }

      const transaction = transactionDoc.data() as P2PTradeTransaction;

      // Only buyer or seller can cancel
      if (transaction.buyerId !== params.userId && transaction.sellerId !== params.userId) {
        return { success: false, error: 'Unauthorized' };
      }

      // Can only cancel if not completed
      if (transaction.status === 'completed') {
        return { success: false, error: 'Cannot cancel completed trade' };
      }

      // Return escrow to seller
      await this.returnEscrowToSeller(params.transactionId);

      // Update transaction
      await updateDoc(transactionRef, {
        status: 'cancelled',
      });

      return { success: true };
    } catch (error) {
      console.error('Error cancelling trade:', error);
      return {
        success: false,
        error: 'Failed to cancel trade',
      };
    }
  }

  /**
   * Get active listings with filters
   */
  static async getActiveListings(filters?: {
    asset?: P2PCryptoAsset;
    type?: 'buy' | 'sell';
    limit?: number;
  }): Promise<{ success: boolean; listings?: P2PCryptoListing[]; error?: string }> {
    try {
      let q = query(
        collection(db, this.LISTINGS_COLLECTION),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      if (filters?.asset) {
        q = query(q, where('asset', '==', filters.asset));
      }

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as P2PCryptoListing[];

      return {
        success: true,
        listings,
      };
    } catch (error) {
      console.error('Error getting listings:', error);
      return {
        success: false,
        error: 'Failed to get listings',
      };
    }
  }

  /**
   * Get user's listings
   */
  static async getUserListings(userId: string): Promise<{
    success: boolean;
    listings?: P2PCryptoListing[];
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, this.LISTINGS_COLLECTION),
        where('creatorId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as P2PCryptoListing[];

      return {
        success: true,
        listings,
      };
    } catch (error) {
      console.error('Error getting user listings:', error);
      return {
        success: false,
        error: 'Failed to get user listings',
      };
    }
  }

  /**
   * Get user's transactions
   */
  static async getUserTransactions(userId: string): Promise<{
    success: boolean;
    transactions?: P2PTradeTransaction[];
    error?: string;
  }> {
    try {
      // Get transactions where user is buyer or seller
      const buyerQuery = query(
        collection(db, this.TRANSACTIONS_COLLECTION),
        where('buyerId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const sellerQuery = query(
        collection(db, this.TRANSACTIONS_COLLECTION),
        where('sellerId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const [buyerSnapshot, sellerSnapshot] = await Promise.all([
        getDocs(buyerQuery),
        getDocs(sellerQuery),
      ]);

      const buyerTransactions = buyerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as P2PTradeTransaction[];

      const sellerTransactions = sellerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as P2PTradeTransaction[];

      // Combine and sort
      const allTransactions = [...buyerTransactions, ...sellerTransactions].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      return {
        success: true,
        transactions: allTransactions,
      };
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return {
        success: false,
        error: 'Failed to get user transactions',
      };
    }
  }

  /**
   * Get user stats
   */
  private static async getUserStats(userId: string) {
    const statsRef = doc(db, this.STATS_COLLECTION, userId);
    const statsDoc = await getDoc(statsRef);

    if (!statsDoc.exists()) {
      // Initialize stats
      const initialStats = {
        userId,
        totalTrades: 0,
        completedTrades: 0,
        totalVolume: 0,
        weeklyVolume: 0,
        activeListings: 0,
        successRate: 100,
        createdAt: new Date(),
      };
      await setDoc(statsRef, initialStats);
      return initialStats;
    }

    return statsDoc.data();
  }

  /**
   * Create escrow wallet
   */
  private static async createEscrowWallet(params: {
    transactionId: string;
    sellerId: string;
    buyerId: string;
    asset: P2PCryptoAsset;
    cryptoAmount: number;
    expiresAt: Date;
  }) {
    const escrowData = {
      transactionId: params.transactionId,
      sellerId: params.sellerId,
      buyerId: params.buyerId,
      asset: params.asset,
      amount: params.cryptoAmount,
      status: 'locked',
      createdAt: new Date(),
      expiresAt: params.expiresAt,
    };

    await addDoc(collection(db, this.ESCROW_COLLECTION), escrowData);
  }

  /**
   * Release escrow to buyer
   */
  private static async releaseEscrowToBuyer(transactionId: string) {
    const q = query(
      collection(db, this.ESCROW_COLLECTION),
      where('transactionId', '==', transactionId)
    );

    const snapshot = await getDocs(q);

    for (const docSnapshot of snapshot.docs) {
      await updateDoc(doc(db, this.ESCROW_COLLECTION, docSnapshot.id), {
        status: 'released',
        releasedAt: new Date(),
      });
    }
  }

  /**
   * Return escrow to seller
   */
  private static async returnEscrowToSeller(transactionId: string) {
    const q = query(
      collection(db, this.ESCROW_COLLECTION),
      where('transactionId', '==', transactionId)
    );

    const snapshot = await getDocs(q);

    for (const docSnapshot of snapshot.docs) {
      await updateDoc(doc(db, this.ESCROW_COLLECTION, docSnapshot.id), {
        status: 'returned',
        returnedAt: new Date(),
      });
    }
  }

  /**
   * Collect trading fee
   */
  private static async collectFee(userId: string, amount: number, transactionId: string) {
    const feeData = {
      userId,
      transactionId,
      amount,
      createdAt: new Date(),
    };

    await addDoc(collection(db, this.FEES_COLLECTION), feeData);
  }

  /**
   * Increment user's active listings count
   */
  private static async incrementActiveListings(userId: string) {
    const statsRef = doc(db, this.STATS_COLLECTION, userId);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      const currentCount = statsDoc.data().activeListings || 0;
      await updateDoc(statsRef, {
        activeListings: currentCount + 1,
      });
    } else {
      await setDoc(statsRef, {
        userId,
        totalTrades: 0,
        completedTrades: 0,
        totalVolume: 0,
        weeklyVolume: 0,
        activeListings: 1,
        successRate: 100,
        createdAt: new Date(),
      });
    }
  }

  /**
   * Update stats after trade completion
   */
  private static async updateStatsAfterCompletion(
    sellerId: string,
    buyerId: string,
    tradeAmount: number
  ) {
    // Update seller stats
    const sellerStatsRef = doc(db, this.STATS_COLLECTION, sellerId);
    const sellerStatsDoc = await getDoc(sellerStatsRef);

    if (sellerStatsDoc.exists()) {
      const sellerStats = sellerStatsDoc.data();
      await updateDoc(sellerStatsRef, {
        totalTrades: (sellerStats.totalTrades || 0) + 1,
        completedTrades: (sellerStats.completedTrades || 0) + 1,
        totalVolume: (sellerStats.totalVolume || 0) + tradeAmount,
        weeklyVolume: (sellerStats.weeklyVolume || 0) + tradeAmount,
        activeListings: Math.max(0, (sellerStats.activeListings || 0) - 1),
      });
    }

    // Update buyer stats
    const buyerStatsRef = doc(db, this.STATS_COLLECTION, buyerId);
    const buyerStatsDoc = await getDoc(buyerStatsRef);

    if (buyerStatsDoc.exists()) {
      const buyerStats = buyerStatsDoc.data();
      await updateDoc(buyerStatsRef, {
        totalTrades: (buyerStats.totalTrades || 0) + 1,
        completedTrades: (buyerStats.completedTrades || 0) + 1,
        totalVolume: (buyerStats.totalVolume || 0) + tradeAmount,
        weeklyVolume: (buyerStats.weeklyVolume || 0) + tradeAmount,
      });
    }
  }
}
