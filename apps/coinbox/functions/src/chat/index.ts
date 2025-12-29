import * as functions from "firebase-functions";
import { ChatService } from "./chatService";
import { sanitize } from "../utils/validate";
import { ERROR_CODES } from "../config/constants";
import { CloudFunctionResponse } from "../types";

/**
 * Send Chat Message (Phase 6)
 */
export const sendChatMessage = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId, message, type, attachmentUrl } = data;

      const messageId = await ChatService.sendMessage({
        orderId,
        senderId: userId,
        message: sanitize.string(message, 1000),
        type,
        attachmentUrl,
      });

      return {
        success: true,
        data: { messageId },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Send chat message error:", error);

      return {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }
);

/**
 * Get Chat Messages (Phase 6)
 */
export const getChatMessages = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId, limit, lastMessageId } = data;

      const messages = await ChatService.getMessages({
        orderId,
        userId,
        limit,
        lastMessageId,
      });

      return {
        success: true,
        data: { messages },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get chat messages error:", error);

      return {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }
);

/**
 * Mark Messages as Read (Phase 6)
 */
export const markMessagesAsRead = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId } = data;

      await ChatService.markAsRead({
        orderId,
        userId,
      });

      return {
        success: true,
        data: { message: "Messages marked as read" },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Mark as read error:", error);

      return {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }
);

/**
 * Upload Chat Attachment (Phase 6)
 */
export const uploadChatAttachment = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId, fileData, filename, type } = data;

      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, "base64");

      const url = await ChatService.uploadAttachment({
        orderId,
        userId,
        file: buffer,
        filename,
        type,
      });

      return {
        success: true,
        data: { url },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Upload attachment error:", error);

      return {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }
);

/**
 * Get Unread Message Count (Phase 6)
 */
export const getUnreadMessageCount = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const count = await ChatService.getUnreadCount(userId);

      return {
        success: true,
        data: { count },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get unread count error:", error);

      return {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }
);
