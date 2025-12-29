import * as functions from "firebase-functions";
import { OfferService } from "./offerService";
import { OrderService } from "./orderService";
import { MatchingEngine } from "./matchingEngine";
import { validate, ValidationException, sanitize } from "../utils/validate";
import { FraudDetection } from "../utils/fraud";
import { ERROR_CODES } from "../config/constants";
import { CloudFunctionResponse } from "../types";

/**
 * Create P2P Offer
 */
export const createOffer = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;

      // Validate user can trade
      const canTrade = await FraudDetection.validateUserCanTrade(userId);
      if (!canTrade.allowed) {
        throw new Error(canTrade.reason);
      }

      const {
        offerType,
        asset,
        fiatCurrency,
        priceType,
        price,
        minLimit,
        maxLimit,
        availableAmount,
        paymentMethods,
        paymentTimeWindow,
        terms,
        autoReply,
      } = data;

      // Validate input
      validate.run([
        validate.amount(price, "price"),
        validate.amount(minLimit, "minLimit"),
        validate.amount(maxLimit, "maxLimit"),
        validate.amount(availableAmount, "availableAmount"),
        validate.offerLimits(minLimit, maxLimit),
        validate.paymentMethods(paymentMethods),
        validate.paymentWindow(paymentTimeWindow),
        validate.terms(terms),
      ]);

      const offerId = await OfferService.createOffer({
        userId,
        offerType,
        asset,
        fiatCurrency: fiatCurrency || "NGN",
        priceType,
        price: sanitize.amount(price, 2),
        minLimit: sanitize.amount(minLimit, 2),
        maxLimit: sanitize.amount(maxLimit, 2),
        availableAmount: sanitize.amount(availableAmount, 8),
        paymentMethods,
        paymentTimeWindow,
        terms: sanitize.string(terms, 500),
        autoReply: autoReply ? sanitize.string(autoReply, 500) : undefined,
      });

      return {
        success: true,
        data: { offerId },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Create offer error:", error);

      if (error instanceof ValidationException) {
        return {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_INPUT,
            message: "Validation failed",
            details: error.errors,
          },
          timestamp: new Date(),
        };
      }

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
 * Update Offer
 */
