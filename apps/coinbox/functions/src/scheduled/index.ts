import * as functions from "firebase-functions";
import { db } from "../config/firebase";
import { COLLECTIONS, CONFIG } from "../config/constants";
import { OrderService } from "../p2p/orderService";
import { P2POrder } from "../types";

/**
 * Auto-Cancel Expired Orders
 * Runs every 5 minutes
 */
export const autoCancelExpiredOrders = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async (context) => {
    try {
      const now = new Date();
      const bufferTime = new Date(now.getTime() - CONFIG.P2P.AUTO_CANCEL_BUFFER * 60 * 1000);

      // Find expired orders that are still pending payment
      const expiredOrdersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("status", "==", "pending-payment")
        .where("paymentDeadline", "<=", bufferTime)
        .limit(100)
        .get();

      if (expiredOrdersSnapshot.empty) {
        console.log("No expired orders to cancel");
        return null;
      }

      console.log(`Found ${expiredOrdersSnapshot.size} expired orders to cancel`);

      const cancelPromises = expiredOrdersSnapshot.docs.map(async (doc) => {
        const order = { id: doc.id, ...doc.data() } as P2POrder;

        try {
          await OrderService.cancelOrder({
            orderId: order.id,
            userId: "system",
            reason: "Payment deadline expired",
          });

          console.log(`Auto-cancelled expired order: ${order.id}`);
        } catch (error) {
          console.error(`Failed to cancel order ${order.id}:`, error);
        }
      });

      await Promise.all(cancelPromises);

      console.log(`Auto-cancelled ${expiredOrdersSnapshot.size} expired orders`);

      return null;
    } catch (error) {
      console.error("Auto-cancel expired orders error:", error);
      return null;
    }
  });

/**
 * Update Risk Profiles
 * Runs every hour
 */
export const updateUserRiskProfiles = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    try {
      // Get all users who have had recent activity
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentOrdersSnapshot = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .where("updatedAt", ">=", oneDayAgo)
        .limit(500)
        .get();

      if (recentOrdersSnapshot.empty) {
        console.log("No recent activity to process");
        return null;
      }

      // Extract unique user IDs
      const userIds = new Set<string>();
      recentOrdersSnapshot.docs.forEach((doc) => {
        const order = doc.data() as P2POrder;
        userIds.add(order.buyerId);
        userIds.add(order.sellerId);
      });

      console.log(`Updating risk profiles for ${userIds.size} users`);

      // Import FraudDetection dynamically to avoid circular dependencies
      const { FraudDetection } = await import("../utils/fraud");

      const updatePromises = Array.from(userIds).map(async (userId) => {
        try {
          await FraudDetection.updateRiskProfile(userId);
        } catch (error) {
          console.error(`Failed to update risk profile for ${userId}:`, error);
        }
      });

      await Promise.all(updatePromises);

      console.log(`Updated ${userIds.size} risk profiles`);

      return null;
    } catch (error) {
      console.error("Update risk profiles error:", error);
      return null;
    }
  });

/**
 * Clean up old escrow locks
 * Runs daily
 */
export const cleanupExpiredEscrowLocks = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    try {
      const now = new Date();

      // Find expired escrow locks that are still locked
      const expiredLocksSnapshot = await db
        .collection(COLLECTIONS.ESCROW_LOCKS)
        .where("status", "==", "locked")
        .where("expiresAt", "<=", now)
        .limit(100)
        .get();

      if (expiredLocksSnapshot.empty) {
        console.log("No expired escrow locks to clean up");
        return null;
      }

      console.log(`Found ${expiredLocksSnapshot.size} expired escrow locks`);

      const batch = db.batch();

      expiredLocksSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: "refunded",
          refundedAt: new Date(),
        });
      });

      await batch.commit();

      console.log(`Cleaned up ${expiredLocksSnapshot.size} expired escrow locks`);

      return null;
    } catch (error) {
      console.error("Cleanup escrow locks error:", error);
      return null;
    }
  });
