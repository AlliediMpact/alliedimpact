/**
 * P2P Crypto Notification Service
 * 
 * Handles notifications for P2P crypto trading events:
 * - New trade matches
 * - Trade status changes
 * - Payment confirmations
 * - Escrow releases
 * - Trade completions
 */

import { notificationService, Notification } from '@/lib/notification-service';
import { P2PTradeTransaction } from './service';
import { P2PTradeStatus } from '@/lib/p2p-limits';

export class P2PCryptoNotificationService {
  /**
   * Notify user of new trade match
   */
  static async notifyTradeMatch(
    userId: string,
    trade: P2PTradeTransaction
  ): Promise<void> {
    const isSeller = trade.sellerId === userId;
    const counterpartyName = isSeller ? trade.buyerName : trade.sellerName;

    await notificationService.create({
      userId,
      type: 'system',
      title: '🎯 New Trade Match!',
      message: `${counterpartyName} wants to ${isSeller ? 'buy' : 'sell'} ${trade.cryptoAmount} ${trade.asset}`,
      priority: 'high',
      category: 'trades',
      metadata: {
        tradeId: trade.id,
        amount: trade.totalZAR,
        action: 'view_trade',
        link: `/p2p-crypto/trade/${trade.id}`,
      },
    });
  }

  /**
   * Notify about trade status change
   */
  static async notifyTradeStatusChange(
    userId: string,
    trade: P2PTradeTransaction,
    oldStatus: P2PTradeStatus,
    newStatus: P2PTradeStatus
  ): Promise<void> {
    const statusMessages: Record<P2PTradeStatus, { title: string; message: string; priority: 'low' | 'medium' | 'high' }> = {
      'matched': {
        title: '⏳ Trade Matched',
        message: `Your trade for ${trade.cryptoAmount} ${trade.asset} is waiting for acceptance`,
        priority: 'medium',
      },
      'escrowed': {
        title: '✅ Trade Escrowed',
        message: `Trade accepted! Complete payment within 30 minutes`,
        priority: 'high',
      },
      'payment-pending': {
        title: '💳 Payment Pending',
        message: `Waiting for payment confirmation for ${trade.totalZAR} ZAR`,
        priority: 'high',
      },
      'payment-confirmed': {
        title: '📤 Payment Confirmed',
        message: `Payment confirmed. Releasing crypto from escrow`,
        priority: 'medium',
      },
      'active': {
        title: '🔒 Active',
        message: `${trade.cryptoAmount} ${trade.asset} is now being processed`,
        priority: 'medium',
      },
      'completed': {
        title: '🎉 Trade Completed!',
        message: `Successfully traded ${trade.cryptoAmount} ${trade.asset}`,
        priority: 'high',
      },
      'cancelled': {
        title: '❌ Trade Cancelled',
        message: `Trade for ${trade.cryptoAmount} ${trade.asset} was cancelled`,
        priority: 'medium',
      },
      'disputed': {
        title: '⚠️ Trade Disputed',
        message: `A dispute has been filed for this trade. Admin will review.`,
        priority: 'high',
      },
      'expired': {
        title: '⏰ Trade Expired',
        message: `Trade expired due to inactivity`,
        priority: 'low',
      },
    };

    const statusInfo = statusMessages[newStatus];

    await notificationService.create({
      userId,
      type: 'system',
      title: statusInfo.title,
      message: statusInfo.message,
      priority: statusInfo.priority,
      category: 'trades',
      metadata: {
        tradeId: trade.id,
        status: newStatus,
        action: 'view_trade',
        link: `/p2p-crypto/trade/${trade.id}`,
      },
    });
  }

  /**
   * Notify seller about payment submission
   */
  static async notifyPaymentSubmitted(
    sellerId: string,
    trade: P2PTradeTransaction,
    paymentProofUrl: string
  ): Promise<void> {
    await notificationService.create({
      userId: sellerId,
      type: 'system',
      title: '💰 Payment Proof Received',
      message: `${trade.buyerName} submitted payment proof for ${trade.totalZAR} ZAR. Please verify and release crypto.`,
      priority: 'high',
      category: 'transactions',
      metadata: {
        tradeId: trade.id,
        amount: trade.totalZAR,
        imageUrl: paymentProofUrl,
        action: 'verify_payment',
        link: `/p2p-crypto/trade/${trade.id}`,
      },
    });
  }