export const updateOffer = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { offerId, updates } = data;

      await OfferService.updateOffer(offerId, userId, updates);

      return {
        success: true,
        data: { offerId },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Update offer error:", error);

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
 * Toggle Offer Status (Pause/Resume)
 */
export const toggleOfferStatus = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { offerId } = data;

      const newStatus = await OfferService.toggleOfferStatus(offerId, userId);

      return {
        success: true,
        data: { offerId, status: newStatus },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Toggle offer status error:", error);

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
 * Delete Offer
 */
export const deleteOffer = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { offerId } = data;

      await OfferService.deleteOffer(offerId, userId);

      return {
        success: true,
        data: { offerId },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Delete offer error:", error);

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
 * Get User Offers
 */
export const getUserOffers = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { status } = data;

      const offers = await OfferService.getUserOffers(userId, status);

      return {
        success: true,
        data: { offers, total: offers.length },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get user offers error:", error);

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
 * Search Offers (Marketplace)
 */
export const searchOffers = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      const { offerType, asset, fiatCurrency, paymentMethods, minAmount, maxAmount, limit } = data;

      const offers = await OfferService.searchOffers({
        offerType,
        asset,
        fiatCurrency,
        paymentMethods,
        minAmount,
        maxAmount,
        limit,
      });

      return {
        success: true,
        data: { offers, total: offers.length },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Search offers error:", error);

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
 * Get Offer Details
 */
export const getOfferDetails = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      const { offerId } = data;

      const offer = await OfferService.getOffer(offerId);

      if (!offer) {
        throw new Error(ERROR_CODES.OFFER_NOT_FOUND);
      }

      return {
        success: true,
        data: { offer },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get offer details error:", error);

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
 * Create Order
 */
export const createOrder = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { offerId, fiatAmount, paymentMethod } = data;

      // Validate input
      validate.run([validate.tradeAmount(fiatAmount)]);

      const orderId = await OrderService.createOrder({
        buyerId: userId,
        offerId,
        fiatAmount: sanitize.amount(fiatAmount, 2),
        paymentMethod,
        ipAddress: context.rawRequest?.ip,
        userAgent: context.rawRequest?.headers["user-agent"],
      });

      return {
        success: true,
        data: { orderId },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Create order error:", error);

      if (error instanceof ValidationException) {
        return {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_INPUT,
            message: "Validation failed",
            details: error.errors,
          },
          timestamp: new Date(),
        };
      }

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
 * Mark Order as Paid
 */
export const markOrderAsPaid = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId, paymentProofUrl } = data;

      await OrderService.markAsPaid({
        orderId,
        userId,
        paymentProofUrl,
      });

      return {
        success: true,
        data: { orderId },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Mark order as paid error:", error);

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
 * Release Crypto
 */
export const releaseCrypto = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId } = data;

      await OrderService.releaseCrypto({
        orderId,
        userId,
      });

      return {
        success: true,
        data: { orderId },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Release crypto error:", error);

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
 * Cancel Order
 */
export const cancelOrder = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId, reason } = data;

      await OrderService.cancelOrder({
        orderId,
        userId,
        reason: sanitize.string(reason, 500),
      });

      return {
        success: true,
        data: { orderId },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Cancel order error:", error);

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
 * Open Dispute
 */
export const openDispute = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId, reason } = data;

      await OrderService.openDispute({
        orderId,
        userId,
        reason: sanitize.string(reason, 500),
      });

      return {
        success: true,
        data: { orderId },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Open dispute error:", error);

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
 * Get User Orders
 */
export const getUserOrders = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { status, limit } = data;

      const orders = await OrderService.getUserOrders(userId, status, limit);

      return {
        success: true,
        data: { orders, total: orders.length },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get user orders error:", error);

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
 * Get Order Details
 */
export const getOrderDetails = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId } = data;

      const order = await OrderService.getOrder(orderId);

      if (!order) {
        throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
      }

      // Verify user is participant
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new Error(ERROR_CODES.NOT_ORDER_PARTICIPANT);
      }

      // Get chat messages
      const chatMessages = await OrderService.getChatMessages(orderId);

      return {
        success: true,
        data: { order, chatMessages },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get order details error:", error);

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
 * Send Chat Message
 */
export const sendChatMessage = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId, message, type, attachmentUrl } = data;

      const messageId = await OrderService.addChatMessage({
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
 * Find Matching Offers (Phase 3)
 */
export const findMatches = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderType, asset, fiatCurrency, amount, minPrice, maxPrice, paymentMethod } = data;

      const matchResult = await MatchingEngine.findMatches({
        orderType,
        asset,
        fiatCurrency,
        amount,
        minPrice,
        maxPrice,
        paymentMethod,
        userId,
      });

      return {
        success: true,
        data: matchResult,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Find matches error:", error);

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
 * Auto-Match Order (Phase 3)
 */
export const autoMatchOrder = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderType, asset, fiatCurrency, amount, paymentMethod } = data;

      const result = await MatchingEngine.autoMatchOrder({
        userId,
        orderType,
        asset,
        fiatCurrency,
        amount,
        paymentMethod,
      });

      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Auto-match order error:", error);

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
 * Get Market Depth (Phase 3)
 */
export const getMarketDepth = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      const { asset, fiatCurrency } = data;

      const depth = await MatchingEngine.getMarketDepth({
        asset,
        fiatCurrency,
      });

      return {
        success: true,
        data: depth,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get market depth error:", error);

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
 * Get Price Suggestion (Phase 3)
 */
export const suggestPrice = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      const { offerType, asset, fiatCurrency } = data;

      const suggestion = await MatchingEngine.suggestPrice({
        offerType,
        asset,
        fiatCurrency,
      });

      return {
        success: true,
        data: suggestion,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Suggest price error:", error);

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
 * Get Matching Statistics (Phase 3)
 */
export const getMatchingStats = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      const { asset, fiatCurrency, timeframe } = data;

      const stats = await MatchingEngine.getMatchingStats({
        asset,
        fiatCurrency,
        timeframe,
      });

      return {
        success: true,
        data: stats,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get matching stats error:", error);

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
