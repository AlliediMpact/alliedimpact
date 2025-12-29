import * as functions from "firebase-functions";
import { KYCService } from "./kycService";
import { validate, ValidationException, sanitize } from "../utils/validate";
import { ERROR_CODES } from "../config/constants";
import { CloudFunctionResponse, KYCLevel } from "../types";

/**
 * Submit Level 1 KYC
 */
export const submitKYCLevel1 = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { firstName, lastName, dateOfBirth, nationality, phoneNumber } = data;

      await KYCService.submitLevel1({
        userId,
        firstName: sanitize.string(firstName, 100),
        lastName: sanitize.string(lastName, 100),
        dateOfBirth: new Date(dateOfBirth),
        nationality: sanitize.string(nationality, 50),
        phoneNumber: sanitize.string(phoneNumber, 20),
      });

      return {
        success: true,
        data: { message: "Level 1 KYC submitted successfully" },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Submit KYC Level 1 error:", error);

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
 * Submit Level 2 KYC
 */
export const submitKYCLevel2 = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const {
        documentType,
        documentNumber,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
      } = data;

      await KYCService.submitLevel2({
        userId,
        documentType,
        documentNumber: sanitize.string(documentNumber, 50),
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
      });

      return {
        success: true,
        data: { message: "Level 2 KYC submitted successfully" },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Submit KYC Level 2 error:", error);

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
 * Submit Level 3 KYC
 */
export const submitKYCLevel3 = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const {
        address,
        city,
        state,
        postalCode,
        country,
        proofOfAddressUrl,
        proofOfAddressType,
      } = data;

      await KYCService.submitLevel3({
        userId,
        address: sanitize.string(address, 200),
        city: sanitize.string(city, 100),
        state: sanitize.string(state, 100),
        postalCode: sanitize.string(postalCode, 20),
        country: sanitize.string(country, 100),
        proofOfAddressUrl,
        proofOfAddressType,
      });

      return {
        success: true,
        data: { message: "Level 3 KYC submitted successfully" },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Submit KYC Level 3 error:", error);

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
 * Get KYC Profile
 */
export const getKYCProfile = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const profile = await KYCService.getProfile(userId);

      if (!profile) {
        // Create initial profile
        await KYCService.createProfile(userId);
        const newProfile = await KYCService.getProfile(userId);
        return {
          success: true,
          data: newProfile,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: profile,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get KYC profile error:", error);

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
 * Approve KYC Level (Admin only)
 */
export const approveKYCLevel = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      // TODO: Add admin role check
      const adminId = context.auth.uid;
      const { userId, level, notes } = data;

      await KYCService.approveLevel({
        userId,
        level: level as KYCLevel,
        reviewedBy: adminId,
        notes,
      });

      return {
        success: true,
        data: { message: "KYC approved successfully" },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Approve KYC error:", error);

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
 * Reject KYC Submission (Admin only)
 */
export const rejectKYCSubmission = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      // TODO: Add admin role check
      const adminId = context.auth.uid;
      const { userId, reason } = data;

      await KYCService.rejectSubmission({
        userId,
        reason,
        reviewedBy: adminId,
      });

      return {
        success: true,
        data: { message: "KYC rejected" },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Reject KYC error:", error);

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
 * Get Pending KYC Submissions (Admin only)
 */
export const getPendingKYCSubmissions = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      // TODO: Add admin role check

      const submissions = await KYCService.getPendingSubmissions();

      return {
        success: true,
        data: submissions,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get pending KYC error:", error);

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
 * Upload KYC Document
 */
export const uploadKYCDocument = functions.https.onCall(
  async (data: any, context: any): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { documentType, fileData, filename } = data;

      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, "base64");

      const url = await KYCService.uploadDocument({
        userId,
        documentType,
        file: buffer,
        filename,
      });

      return {
        success: true,
        data: { url },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Upload document error:", error);

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
