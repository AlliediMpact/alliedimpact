/**
 * P2P API Client
 * Frontend integration for P2P Cloud Functions
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase-client-config";

export interface P2POffer {
  id: string;
  userId: string;
  offerType: "buy" | "sell";
  asset: string;
  fiatCurrency: string;
  priceType: "fixed" | "floating";
  price: number;
  minLimit: number;
  maxLimit: number;
  availableAmount: number;
  paymentMethods: string[];
  paymentTimeWindow: number;
  terms: string;
  status: string;
  completedOrders: number;
  totalOrders: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface P2POrder {
  id: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  asset: string;
  fiatCurrency: string;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  status: string;
  paymentMethod: string;
  paymentTimeWindow: number;
  paymentDeadline: Date;
  escrowLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  message: string;
  type: string;
  createdAt: Date;
}

/**
 * Create P2P Offer
 */
export const createOffer = async (params: {
  offerType: "buy" | "sell";
  asset: string;
  fiatCurrency: string;
  priceType: "fixed" | "floating";
  price: number;
  minLimit: number;
  maxLimit: number;
  availableAmount: number;
  paymentMethods: string[];
  paymentTimeWindow: number;
  terms: string;
  autoReply?: string;
}) => {
  const callable = httpsCallable(functions, "createOffer");
  const result = await callable(params);
  return result.data;
};

/**
 * Update offer
 */
export const updateOffer = async (offerId: string, updates: Partial<P2POffer>) => {
  const callable = httpsCallable(functions, "updateOffer");
  const result = await callable({ offerId, updates });
  return result.data;
};

/**
 * Toggle offer status (pause/resume)
 */
export const toggleOfferStatus = async (offerId: string) => {
  const callable = httpsCallable(functions, "toggleOfferStatus");
  const result = await callable({ offerId });
  return result.data;
};

/**
 * Delete offer
 */
export const deleteOffer = async (offerId: string) => {
  const callable = httpsCallable(functions, "deleteOffer");
  const result = await callable({ offerId });
  return result.data;
};

/**
 * Get user's offers
 */
export const getUserOffers = async (status?: string): Promise<P2POffer[]> => {
  const callable = httpsCallable(functions, "getUserOffers");
  const result = await callable({ status });
  return (result.data as any).data.offers;
};

/**
 * Search offers (marketplace)
 */
export const searchOffers = async (params: {
  offerType?: "buy" | "sell";
  asset?: string;
  fiatCurrency?: string;
  paymentMethods?: string[];
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
}): Promise<P2POffer[]> => {
  const callable = httpsCallable(functions, "searchOffers");
  const result = await callable(params);
  return (result.data as any).data.offers;
};

/**
 * Get offer details
 */
export const getOfferDetails = async (offerId: string): Promise<P2POffer> => {
  const callable = httpsCallable(functions, "getOfferDetails");
  const result = await callable({ offerId });
  return (result.data as any).data.offer;
};

/**
 * Create order
 */
export const createOrder = async (params: {
  offerId: string;
  fiatAmount: number;
  paymentMethod: string;
}) => {
  const callable = httpsCallable(functions, "createOrder");
  const result = await callable(params);
  return result.data;
};

/**
 * Mark order as paid
 */
export const markOrderAsPaid = async (orderId: string, paymentProofUrl?: string) => {
  const callable = httpsCallable(functions, "markOrderAsPaid");
  const result = await callable({ orderId, paymentProofUrl });
  return result.data;
};

/**
 * Release crypto (seller)
 */
export const releaseCrypto = async (orderId: string) => {
  const callable = httpsCallable(functions, "releaseCrypto");
  const result = await callable({ orderId });
  return result.data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string, reason: string) => {
  const callable = httpsCallable(functions, "cancelOrder");
  const result = await callable({ orderId, reason });
  return result.data;
};

/**
 * Open dispute
 */
export const openDispute = async (orderId: string, reason: string) => {
  const callable = httpsCallable(functions, "openDispute");
  const result = await callable({ orderId, reason });
  return result.data;
};

/**
 * Get user orders
 */
export const getUserOrders = async (status?: string, limit = 50): Promise<P2POrder[]> => {
  const callable = httpsCallable(functions, "getUserOrders");
  const result = await callable({ status, limit });
  return (result.data as any).data.orders;
};

/**
 * Get order details with chat
 */
export const getOrderDetails = async (orderId: string): Promise<{
  order: P2POrder;
  chatMessages: ChatMessage[];
}> => {
  const callable = httpsCallable(functions, "getOrderDetails");
  const result = await callable({ orderId });
  return (result.data as any).data;
};

/**
 * Send chat message
 */
export const sendChatMessage = async (params: {
  orderId: string;
  message: string;
  type?: string;
  attachmentUrl?: string;
}) => {
  const callable = httpsCallable(functions, "sendChatMessage");
  const result = await callable(params);
  return result.data;
};
