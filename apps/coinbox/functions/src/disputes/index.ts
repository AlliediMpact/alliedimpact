import * as functions from "firebase-functions";
import { DisputeService } from "./disputeService";
import { sanitize } from "../utils/validate";
import { ERROR_CODES } from "../config/constants";
import { CloudFunctionResponse } from "../types";

/**
 * Open Dispute (Phase 7)
 */
export const openDispute = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { orderId, reason, description, evidence } = data;

      const disputeId = await DisputeService.openDispute({
        orderId,
        userId,
        reason: sanitize.string(reason, 200),
        description: sanitize.string(description, 2000),
        evidence,
      });

      return {
        success: true,
        data: { disputeId },
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
 * Add Evidence to Dispute (Phase 7)
 */
export const addDisputeEvidence = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { disputeId, evidence } = data;

      await DisputeService.addEvidence({
        disputeId,
        userId,
        evidence,
      });

      return {
        success: true,
        data: { message: "Evidence added successfully" },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Add evidence error:", error);

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
 * Resolve Dispute (Admin Only - Phase 7)
 */
export const resolveDispute = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      // TODO: Add admin role check
      const adminId = context.auth.uid;
      const { disputeId, resolution, resolutionDetails, adminNotes } = data;

      await DisputeService.resolveDispute({
        disputeId,
        adminId,
        resolution,
        resolutionDetails: sanitize.string(resolutionDetails, 1000),
        adminNotes: adminNotes ? sanitize.string(adminNotes, 1000) : undefined,
      });

      return {
        success: true,
        data: { message: "Dispute resolved successfully" },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Resolve dispute error:", error);

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
 * Get Dispute Details (Phase 7)
 */
export const getDisputeDetails = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const { disputeId } = data;
      const dispute = await DisputeService.getDispute(disputeId);

      if (!dispute) {
        throw new Error("Dispute not found");
      }

      return {
        success: true,
        data: dispute,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get dispute error:", error);

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
 * Get User Disputes (Phase 7)
 */
export const getUserDisputes = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const disputes = await DisputeService.getUserDisputes(userId);

      return {
        success: true,
        data: { disputes },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get user disputes error:", error);

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
 * Get Pending Disputes (Admin Only - Phase 7)
 */
export const getPendingDisputes = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      // TODO: Add admin role check

      const disputes = await DisputeService.getPendingDisputes();

      return {
        success: true,
        data: { disputes },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get pending disputes error:", error);

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
 * Upload Dispute Evidence File (Phase 7)
 */
export const uploadDisputeEvidence = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { disputeId, fileData, filename } = data;

      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, "base64");

      const url = await DisputeService.uploadEvidenceFile({
        disputeId,
        userId,
        file: buffer,
        filename,
      });

      return {
        success: true,
        data: { url },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Upload evidence error:", error);

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
