import { db } from "../config/firebase";
import { COLLECTIONS, ERROR_CODES } from "../config/constants";
import { ChatMessage } from "../types";
import { NotificationService } from "../utils/notifications";

/**
 * Chat Service
 * Phase 6: Buyer/Seller Chat System
 */

export class ChatService {
  /**
   * Send a chat message in an order
   */
  static async sendMessage(params: {
    orderId: string;
    senderId: string;
    message: string;
    type?: "text" | "system" | "payment-proof" | "bank-details";
    attachmentUrl?: string;
  }): Promise<string> {
    try {
      // Verify sender is participant in order
      const orderDoc = await db.collection(COLLECTIONS.P2P_ORDERS).doc(params.orderId).get();

      if (!orderDoc.exists) {
        throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
      }

      const order = orderDoc.data();
      const isParticipant =
        params.senderId === order!.buyerId ||
        params.senderId === order!.sellerId ||
        params.senderId === "system";

      if (!isParticipant) {
        throw new Error(ERROR_CODES.NOT_ORDER_PARTICIPANT);
      }

      // Create message
      const messageRef = db.collection(COLLECTIONS.CHAT_MESSAGES).doc();
      const messageId = messageRef.id;

      const chatMessage: Omit<ChatMessage, "id"> = {
        orderId: params.orderId,
        senderId: params.senderId,
        message: params.message,
        type: params.type || "text",
        attachmentUrl: params.attachmentUrl,
        createdAt: new Date(),
      };

      await messageRef.set(chatMessage);

      // Send notification to other participant
      if (params.senderId !== "system") {
        const recipientId =
          params.senderId === order!.buyerId ? order!.sellerId : order!.buyerId;

        await NotificationService.sendNotification({
          userId: recipientId,
          title: "New Message",
          body: params.message.substring(0, 50),
          data: {
            type: "chat-message",
            orderId: params.orderId,
            messageId,
          },
        });
      }

      return messageId;
    } catch (error) {
      console.error("Send message error:", error);
      throw error;
    }
  }

  /**
   * Get chat messages for an order
   */
  static async getMessages(params: {
    orderId: string;
    userId: string;
    limit?: number;
    lastMessageId?: string;
  }): Promise<ChatMessage[]> {
    try {
      // Verify user is participant
      const orderDoc = await db.collection(COLLECTIONS.P2P_ORDERS).doc(params.orderId).get();

      if (!orderDoc.exists) {
        throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
      }

      const order = orderDoc.data();
      const isParticipant =
        params.userId === order!.buyerId || params.userId === order!.sellerId;

      if (!isParticipant) {
        throw new Error(ERROR_CODES.NOT_ORDER_PARTICIPANT);
      }

      // Build query
      let query = db
        .collection(COLLECTIONS.CHAT_MESSAGES)
        .where("orderId", "==", params.orderId)
        .orderBy("createdAt", "desc")
        .limit(params.limit || 50);

      // Pagination support
      if (params.lastMessageId) {
        const lastDoc = await db
          .collection(COLLECTIONS.CHAT_MESSAGES)
          .doc(params.lastMessageId)
          .get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      const snapshot = await query.get();

      const messages = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .reverse(); // Reverse to show oldest first

      return messages as ChatMessage[];
    } catch (error) {
      console.error("Get messages error:", error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  static async markAsRead(params: {
    orderId: string;
    userId: string;
  }): Promise<void> {
    try {
      // Get unread messages
      const snapshot = await db
        .collection(COLLECTIONS.CHAT_MESSAGES)
        .where("orderId", "==", params.orderId)
        .where("senderId", "!=", params.userId)
        .get();

      // Update read status (could add readBy field)
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          readAt: new Date(),
          readBy: params.userId,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Mark as read error:", error);
      throw error;
    }
  }

  /**
   * Upload chat attachment (payment proof, bank details)
   */
  static async uploadAttachment(params: {
    orderId: string;
    userId: string;
    file: Buffer;
    filename: string;
    type: "payment-proof" | "bank-details";
  }): Promise<string> {
    try {
      const { storage } = await import("../config/firebase");
      const bucket = storage.bucket();
      const filePath = `chat/${params.orderId}/${params.type}/${Date.now()}_${params.filename}`;
      const file = bucket.file(filePath);

      await file.save(params.file, {
        metadata: {
          contentType: "image/jpeg",
          metadata: {
            orderId: params.orderId,
            userId: params.userId,
            type: params.type,
          },
        },
      });

      // Generate signed URL (valid for 7 days)
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      return url;
    } catch (error) {
      console.error("Upload attachment error:", error);
      throw new Error("Failed to upload attachment");
    }
  }

  /**
   * Get unread message count for user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      // Get user's active orders
      const buyOrdersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("buyerId", "==", userId)
        .where("status", "in", ["pending-payment", "awaiting-release"])
        .get();

      const sellOrdersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("sellerId", "==", userId)
        .where("status", "in", ["pending-payment", "awaiting-release"])
        .get();

      const orderIds = [
        ...buyOrdersSnapshot.docs.map((doc) => doc.id),
        ...sellOrdersSnapshot.docs.map((doc) => doc.id),
      ];

      if (orderIds.length === 0) return 0;

      // Count unread messages (messages not sent by user and not read)
      let totalUnread = 0;

      for (const orderId of orderIds) {
        const snapshot = await db
          .collection(COLLECTIONS.CHAT_MESSAGES)
          .where("orderId", "==", orderId)
          .where("senderId", "!=", userId)
          .get();

        const unread = snapshot.docs.filter((doc) => !doc.data().readAt);
        totalUnread += unread.length;
      }

      return totalUnread;
    } catch (error) {
      console.error("Get unread count error:", error);
      return 0;
    }
  }

  /**
   * Add system message to order chat
   */
  static async addSystemMessage(params: {
    orderId: string;
    message: string;
  }): Promise<string> {
    return this.sendMessage({
      orderId: params.orderId,
      senderId: "system",
      message: params.message,
      type: "system",
    });
  }
}
