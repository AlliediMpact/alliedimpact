/**
 * P2P Crypto Trade Actions
 * 
 * Quick actions for trade management:
 * - Accept trade
 * - Reject trade
 * - Submit payment
 * - Confirm payment received
 * - Release crypto from escrow
 * - Cancel trade
 * - File dispute
 */

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { P2PTradeTransaction } from './service';
import { p2pNotifications } from './notification-service';
import { messagingService } from '@/lib/messaging-service';

export class P2PTradeActions {
  /**
   * Accept a pending trade (seller accepts buyer's request)
   */
  static async acceptTrade(
    tradeId: string,
    sellerId: string
  ): Promise<void> {
    const tradeRef = doc(db, 'p2p_crypto_transactions', tradeId);
    const tradeDoc = await getDoc(tradeRef);

    if (!tradeDoc.exists()) {
      throw new Error('Trade not found');
    }

    const trade = tradeDoc.data() as P2PTradeTransaction;

    if (trade.sellerId !== sellerId) {
      throw new Error('Only the seller can accept this trade');
    }

    if (trade.status !== 'pending') {
      throw new Error('Trade is no longer pending');
    }

    // Update trade status
    await updateDoc(tradeRef, {
      status: 'active',
      acceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify buyer
    await p2pNotifications.notifyTradeStatusChange(
      trade.buyerId,
      trade,
      'pending',
      'active'
    );

    // Create conversation for in-trade messaging
    await messagingService.createConversation(
      [trade.sellerId, trade.buyerId],
      {
        [trade.sellerId]: trade.sellerName,
        [trade.buyerId]: trade.buyerName,
      },
      {
        type: 'p2p_trade',
        tradeId: trade.id,
        asset: trade.asset,
        amount: trade.cryptoAmount,
      }
    );
  }

  /**
   * Reject a pending trade
   */
  static async rejectTrade(
    tradeId: string,
    sellerId: string,
    reason?: string
  ): Promise<void> {
    const tradeRef = doc(db, 'p2p_crypto_transactions', tradeId);
    const tradeDoc = await getDoc(tradeRef);

    if (!tradeDoc.exists()) {
      throw new Error('Trade not found');
    }

    const trade = tradeDoc.data() as P2PTradeTransaction;

    if (trade.sellerId !== sellerId) {
      throw new Error('Only the seller can reject this trade');
    }

    if (trade.status !== 'pending') {
      throw new Error('Trade is no longer pending');
    }

    // Update trade status
    await updateDoc(tradeRef, {
      status: 'cancelled',
      cancelledBy: sellerId,
      cancellationReason: reason || 'Rejected by seller',
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify buyer
    await p2pNotifications.notifyTradeStatusChange(
      trade.buyerId,
      trade,
      'pending',
      'cancelled'
    );
  }

  /**
   * Submit payment proof (buyer confirms payment sent)
   */
  static async submitPayment(
    tradeId: string,
    buyerId: string,
    paymentProofUrl: string,
    notes?: string
  ): Promise<void> {
    const tradeRef = doc(db, 'p2p_crypto_transactions', tradeId);
    const tradeDoc = await getDoc(tradeRef);

    if (!tradeDoc.exists()) {
      throw new Error('Trade not found');
    }

    const trade = tradeDoc.data() as P2PTradeTransaction;

    if (trade.buyerId !== buyerId) {
      throw new Error('Only the buyer can submit payment');
    }

    if (trade.status !== 'active' && trade.status !== 'payment_pending') {
      throw new Error('Cannot submit payment for this trade');
    }

    // Update trade with payment info
    await updateDoc(tradeRef, {
      status: 'payment_submitted',
      paymentProofUrl,
      paymentNotes: notes,
      paymentSubmittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify seller
    await p2pNotifications.notifyPaymentSubmitted(
      trade.sellerId,
      trade,
      paymentProofUrl
    );

    // Send system message in trade chat
    const conversations = await messagingService.getConversationsByMetadata('tradeId', tradeId);
    if (conversations.length > 0) {
      await messagingService.sendMessage(
        conversations[0].id,
        buyerId,
        `💰 Payment proof submitted. Please verify and release crypto.`,
        'system'
      );
    }
  }

  /**
   * Confirm payment received and release crypto (seller action)
   */
  static async confirmPaymentAndRelease(
    tradeId: string,
    sellerId: string
  ): Promise<void> {
    const tradeRef = doc(db, 'p2p_crypto_transactions', tradeId);
    const tradeDoc = await getDoc(tradeRef);

    if (!tradeDoc.exists()) {
      throw new Error('Trade not found');
    }

    const trade = tradeDoc.data() as P2PTradeTransaction;

    if (trade.sellerId !== sellerId) {
      throw new Error('Only the seller can release crypto');
    }

    if (trade.status !== 'payment_submitted' && trade.status !== 'in_escrow') {
      throw new Error('Cannot release crypto at this stage');
    }

    // Release crypto from escrow
    await updateDoc(tradeRef, {
      status: 'completed',
      cryptoReleasedAt: serverTimestamp(),
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify buyer
    await p2pNotifications.notifyCryptoReleased(trade.buyerId, trade);

    // Send rating request notifications
    setTimeout(async () => {
      await p2pNotifications.notifyRatingRequest(trade.buyerId, trade);
      await p2pNotifications.notifyRatingRequest(trade.sellerId, trade);
    }, 5000);

    // Send system message
    const conversations = await messagingService.getConversationsByMetadata('tradeId', tradeId);
    if (conversations.length > 0) {
      await messagingService.sendMessage(
        conversations[0].id,
        sellerId,
        `✅ Trade completed! ${trade.cryptoAmount} ${trade.asset} released to buyer.`,
        'system'
      );
    }
  }

  /**
   * Cancel an active trade (before payment)
   */
  static async cancelTrade(
    tradeId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    const tradeRef = doc(db, 'p2p_crypto_transactions', tradeId);
    const tradeDoc = await getDoc(tradeRef);

    if (!tradeDoc.exists()) {
      throw new Error('Trade not found');
    }

    const trade = tradeDoc.data() as P2PTradeTransaction;

    if (trade.sellerId !== userId && trade.buyerId !== userId) {
      throw new Error('You are not part of this trade');
    }

    if (trade.status === 'completed' || trade.status === 'cancelled') {
      throw new Error('Trade is already finalized');
    }

    // Don't allow cancellation after payment submitted
    if (trade.status === 'payment_submitted' || trade.status === 'in_escrow') {
      throw new Error('Cannot cancel after payment. Please file a dispute if needed.');
    }

    // Cancel trade
    await updateDoc(tradeRef, {
      status: 'cancelled',
      cancelledBy: userId,
      cancellationReason: reason,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify other party
    const otherUserId = userId === trade.sellerId ? trade.buyerId : trade.sellerId;
    await p2pNotifications.notifyTradeStatusChange(
      otherUserId,
      trade,
      trade.status,
      'cancelled'
    );
  }

  /**
   * File a dispute on a trade
   */
  static async fileDispute(
    tradeId: string,
    userId: string,
    reason: string,
    evidence?: string[]
  ): Promise<string> {
    const tradeRef = doc(db, 'p2p_crypto_transactions', tradeId);
    const tradeDoc = await getDoc(tradeRef);

    if (!tradeDoc.exists()) {
      throw new Error('Trade not found');
    }

    const trade = tradeDoc.data() as P2PTradeTransaction;

    if (trade.sellerId !== userId && trade.buyerId !== userId) {
      throw new Error('You are not part of this trade');
    }

    if (trade.status === 'completed' || trade.status === 'cancelled') {
      throw new Error('Cannot dispute finalized trades');
    }

    // Create dispute document
    const disputeRef = doc(db, 'disputes');
    const dispute = {
      tradeId: trade.id,
      type: 'p2p_crypto',
      filedBy: userId,
      filedAgainst: userId === trade.sellerId ? trade.buyerId : trade.sellerId,
      reason,
      evidence: evidence || [],
      status: 'open',
      tradeData: {
        asset: trade.asset,
        amount: trade.cryptoAmount,
        value: trade.totalZAR,
        seller: trade.sellerName,
        buyer: trade.buyerName,
      },
      createdAt: serverTimestamp(),
    };

    await setDoc(disputeRef, dispute);

    // Update trade status
    await updateDoc(tradeRef, {
      status: 'disputed',
      disputeId: disputeRef.id,
      disputedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify both parties
    await p2pNotifications.notifyDisputeFiled(userId, trade, userId);
    const otherUserId = userId === trade.sellerId ? trade.buyerId : trade.sellerId;
    await p2pNotifications.notifyDisputeFiled(otherUserId, trade, userId);

    return disputeRef.id;
  }

  /**
   * Send quick message in trade chat
   */
  static async sendQuickMessage(
    tradeId: string,
    userId: string,
    messageType: 'payment_sent' | 'payment_received' | 'question' | 'thanks'
  ): Promise<void> {
    const conversations = await messagingService.getConversationsByMetadata('tradeId', tradeId);
    
    if (conversations.length === 0) {
      throw new Error('Trade conversation not found');
    }

    const quickMessages = {
      payment_sent: '💰 Payment sent! Please check and confirm.',
      payment_received: '✅ Payment received. Releasing crypto now.',
      question: '❓ I have a question about this trade.',
      thanks: '🙏 Thank you for the smooth transaction!',
    };

    await messagingService.sendMessage(
      conversations[0].id,
      userId,
      quickMessages[messageType],
      'text'
    );
  }
}

// Export singleton
export const p2pTradeActions = P2PTradeActions;
