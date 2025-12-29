import { getFunctions, httpsCallable } from "firebase/functions";

/**
 * Client API for Chat System (Phase 6)
 */

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  message: string;
  type: "text" | "system" | "payment-proof" | "bank-details";
  attachmentUrl?: string;
  readAt?: Date;
  readBy?: string;
  createdAt: Date;
}

/**
 * Send a chat message
 */
export async function sendChatMessage(params: {
  orderId: string;
  message: string;
  type?: "text" | "payment-proof" | "bank-details";
  attachmentUrl?: string;
}): Promise<string> {
  const functions = getFunctions();
  const sendMessage = httpsCallable(functions, "sendChatMessage");

  const result = await sendMessage(params);
  const data = result.data as any;

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to send message");
  }

  return data.data.messageId;
}

/**
 * Get chat messages for an order
 */
export async function getChatMessages(params: {
  orderId: string;
  limit?: number;
  lastMessageId?: string;
}): Promise<ChatMessage[]> {
  const functions = getFunctions();
  const getMessages = httpsCallable(functions, "getChatMessages");

  const result = await getMessages(params);
  const data = result.data as any;

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to get messages");
  }

  return data.data.messages;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(orderId: string): Promise<void> {
  const functions = getFunctions();
  const markAsRead = httpsCallable(functions, "markMessagesAsRead");

  const result = await markAsRead({ orderId });
  const data = result.data as any;

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to mark as read");
  }
}

/**
 * Upload chat attachment
 */
export async function uploadChatAttachment(params: {
  orderId: string;
  file: File;
  type: "payment-proof" | "bank-details";
}): Promise<string> {
  const functions = getFunctions();
  const uploadAttachment = httpsCallable(functions, "uploadChatAttachment");

  // Convert file to base64
  const fileData = await fileToBase64(params.file);

  const result = await uploadAttachment({
    orderId: params.orderId,
    fileData,
    filename: params.file.name,
    type: params.type,
  });

  const data = result.data as any;

  if (!data.success) {
    throw new Error(data.error?.message || "Failed to upload attachment");
  }

  return data.data.url;
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount(): Promise<number> {
  const functions = getFunctions();
  const getCount = httpsCallable(functions, "getUnreadMessageCount");

  const result = await getCount({});
  const data = result.data as any;

  if (!data.success) {
    return 0;
  }

  return data.data.count;
}

/**
 * Convert File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