  /**
   * Notify buyer about crypto release
   */
  static async notifyCryptoReleased(
    buyerId: string,
    trade: P2PTradeTransaction
  ): Promise<void> {
    await notificationService.create({
      userId: buyerId,
      type: 'system',
      title: '✅ Crypto Released!',
      message: `${trade.cryptoAmount} ${trade.asset} has been released from escrow to your wallet`,
      priority: 'high',
      category: 'transactions',
      metadata: {
        tradeId: trade.id,
        amount: trade.cryptoAmount,
        action: 'view_wallet',
        link: '/dashboard/wallet',
      },
    });
  }

  /**
   * Notify about trade expiration warning
   */
  static async notifyTradeExpiring(
    userId: string,
    trade: P2PTradeTransaction,
    minutesLeft: number
  ): Promise<void> {
    await notificationService.create({
      userId,
      // @ts-ignore - trade type mapped to system
      type: 'system',
      title: '⚠️ Trade Expiring Soon',
      message: `Your trade will expire in ${minutesLeft} minutes! Complete payment now.`,
      priority: 'high',
      category: 'trades',
      metadata: {
        tradeId: trade.id,
        action: 'complete_payment',
        link: `/p2p-crypto/trade/${trade.id}`,
      },
    });
  }

  /**
   * Notify about new listing matching user's preferences
   */
  static async notifyMatchingListing(
    userId: string,
    listing: {
      id: string;
      creatorName: string;
      type: 'buy' | 'sell';
      asset: string;
      cryptoAmount: number;
      pricePerUnit: number;
    }
  ): Promise<void> {
    await notificationService.create({
      userId,
      // @ts-ignore - trade type mapped to system
      type: 'system',
      title: '🔔 New Matching Listing',
      message: `${listing.creatorName} wants to ${listing.type} ${listing.cryptoAmount} ${listing.asset} at R${listing.pricePerUnit}`,
      priority: 'medium',
      category: 'trades',
      metadata: {
        action: 'view_listing',
        link: `/p2p-crypto/marketplace`,
      },
    });
  }

  /**
   * Notify about dispute filed
   */
  static async notifyDisputeFiled(
    userId: string,
    trade: P2PTradeTransaction,
    filedBy: string
  ): Promise<void> {
    const isCreator = filedBy === userId;

    await notificationService.create({
      userId,
      type: 'dispute',
      title: '⚠️ Dispute Filed',
      message: isCreator
        ? `Your dispute has been submitted. Admin will review within 24 hours.`
        : `A dispute has been filed against your trade. Please provide evidence.`,
      priority: 'high',
      category: 'disputes',
      metadata: {
        tradeId: trade.id,
        action: 'view_dispute',
        link: `/dashboard/disputes`,
      },
    });
  }

  /**
   * Notify about rating request after trade completion
   */
  static async notifyRatingRequest(
    userId: string,
    trade: P2PTradeTransaction
  ): Promise<void> {
    const counterpartyName = trade.sellerId === userId ? trade.buyerName : trade.sellerName;

    await notificationService.create({
      userId,
      type: 'trade',
      title: '⭐ Rate Your Trade',
      message: `How was your experience trading with ${counterpartyName}?`,
      priority: 'low',
      category: 'trades',
      metadata: {
        tradeId: trade.id,
        action: 'rate_trade',
        link: `/p2p-crypto/trade/${trade.id}/rate`,
      },
    });
  }

  /**
   * Notify about received rating
   */
  static async notifyRatingReceived(
    userId: string,
    rating: number,
    review: string,
    fromUserName: string
  ): Promise<void> {
    const emoji = rating >= 4 ? '⭐' : rating >= 3 ? '👍' : '📝';

    await notificationService.create({
      userId,
      type: 'system',
      title: `${emoji} New Rating Received`,
      message: `${fromUserName} rated you ${rating}/5${review ? `: "${review}"` : ''}`,
      priority: 'low',
      category: 'trades',
      metadata: {
        action: 'view_profile',
        link: '/dashboard/profile',
      },
    });
  }
}

// Export singleton
export const p2pNotifications = P2PCryptoNotificationService;
