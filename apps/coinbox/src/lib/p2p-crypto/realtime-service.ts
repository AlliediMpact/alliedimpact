/**
 * P2P Crypto Real-Time Service
 * 
 * Provides real-time updates for P2P crypto trades using Firestore listeners
 * Handles:
 * - Live trade status updates
 * - New listing notifications
 * - Trade matching events
 * - Escrow status changes
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { P2PCryptoListing, P2PTradeTransaction } from './service';

export type TradeUpdateCallback = (trades: P2PTradeTransaction[]) => void;
export type ListingUpdateCallback = (listings: P2PCryptoListing[]) => void;
export type TradeStatusCallback = (trade: P2PTradeTransaction) => void;

/**
 * P2P Crypto Real-Time Service
 */
export class P2PCryptoRealtimeService {
  private static instance: P2PCryptoRealtimeService;
  private listeners: Map<string, Unsubscribe> = new Map();

  private constructor() {}

  static getInstance(): P2PCryptoRealtimeService {
    if (!P2PCryptoRealtimeService.instance) {
      P2PCryptoRealtimeService.instance = new P2PCryptoRealtimeService();
    }
    return P2PCryptoRealtimeService.instance;
  }

  /**
   * Subscribe to real-time updates for active trades
   */
  subscribeToUserTrades(
    userId: string,
    callback: TradeUpdateCallback
  ): Unsubscribe {
    const listenerId = `user-trades-${userId}`;
    
    // Unsubscribe if already listening
    this.unsubscribe(listenerId);

    // Create query for user's active trades
    const tradesRef = collection(db, 'p2p_crypto_transactions');
    const q = query(
      tradesRef,
      where('status', 'in', ['pending', 'payment_pending', 'payment_submitted', 'in_escrow']),
      where('participants', 'array-contains', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const trades = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          expiresAt: doc.data().expiresAt?.toDate() || new Date(),
          completedAt: doc.data().completedAt?.toDate(),
        })) as P2PTradeTransaction[];

        callback(trades);
      },
      (error) => {
        console.error('Error in user trades listener:', error);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to real-time updates for a specific trade
   */
  subscribeToTrade(
    tradeId: string,
    callback: TradeStatusCallback
  ): Unsubscribe {
    const listenerId = `trade-${tradeId}`;
    
    this.unsubscribe(listenerId);

    const tradeRef = doc(db, 'p2p_crypto_transactions', tradeId);
    
    const unsubscribe = onSnapshot(
      tradeRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const trade = {
            id: snapshot.id,
            ...snapshot.data(),
            createdAt: snapshot.data().createdAt?.toDate() || new Date(),
            expiresAt: snapshot.data().expiresAt?.toDate() || new Date(),
            completedAt: snapshot.data().completedAt?.toDate(),
          } as P2PTradeTransaction;

          callback(trade);
        }
      },
      (error) => {
        console.error('Error in trade listener:', error);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to real-time marketplace listings
   */
  subscribeToMarketplace(
    filters: {
      asset?: string;
      type?: 'buy' | 'sell';
      minPrice?: number;
      maxPrice?: number;
    },
    callback: ListingUpdateCallback
  ): Unsubscribe {
    const listenerId = `marketplace-${JSON.stringify(filters)}`;
    
    this.unsubscribe(listenerId);

    const listingsRef = collection(db, 'p2p_crypto_listings');
    let q = query(
      listingsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    // Add filters
    if (filters.asset) {
      q = query(q, where('asset', '==', filters.asset));
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        let listings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as P2PCryptoListing[];

        // Apply price filters (client-side)
        if (filters.minPrice) {
          listings = listings.filter(l => l.pricePerUnit >= filters.minPrice!);
        }
        if (filters.maxPrice) {
          listings = listings.filter(l => l.pricePerUnit <= filters.maxPrice!);
        }

        callback(listings);
      },
      (error) => {
        console.error('Error in marketplace listener:', error);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to new listings for a specific asset
   */
  subscribeToNewListings(
    asset: string,
    callback: (listing: P2PCryptoListing) => void
  ): Unsubscribe {
    const listenerId = `new-listings-${asset}`;
    
    this.unsubscribe(listenerId);

    const listingsRef = collection(db, 'p2p_crypto_listings');
    const q = query(
      listingsRef,
      where('asset', '==', asset),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    let isFirstSnapshot = true;

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // Skip first snapshot to avoid showing all existing listings
        if (isFirstSnapshot) {
          isFirstSnapshot = false;
          return;
        }

        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const listing = {
              id: change.doc.id,
              ...change.doc.data(),
              createdAt: change.doc.data().createdAt?.toDate() || new Date(),
            } as P2PCryptoListing;

            callback(listing);
          }
        });
      },
      (error) => {
        console.error('Error in new listings listener:', error);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to trade matches for user's listings
   */
  subscribeToTradeMatches(
    userId: string,
    callback: (trade: P2PTradeTransaction) => void
  ): Unsubscribe {
    const listenerId = `trade-matches-${userId}`;
    
    this.unsubscribe(listenerId);

    const tradesRef = collection(db, 'p2p_crypto_transactions');
    const q = query(
      tradesRef,
      where('sellerId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    let isFirstSnapshot = true;

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        if (isFirstSnapshot) {
          isFirstSnapshot = false;
          return;
        }

        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const trade = {
              id: change.doc.id,
              ...change.doc.data(),
              createdAt: change.doc.data().createdAt?.toDate() || new Date(),
              expiresAt: change.doc.data().expiresAt?.toDate() || new Date(),
            } as P2PTradeTransaction;

            callback(trade);
          }
        });
      },
      (error) => {
        console.error('Error in trade matches listener:', error);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Unsubscribe from a specific listener
   */
  unsubscribe(listenerId: string): void {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  /**
   * Unsubscribe from all listeners
   */
  unsubscribeAll(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  /**
   * Get count of active listeners
   */
  getActiveListenerCount(): number {
    return this.listeners.size;
  }
}

// Export singleton instance
export const p2pRealtimeService = P2PCryptoRealtimeService.getInstance();
