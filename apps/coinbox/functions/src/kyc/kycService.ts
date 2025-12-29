import { db, storage } from "../config/firebase";
import { COLLECTIONS, ERROR_CODES } from "../config/constants";
import { KYCProfile, KYCLevel, KYCStatus, KYC_REQUIREMENTS } from "../types/kyc";
import { NotificationService } from "../utils/notifications";

/**
 * KYC Service
 * Phase 4: Identity Verification System
 */

export class KYCService {
  /**
   * Create initial KYC profile for new user
   */
  static async createProfile(userId: string): Promise<void> {
    const profile: Omit<KYCProfile, "id"> = {
      userId,
      level: 0,
      status: "not-started",
      phoneVerified: false,
      documentVerified: false,
      addressVerified: false,
      dailyTradeLimit: 0,
      monthlyTradeLimit: 0,
      maxOrderSize: 0,
      verificationHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection(COLLECTIONS.KYC_PROFILES).doc(userId).set(profile);
  }

  /**
   * Get KYC profile for user
   */
  static async getProfile(userId: string): Promise<KYCProfile | null> {
    const doc = await db.collection(COLLECTIONS.KYC_PROFILES).doc(userId).get();

    if (!doc.exists) {
      return null;
    }

    return { ...doc.data() } as KYCProfile;
  }

  /**
   * Submit Level 1 KYC (Basic Info)
   */
  static async submitLevel1(params: {
    userId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    phoneNumber: string;
  }): Promise<void> {
    const profile = await this.getProfile(params.userId);

    if (!profile) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    // Update profile
    const updates: Partial<KYCProfile> = {
      firstName: params.firstName,
      lastName: params.lastName,
      dateOfBirth: params.dateOfBirth,
      nationality: params.nationality,
      phoneNumber: params.phoneNumber,
      status: "pending",
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection(COLLECTIONS.KYC_PROFILES).doc(params.userId).update(updates);

    // Send notification
    await NotificationService.sendNotification({
      userId: params.userId,
      title: "KYC Submission Received",
      body: "Your Level 1 KYC information has been submitted for review",
      data: { type: "kyc-submitted", level: "1" },
    });
  }

  /**
   * Submit Level 2 KYC (ID Verification)
   */
  static async submitLevel2(params: {
    userId: string;
    documentType: string;
    documentNumber: string;
    documentFrontUrl: string;
    documentBackUrl: string;
    selfieUrl: string;
  }): Promise<void> {
    const profile = await this.getProfile(params.userId);

    if (!profile) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    // Ensure Level 1 is completed
    if (profile.level < 1) {
      throw new Error("Complete Level 1 KYC first");
    }

    // Update profile
    const updates: Partial<KYCProfile> = {
      documentType: params.documentType as any,
      documentNumber: params.documentNumber,
      documentFrontUrl: params.documentFrontUrl,
      documentBackUrl: params.documentBackUrl,
      selfieUrl: params.selfieUrl,
      status: "pending",
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection(COLLECTIONS.KYC_PROFILES).doc(params.userId).update(updates);

    // Send notification
    await NotificationService.sendNotification({
      userId: params.userId,
      title: "ID Verification Submitted",
      body: "Your identity documents are being reviewed",
      data: { type: "kyc-submitted", level: "2" },
    });
  }

  /**
   * Submit Level 3 KYC (Address Verification)
   */
  static async submitLevel3(params: {
    userId: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    proofOfAddressUrl: string;
    proofOfAddressType: "utility-bill" | "bank-statement" | "rental-agreement";
  }): Promise<void> {
    const profile = await this.getProfile(params.userId);

    if (!profile) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    // Ensure Level 2 is completed
    if (profile.level < 2) {
      throw new Error("Complete Level 2 KYC first");
    }

    // Update profile
    const updates: Partial<KYCProfile> = {
      address: params.address,
      city: params.city,
      state: params.state,
      postalCode: params.postalCode,
      country: params.country,
      proofOfAddressUrl: params.proofOfAddressUrl,
      proofOfAddressType: params.proofOfAddressType,
      status: "pending",
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection(COLLECTIONS.KYC_PROFILES).doc(params.userId).update(updates);

    // Send notification
    await NotificationService.sendNotification({
      userId: params.userId,
      title: "Address Verification Submitted",
      body: "Your proof of address is being reviewed",
      data: { type: "kyc-submitted", level: "3" },
    });
  }

  /**
   * Approve KYC Level (Admin only)
   */
  static async approveLevel(params: {
    userId: string;
    level: KYCLevel;
    reviewedBy: string;
    notes?: string;
  }): Promise<void> {
    const profile = await this.getProfile(params.userId);

    if (!profile) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    const requirements = KYC_REQUIREMENTS[params.level];

    // Update profile
    const updates: Partial<KYCProfile> = {
      level: params.level,
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: params.reviewedBy,
      dailyTradeLimit: requirements.dailyLimit,
      monthlyTradeLimit: requirements.monthlyLimit,
      maxOrderSize: requirements.maxOrderSize,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      updatedAt: new Date(),
    };

    // Mark verification flags
    if (params.level >= 1) updates.phoneVerified = true;
    if (params.level >= 2) updates.documentVerified = true;
    if (params.level >= 3) updates.addressVerified = true;

    // Add to history
    const historyEntry = {
      level: params.level,
      status: "approved" as KYCStatus,
      timestamp: new Date(),
      notes: params.notes,
      reviewedBy: params.reviewedBy,
    };

    await db.collection(COLLECTIONS.KYC_PROFILES).doc(params.userId).update({
      ...updates,
      verificationHistory: [...profile.verificationHistory, historyEntry],
    });

    // Send notification
    await NotificationService.sendNotification({
      userId: params.userId,
      title: "KYC Approved! 🎉",
      body: `Your Level ${params.level} KYC has been approved`,
      data: { type: "kyc-approved", level: params.level.toString() },
    });
  }

  /**
   * Reject KYC Submission (Admin only)
   */
  static async rejectSubmission(params: {
    userId: string;
    reason: string;
    reviewedBy: string;
  }): Promise<void> {
    const profile = await this.getProfile(params.userId);

    if (!profile) {
      throw new Error(ERROR_CODES.USER_NOT_FOUND);
    }

    // Add to history
    const historyEntry = {
      level: profile.level,
      status: "rejected" as KYCStatus,
      timestamp: new Date(),
      notes: params.reason,
      reviewedBy: params.reviewedBy,
    };

    await db.collection(COLLECTIONS.KYC_PROFILES).doc(params.userId).update({
      status: "rejected",
      rejectionReason: params.reason,
      reviewedAt: new Date(),
      reviewedBy: params.reviewedBy,
      updatedAt: new Date(),
      verificationHistory: [...profile.verificationHistory, historyEntry],
    });

    // Send notification
    await NotificationService.sendNotification({
      userId: params.userId,
      title: "KYC Rejected",
      body: "Your KYC submission needs attention. Please review and resubmit.",
      data: { type: "kyc-rejected", reason: params.reason },
    });
  }

  /**
   * Check if user can perform action based on KYC level
   */
  static async validateAction(params: {
    userId: string;
    action: "trade" | "withdraw" | "create-offer";
    amount?: number;
  }): Promise<{ allowed: boolean; reason?: string }> {
    const profile = await this.getProfile(params.userId);

    if (!profile) {
      return { allowed: false, reason: "KYC profile not found" };
    }

    if (profile.status !== "approved") {
      return { allowed: false, reason: "KYC verification required" };
    }

    // Check expiration
    if (profile.expiresAt && new Date() > profile.expiresAt) {
      return { allowed: false, reason: "KYC verification expired" };
    }

    const requirements = KYC_REQUIREMENTS[profile.level];

    // Check action permissions
    if (params.action === "trade" && !requirements.canTrade) {
      return { allowed: false, reason: `KYC Level ${profile.level} cannot trade` };
    }

    if (params.action === "withdraw" && !requirements.canWithdraw) {
      return { allowed: false, reason: `KYC Level ${profile.level} cannot withdraw` };
    }

    // Check amount limits
    if (params.amount) {
      if (params.amount > profile.maxOrderSize) {
        return {
          allowed: false,
          reason: `Amount exceeds max order size (${profile.maxOrderSize})`,
        };
      }

      // Could also check daily/monthly limits here
    }

    return { allowed: true };
  }

  /**
   * Upload document to secure storage
   */
  static async uploadDocument(params: {
    userId: string;
    documentType: string;
    file: Buffer;
    filename: string;
  }): Promise<string> {
    try {
      const bucket = storage.bucket();
      const filePath = `kyc/${params.userId}/${params.documentType}/${Date.now()}_${params.filename}`;
      const file = bucket.file(filePath);

      await file.save(params.file, {
        metadata: {
          contentType: "image/jpeg",
          metadata: {
            userId: params.userId,
            documentType: params.documentType,
          },
        },
      });

      // Make file temporarily accessible (expires in 7 days)
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      return url;
    } catch (error) {
      console.error("Document upload error:", error);
      throw new Error("Failed to upload document");
    }
  }

  /**
   * Get all pending KYC submissions (Admin only)
   */
  static async getPendingSubmissions(): Promise<KYCProfile[]> {
    const snapshot = await db
      .collection(COLLECTIONS.KYC_PROFILES)
      .where("status", "in", ["pending", "under-review"])
      .orderBy("submittedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({ ...doc.data() } as KYCProfile));
  }
}
