import { db } from "../config/firebase";
import { COLLECTIONS, ERROR_CODES } from "../config/constants";
import { NotificationService } from "../utils/notifications";
import { WalletService } from "../wallet/walletService";

/**
 * Dispute Resolution Service
 * Phase 7: Dispute Resolution System
 */

export type DisputeStatus =
  | "open"
  | "under-review"
  | "resolved-buyer"
  | "resolved-seller"
  | "cancelled";

export interface Evidence {
  type: "image" | "document" | "text";
  url?: string;
  description: string;
  uploadedAt: Date;
}

export interface Dispute {
  id: string;
  orderId: string;
  initiatedBy: string;
  againstUserId: string;
  status: DisputeStatus;
  reason: string;
  description: string;
  evidence: Evidence[];
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
  resolutionDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DisputeService {
  /**
   * Open a dispute for an order
   */
  static async openDispute(params: {
    orderId: string;
    userId: string;
    reason: string;
    description: string;
    evidence?: Evidence[];
  }): Promise<string> {
    try {
      // Get order
      const orderDoc = await db.collection(COLLECTIONS.P2P_ORDERS).doc(params.orderId).get();

      if (!orderDoc.exists) {
        throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
      }

      const order = orderDoc.data();

      // Verify user is participant
      const isParticipant =
        params.userId === order!.buyerId || params.userId === order!.sellerId;

      if (!isParticipant) {
        throw new Error(ERROR_CODES.NOT_ORDER_PARTICIPANT);
      }

      // Check if order can be disputed
      if (!["awaiting-release", "pending-payment"].includes(order!.status)) {
        throw new Error("Order cannot be disputed in current status");
      }

      // Check if dispute already exists
      const existingDispute = await db
        .collection(COLLECTIONS.DISPUTES)
        .where("orderId", "==", params.orderId)
        .where("status", "in", ["open", "under-review"])
        .get();

      if (!existingDispute.empty) {
        throw new Error("An active dispute already exists for this order");
      }

      // Determine other party
      const againstUserId =
        params.userId === order!.buyerId ? order!.sellerId : order!.buyerId;

      // Create dispute
      const disputeRef = db.collection(COLLECTIONS.DISPUTES).doc();
      const disputeId = disputeRef.id;

      const dispute: Omit<Dispute, "id"> = {
        orderId: params.orderId,
        initiatedBy: params.userId,
        againstUserId,
        status: "open",
        reason: params.reason,
        description: params.description,
        evidence: params.evidence || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Run transaction
      await db.runTransaction(async (transaction) => {
        // Create dispute
        transaction.set(disputeRef, dispute);

        // Update order status
        transaction.update(db.collection(COLLECTIONS.P2P_ORDERS).doc(params.orderId), {
          status: "disputed",
          disputeId,
          updatedAt: new Date(),
        });
      });

      // Send notifications
      await NotificationService.sendNotification({
        userId: againstUserId,
        title: "Dispute Opened",
        body: "A dispute has been opened for your order",
        data: {
          type: "dispute-opened",
          orderId: params.orderId,
          disputeId,
        },
      });

      // Notify admin (could be a separate admin notification channel)
      console.log(`[ADMIN ALERT] New dispute opened: ${disputeId}`);

      return disputeId;
    } catch (error) {
      console.error("Open dispute error:", error);
      throw error;
    }
  }

  /**
   * Add evidence to dispute
   */
  static async addEvidence(params: {
    disputeId: string;
    userId: string;
    evidence: Evidence;
  }): Promise<void> {
    try {
      const disputeDoc = await db.collection(COLLECTIONS.DISPUTES).doc(params.disputeId).get();

      if (!disputeDoc.exists) {
        throw new Error("Dispute not found");
      }

      const dispute = disputeDoc.data() as Dispute;

      // Verify user is participant
      const isParticipant =
        params.userId === dispute.initiatedBy || params.userId === dispute.againstUserId;

      if (!isParticipant) {
        throw new Error("Not authorized to add evidence");
      }

      // Add evidence
      await disputeDoc.ref.update({
        evidence: [...dispute.evidence, params.evidence],
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Add evidence error:", error);
      throw error;
    }
  }

  /**
   * Resolve dispute (Admin only)
   */
  static async resolveDispute(params: {
    disputeId: string;
    adminId: string;
    resolution: "buyer" | "seller";
    resolutionDetails: string;
    adminNotes?: string;
  }): Promise<void> {
    try {
      const disputeDoc = await db.collection(COLLECTIONS.DISPUTES).doc(params.disputeId).get();

      if (!disputeDoc.exists) {
        throw new Error("Dispute not found");
      }

      const dispute = disputeDoc.data() as Dispute;

      // Get order
      const orderDoc = await db
        .collection(COLLECTIONS.P2P_ORDERS)
        .doc(dispute.orderId)
        .get();

      if (!orderDoc.exists) {
        throw new Error(ERROR_CODES.ORDER_NOT_FOUND);
      }

      const order = orderDoc.data();

      // Determine winner
      const winnerId =
        params.resolution === "buyer" ? order!.buyerId : order!.sellerId;
      const loserId =
        params.resolution === "buyer" ? order!.sellerId : order!.buyerId;

      // Run transaction to resolve dispute and handle escrow
      await db.runTransaction(async (transaction) => {
        // Update dispute
        transaction.update(disputeDoc.ref, {
          status: `resolved-${params.resolution}`,
          resolution: params.resolution,
          resolutionDetails: params.resolutionDetails,
          adminNotes: params.adminNotes,
          resolvedBy: params.adminId,
          resolvedAt: new Date(),
          updatedAt: new Date(),
        });

        // Update order
        transaction.update(orderDoc.ref, {
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        });

        // Handle escrow based on resolution
        if (params.resolution === "buyer") {
          // Release funds to buyer (refund)
          await WalletService.releaseLockedFunds({
            fromUserId: order!.sellerId,
            toUserId: order!.buyerId,
            amount: order!.escrowAmount,
            orderId: dispute.orderId,
            metadata: {
              type: "dispute-resolution",
              disputeId: params.disputeId,
              resolution: "buyer",
            },
          });
        } else {
          // Release funds to seller (as normal)
          await WalletService.releaseLockedFunds({
            fromUserId: order!.sellerId,
            toUserId: order!.sellerId,
            amount: order!.escrowAmount,
            orderId: dispute.orderId,
            metadata: {
              type: "dispute-resolution",
              disputeId: params.disputeId,
              resolution: "seller",
            },
          });
        }
      });

      // Send notifications
      await NotificationService.sendNotification({
        userId: winnerId,
        title: "Dispute Resolved in Your Favor",
        body: params.resolutionDetails,
        data: {
          type: "dispute-resolved",
          disputeId: params.disputeId,
          resolution: params.resolution,
        },
      });

      await NotificationService.sendNotification({
        userId: loserId,
        title: "Dispute Resolved",
        body: params.resolutionDetails,
        data: {
          type: "dispute-resolved",
          disputeId: params.disputeId,
          resolution: params.resolution,
        },
      });
    } catch (error) {
      console.error("Resolve dispute error:", error);
      throw error;
    }
  }

  /**
   * Get dispute by ID
   */
  static async getDispute(disputeId: string): Promise<Dispute | null> {
    try {
      const doc = await db.collection(COLLECTIONS.DISPUTES).doc(disputeId).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as Dispute;
    } catch (error) {
      console.error("Get dispute error:", error);
      throw error;
    }
  }

  /**
   * Get user's disputes
   */
  static async getUserDisputes(userId: string): Promise<Dispute[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.DISPUTES)
        .where("initiatedBy", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      const snapshot2 = await db
        .collection(COLLECTIONS.DISPUTES)
        .where("againstUserId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      const disputes = [
        ...snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ...snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ];

      return disputes as Dispute[];
    } catch (error) {
      console.error("Get user disputes error:", error);
      throw error;
    }
  }

  /**
   * Get pending disputes (Admin only)
   */
  static async getPendingDisputes(): Promise<Dispute[]> {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.DISPUTES)
        .where("status", "in", ["open", "under-review"])
        .orderBy("createdAt", "asc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Dispute[];
    } catch (error) {
      console.error("Get pending disputes error:", error);
      throw error;
    }
  }

  /**
   * Update dispute status (Admin only)
   */
  static async updateStatus(params: {
    disputeId: string;
    adminId: string;
    status: DisputeStatus;
    notes?: string;
  }): Promise<void> {
    try {
      await db
        .collection(COLLECTIONS.DISPUTES)
        .doc(params.disputeId)
        .update({
          status: params.status,
          adminNotes: params.notes,
          updatedAt: new Date(),
        });
    } catch (error) {
      console.error("Update dispute status error:", error);
      throw error;
    }
  }

  /**
   * Upload dispute evidence file
   */
  static async uploadEvidenceFile(params: {
    disputeId: string;
    userId: string;
    file: Buffer;
    filename: string;
  }): Promise<string> {
    try {
      const { storage } = await import("../config/firebase");
      const bucket = storage.bucket();
      const filePath = `disputes/${params.disputeId}/${params.userId}/${Date.now()}_${params.filename}`;
      const file = bucket.file(filePath);

      await file.save(params.file, {
        metadata: {
          contentType: "image/jpeg",
          metadata: {
            disputeId: params.disputeId,
            userId: params.userId,
          },
        },
      });

      // Generate signed URL (valid for 30 days)
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });

      return url;
    } catch (error) {
      console.error("Upload evidence file error:", error);
      throw new Error("Failed to upload evidence");
    }
  }
}
