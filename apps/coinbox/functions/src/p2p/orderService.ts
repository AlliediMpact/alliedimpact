import { db } from "../config/firebase";
import { COLLECTIONS, ERROR_CODES, CONFIG } from "../config/constants";
import { P2POrder, OrderStatus, ChatMessage } from "../types";
import { WalletService } from "../wallet/walletService";
import { OfferService } from "./offerService";
import { FraudDetection } from "../utils/fraud";
import { NotificationService } from "../utils/notifications";

/**
 * P2P Order Escrow Service
 * Core escrow engine for P2P trades
 */

export class OrderService {
  /**
   * Create a new order (initiates escrow lock)
   */
  static async createOrder(params: {
    buyerId: string;
    offerId: string;
    fiatAmount: number;
    paymentMethod: string;
    ipAddress?: string;
    deviceId?: string;
    userAgent?: string;
  }): Promise<string> {
    // Validate user can trade
    const canTrade = await FraudDetection.validateUserCanTrade(params.buyerId);
    if (!canTrade.allowed) {
      throw new Error(canTrade.reason);
    }

    // Get offer
    const offer = await OfferService.getOffer(params.offerId);
    if (!offer) {
      throw new Error(ERROR_CODES.OFFER_NOT_FOUND);
    }

    // Validate offer status
    if (offer.status !== "active") {
      throw new Error(ERROR_CODES.OFFER_INACTIVE);
    }

    // Validate amount limits
    if (params.fiatAmount < offer.minLimit || params.fiatAmount > offer.maxLimit) {
      throw new Error(`Amount must be between ${offer.minLimit} and ${offer.maxLimit}`);
    }

    // Validate payment method
    if (!offer.paymentMethods.includes(params.paymentMethod as any)) {
      throw new Error("Invalid payment method for this offer");
    }

    // Calculate crypto amount
    const cryptoAmount = params.fiatAmount / offer.price;

    // Check available amount
    if (offer.availableAmount < cryptoAmount) {
      throw new Error(ERROR_CODES.OFFER_UNAVAILABLE);
    }

    // Prevent self-trading
    if (params.buyerId === offer.userId) {
      throw new Error("Cannot trade with yourself");
    }

    // Calculate payment deadline
    const paymentDeadline = new Date(Date.now() + offer.paymentTimeWindow * 60 * 1000);

    // Create order
    const orderRef = db.collection(COLLECTIONS.P2P_ORDERS).doc();
    const orderId = orderRef.id;

    const order: Omit<P2POrder, "id"> = {
      offerId: params.offerId,
      buyerId: params.buyerId,
      sellerId: offer.userId,
      asset: offer.asset,
      fiatCurrency: offer.fiatCurrency,
      cryptoAmount,
      fiatAmount: params.fiatAmount,
      price: offer.price,
      status: "pending-payment",
      paymentMethod: params.paymentMethod as any,
      paymentTimeWindow: offer.paymentTimeWindow,
      paymentDeadline,
      escrowLocked: false,
      escrowAmount: cryptoAmount,
      chatMessages: [],
      metadata: {
        ipAddress: params.ipAddress,
        deviceId: params.deviceId,
        userAgent: params.userAgent,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Run transaction to create order and lock escrow
    await db.runTransaction(async (transaction) => {
      // Decrease available amount
      await OfferService.decreaseAvailableAmount(params.offerId, cryptoAmount);

      // Lock seller's balance in escrow
      if (offer.offerType === "sell") {
        await WalletService.lockBalance({
          userId: offer.userId,
          amount: cryptoAmount,
          orderId,
          metadata: {
            buyerId: params.buyerId,
            fiatAmount: params.fiatAmount,
            cryptoAmount,
          },
        });

        order.escrowLocked = true;
      }

      // Create order
      transaction.set(orderRef, order);

      // Add system message
      const systemMessageRef = db.collection(COLLECTIONS.CHAT_MESSAGES).doc();
      const systemMessage: Omit<ChatMessage, "id"> = {
        orderId,
        senderId: "system",
        message: `Order created. Buyer has ${offer.paymentTimeWindow} minutes to complete payment.`,
        type: "system",
        createdAt: new Date(),
      };
      transaction.set(systemMessageRef, systemMessage);
    });

    // Send notifications
    await NotificationService.sendOrderNotification({
      userId: params.buyerId,
      type: "order-created",
      orderId,
      data: { fiatAmount: params.fiatAmount, cryptoAmount },
    });

    await NotificationService.sendOrderNotification({
      userId: offer.userId,
      type: "order-created",
      orderId,
      data: { fiatAmount: params.fiatAmount, cryptoAmount },
    });

    console.log(`Order created: ${orderId} - Buyer: ${params.buyerId} - Seller: ${offer.userId}`);

    return orderId;
  }

  /**
   * Get order by ID
   */
  static async getOrder(orderId: string): Promise<P2POrder | null> {
    const orderDoc = await db.collection(COLLECTIONS.P2P_ORDERS).doc(orderId).get();

    if (!orderDoc.exists) {
      return null;
    }

    return {
      id: orderDoc.id,
      ...orderDoc.data(),
    } as P2POrder;
  }

  /**
   * Buyer marks payment as completed
   */
  static async markAsPaid(params: {
    orderId: string;
    userId: string;
    paymentProofUrl?: string;
  }): Promise<void> {
    const orderRef = db.collection(COLLECTIONS.P2P_ORDERS).doc(params.orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
    }

    const order = orderDoc.data() as P2POrder;

    // Verify buyer
    if (order.buyerId !== params.userId) {
      throw new Error(ERROR_CODES.NOT_ORDER_PARTICIPANT);
    }

    // Verify order status
    if (order.status !== "pending-payment") {
      throw new Error(ERROR_CODES.INVALID_ORDER_STATUS);
    }

    // Check deadline
    if (new Date() > order.paymentDeadline) {
      throw new Error(ERROR_CODES.ORDER_EXPIRED);
    }

    // Update order
    await orderRef.update({
      status: "awaiting-release",
      paymentProofUrl: params.paymentProofUrl,
      paymentProofSubmittedAt: new Date(),
      updatedAt: new Date(),
    });

    // Add system message
    const systemMessageRef = db.collection(COLLECTIONS.CHAT_MESSAGES).doc();
    await systemMessageRef.set({
      orderId: params.orderId,
      senderId: "system",
      message: "Buyer has marked payment as completed. Seller should verify and release crypto.",
      type: "system",
      createdAt: new Date(),
    });

    // Notify seller
    await NotificationService.sendOrderNotification({
      userId: order.sellerId,
      type: "payment-received",
      orderId: params.orderId,
      data: { fiatAmount: order.fiatAmount },
    });

    console.log(`Order ${params.orderId} marked as paid by buyer ${params.userId}`);
  }

  /**
   * Seller releases crypto to buyer (completes trade)
   */
  static async releaseCrypto(params: {
    orderId: string;
    userId: string;
  }): Promise<void> {
    const orderRef = db.collection(COLLECTIONS.P2P_ORDERS).doc(params.orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
    }

    const order = orderDoc.data() as P2POrder;

    // Verify seller
    if (order.sellerId !== params.userId) {
      throw new Error(ERROR_CODES.NOT_ORDER_PARTICIPANT);
    }

    // Verify order status
    if (order.status !== "awaiting-release") {
      throw new Error(ERROR_CODES.INVALID_ORDER_STATUS);
    }

    // Verify escrow is locked
    if (!order.escrowLocked) {
      throw new Error(ERROR_CODES.ESCROW_NOT_LOCKED);
    }

    // Release escrow funds from seller to buyer
    await WalletService.releaseLockedFunds({
      fromUserId: order.sellerId,
      toUserId: order.buyerId,
      amount: order.cryptoAmount,
      orderId: params.orderId,
      metadata: {
        fiatAmount: order.fiatAmount,
        price: order.price,
      },
    });

    // Update order
    await orderRef.update({
      status: "completed",
      releasedAt: new Date(),
      completedAt: new Date(),
      updatedAt: new Date(),
    });

    // Update offer stats
    await OfferService.updateOfferStats(order.offerId, true);

    // Update risk profiles
    await FraudDetection.updateRiskProfile(order.buyerId);
    await FraudDetection.updateRiskProfile(order.sellerId);

    // Add system message
    const systemMessageRef = db.collection(COLLECTIONS.CHAT_MESSAGES).doc();
    await systemMessageRef.set({
      orderId: params.orderId,
      senderId: "system",
      message: "Trade completed successfully! Crypto has been released to buyer.",
      type: "system",
      createdAt: new Date(),
    });

    // Notify buyer
    await NotificationService.sendOrderNotification({
      userId: order.buyerId,
      type: "crypto-released",
      orderId: params.orderId,
      data: { cryptoAmount: order.cryptoAmount },
    });

    console.log(`Order ${params.orderId} completed - Crypto released by seller ${params.userId}`);
  }

  /**
   * Cancel order (releases escrow)
   */
  static async cancelOrder(params: {
    orderId: string;
    userId: string;
    reason: string;
  }): Promise<void> {
    const orderRef = db.collection(COLLECTIONS.P2P_ORDERS).doc(params.orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
    }

    const order = orderDoc.data() as P2POrder;

    // Verify participant
    if (order.buyerId !== params.userId && order.sellerId !== params.userId) {
      throw new Error(ERROR_CODES.NOT_ORDER_PARTICIPANT);
    }

    // Verify order can be cancelled
    if (!["pending-payment", "awaiting-release"].includes(order.status)) {
      throw new Error("Cannot cancel order in current status");
    }

    // Buyers can only cancel before marking as paid
    if (params.userId === order.buyerId && order.status === "awaiting-release") {
      throw new Error("Cannot cancel order after marking as paid");
    }

    // Unlock escrow if locked
    if (order.escrowLocked) {
      await WalletService.unlockBalance({
        userId: order.sellerId,
        amount: order.cryptoAmount,
        orderId: params.orderId,
        metadata: {
          reason: params.reason,
          cancelledBy: params.userId,
        },
      });
    }

    // Return available amount to offer
    await OfferService.increaseAvailableAmount(order.offerId, order.cryptoAmount);

    // Update order
    await orderRef.update({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledBy: params.userId,
      cancelReason: params.reason,
      updatedAt: new Date(),
    });

    // Update offer stats
    await OfferService.updateOfferStats(order.offerId, false);

    // Log fraud if excessive cancellations
    const userOrders = await this.getUserOrders(params.userId);
    const cancelledCount = userOrders.filter((o) => o.status === "cancelled").length;

    if (cancelledCount >= CONFIG.FRAUD.MAX_CANCELLED_ORDERS) {
      await FraudDetection.logSuspiciousActivity({
        userId: params.userId,
        type: "multiple-cancels",
        description: `User has cancelled ${cancelledCount} orders`,
        severity: "high",
        metadata: { cancelledCount },
      });
    }

    // Add system message
    const systemMessageRef = db.collection(COLLECTIONS.CHAT_MESSAGES).doc();
    await systemMessageRef.set({
      orderId: params.orderId,
      senderId: "system",
      message: `Order cancelled by ${params.userId === order.buyerId ? "buyer" : "seller"}. Reason: ${params.reason}`,
      type: "system",
      createdAt: new Date(),
    });

    // Notify other party
    const otherUserId = params.userId === order.buyerId ? order.sellerId : order.buyerId;
    await NotificationService.sendOrderNotification({
      userId: otherUserId,
      type: "order-cancelled",
      orderId: params.orderId,
      data: { reason: params.reason },
    });

    console.log(`Order ${params.orderId} cancelled by ${params.userId}. Reason: ${params.reason}`);
  }

  /**
   * Open dispute
   */
  static async openDispute(params: {
    orderId: string;
    userId: string;
    reason: string;
  }): Promise<void> {
    const orderRef = db.collection(COLLECTIONS.P2P_ORDERS).doc(params.orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
    }

    const order = orderDoc.data() as P2POrder;

    // Verify participant
    if (order.buyerId !== params.userId && order.sellerId !== params.userId) {
      throw new Error(ERROR_CODES.NOT_ORDER_PARTICIPANT);
    }

    // Update order
    await orderRef.update({
      status: "disputed",
      disputeId: `DISPUTE-${Date.now()}`,
      updatedAt: new Date(),
    });

    // Add system message
    const systemMessageRef = db.collection(COLLECTIONS.CHAT_MESSAGES).doc();
    await systemMessageRef.set({
      orderId: params.orderId,
      senderId: "system",
      message: `Dispute opened. Support team has been notified. Reason: ${params.reason}`,
      type: "system",
      createdAt: new Date(),
    });

    // Notify admins
    await NotificationService.notifyAdmins({
      type: "dispute-opened",
      message: `Order ${params.orderId} has been disputed`,
      data: {
        orderId: params.orderId,
        userId: params.userId,
        reason: params.reason,
      },
    });

    // Update risk profile
    await FraudDetection.updateRiskProfile(params.userId);

    console.log(`Dispute opened for order ${params.orderId} by ${params.userId}`);
  }

  /**
   * Get user orders
   */
  static async getUserOrders(
    userId: string,
    status?: OrderStatus,
    limit = 50
  ): Promise<P2POrder[]> {
    // Get orders where user is buyer
    let buyerQuery = db
      .collection(COLLECTIONS.P2P_ORDERS)
      .where("buyerId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    // Get orders where user is seller
    let sellerQuery = db
      .collection(COLLECTIONS.P2P_ORDERS)
      .where("sellerId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (status) {
      buyerQuery = buyerQuery.where("status", "==", status) as any;
      sellerQuery = sellerQuery.where("status", "==", status) as any;
    }

    const [buyerSnapshot, sellerSnapshot] = await Promise.all([
      buyerQuery.get(),
      sellerQuery.get(),
    ]);

    const orders = [
      ...buyerSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ...sellerSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    ] as P2POrder[];

    // Sort by createdAt descending
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return orders.slice(0, limit);
  }

  /**
   * Add chat message
   */
  static async addChatMessage(params: {
    orderId: string;
    senderId: string;
    message: string;
    type?: "text" | "payment-proof" | "bank-details";
    attachmentUrl?: string;
  }): Promise<string> {
    // Verify user is participant
    const order = await this.getOrder(params.orderId);
    if (!order) {
      throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
    }

    if (order.buyerId !== params.senderId && order.sellerId !== params.senderId) {
      throw new Error(ERROR_CODES.NOT_ORDER_PARTICIPANT);
    }

    const messageRef = db.collection(COLLECTIONS.CHAT_MESSAGES).doc();

    const chatMessage: Omit<ChatMessage, "id"> = {
      orderId: params.orderId,
      senderId: params.senderId,
      message: params.message,
      type: params.type || "text",
      attachmentUrl: params.attachmentUrl,
      createdAt: new Date(),
    };

    await messageRef.set(chatMessage);

    console.log(`Chat message added to order ${params.orderId} by ${params.senderId}`);

    return messageRef.id;
  }

  /**
   * Get chat messages for order
   */
  static async getChatMessages(orderId: string): Promise<ChatMessage[]> {
    const snapshot = await db
      .collection(COLLECTIONS.CHAT_MESSAGES)
      .where("orderId", "==", orderId)
      .orderBy("createdAt", "asc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
  }
}
