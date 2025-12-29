import { db } from "../config/firebase";
import { COLLECTIONS, CONFIG } from "../config/constants";
import { FraudLog, UserRiskProfile, RiskLevel } from "../types";

/**
 * Fraud Detection and Prevention Utility
 */

export class FraudDetection {
  /**
   * Check if user is suspended
   */
  static async isUserSuspended(userId: string): Promise<boolean> {
    const profile = await this.getUserRiskProfile(userId);
    return profile?.isSuspended || false;
  }

  /**
   * Get user risk profile
   */
  static async getUserRiskProfile(userId: string): Promise<UserRiskProfile | null> {
    const doc = await db.collection(COLLECTIONS.USER_RISK_PROFILES).doc(userId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as UserRiskProfile;
  }

  /**
   * Create or update user risk profile
   */
  static async updateRiskProfile(userId: string): Promise<void> {
    const ordersSnapshot = await db
      .collection(COLLECTIONS.P2P_ORDERS)
      .where("buyerId", "==", userId)
      .get();

    const sellerOrdersSnapshot = await db
      .collection(COLLECTIONS.P2P_ORDERS)
      .where("sellerId", "==", userId)
      .get();

    const allOrders = [...ordersSnapshot.docs, ...sellerOrdersSnapshot.docs];
    const totalOrders = allOrders.length;
    const completedOrders = allOrders.filter((doc) => doc.data().status === "completed").length;
    const cancelledOrders = allOrders.filter((doc) => doc.data().status === "cancelled").length;
    const disputedOrders = allOrders.filter((doc) => doc.data().status === "disputed").length;

    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 100;

    // Calculate risk score (0-100, higher is riskier)
    let riskScore = 0;

    // Cancellation rate impact (max 40 points)
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
    riskScore += Math.min(cancellationRate, 40);

    // Dispute rate impact (max 30 points)
    const disputeRate = totalOrders > 0 ? (disputedOrders / totalOrders) * 100 : 0;
    riskScore += Math.min(disputeRate * 1.5, 30);

    // Low completion rate impact (max 30 points)
    if (completionRate < CONFIG.FRAUD.MIN_COMPLETION_RATE) {
      riskScore += 30 - (completionRate / CONFIG.FRAUD.MIN_COMPLETION_RATE) * 30;
    }

    // Determine risk level
    let riskLevel: RiskLevel = "low";
    if (riskScore >= CONFIG.FRAUD.HIGH_RISK_THRESHOLD) {
      riskLevel = "critical";
    } else if (riskScore >= CONFIG.FRAUD.MEDIUM_RISK_THRESHOLD) {
      riskLevel = "high";
    } else if (riskScore >= 20) {
      riskLevel = "medium";
    }

    const flags: string[] = [];
    if (cancellationRate > 30) flags.push("high-cancellation-rate");
    if (disputeRate > 10) flags.push("high-dispute-rate");
    if (completionRate < 70) flags.push("low-completion-rate");

    const profile: UserRiskProfile = {
      userId,
      riskScore,
      riskLevel,
      totalOrders,
      cancelledOrders,
      disputedOrders,
      failedPayments: 0,
      successfulOrders: completedOrders,
      completionRate,
      averageReleaseTime: 0,
      lastActivityAt: new Date(),
      isSuspended: riskLevel === "critical",
      suspensionReason: riskLevel === "critical" ? "High risk activity detected" : undefined,
      flags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection(COLLECTIONS.USER_RISK_PROFILES).doc(userId).set(profile, { merge: true });

    console.log(`Risk profile updated for user ${userId}: ${riskLevel} (${riskScore})`);
  }

  /**
   * Log suspicious activity
   */
  static async logSuspiciousActivity(params: {
    userId: string;
    type: "suspicious-activity" | "failed-payment" | "multiple-cancels" | "rapid-orders";
    description: string;
    severity: RiskLevel;
    metadata?: any;
    ipAddress?: string;
    deviceId?: string;
  }): Promise<void> {
    const logRef = db.collection(COLLECTIONS.FRAUD_LOGS).doc();

    const fraudLog: Omit<FraudLog, "id"> = {
      userId: params.userId,
      type: params.type,
      description: params.description,
      severity: params.severity,
      metadata: params.metadata || {},
      ipAddress: params.ipAddress,
      deviceId: params.deviceId,
      createdAt: new Date(),
    };

    await logRef.set(fraudLog);

    console.log(`Fraud log created: ${params.userId} - ${params.type} - ${params.severity}`);

    // Update risk profile
    await this.updateRiskProfile(params.userId);
  }

  /**
   * Check for rapid order creation (potential abuse)
   */
  static async checkRapidOrders(userId: string): Promise<boolean> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentOrders = await db
      .collection(COLLECTIONS.P2P_ORDERS)
      .where("buyerId", "==", userId)
      .where("createdAt", ">=", tenMinutesAgo)
      .get();

    if (recentOrders.size >= CONFIG.FRAUD.SUSPICIOUS_RAPID_ORDERS) {
      await this.logSuspiciousActivity({
        userId,
        type: "rapid-orders",
        description: `Created ${recentOrders.size} orders in 10 minutes`,
        severity: "high",
        metadata: { orderCount: recentOrders.size },
      });

      return true;
    }

    return false;
  }

  /**
   * Check for multiple unpaid orders
   */
  static async checkUnpaidOrders(userId: string): Promise<boolean> {
    const unpaidOrders = await db
      .collection(COLLECTIONS.P2P_ORDERS)
      .where("buyerId", "==", userId)
      .where("status", "==", "pending-payment")
      .get();

    if (unpaidOrders.size >= 3) {
      await this.logSuspiciousActivity({
        userId,
        type: "suspicious-activity",
        description: `Has ${unpaidOrders.size} unpaid orders`,
        severity: "medium",
        metadata: { unpaidCount: unpaidOrders.size },
      });

      return true;
    }

    return false;
  }

  /**
   * Validate user can create order
   */
  static async validateUserCanTrade(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Check if suspended
    const isSuspended = await this.isUserSuspended(userId);
    if (isSuspended) {
      return {
        allowed: false,
        reason: "Your account has been suspended due to suspicious activity",
      };
    }

    // Check risk profile
    const profile = await this.getUserRiskProfile(userId);
    if (profile && profile.riskLevel === "critical") {
      return {
        allowed: false,
        reason: "Your account is under review. Please contact support.",
      };
    }

    // Check rapid orders
    const hasRapidOrders = await this.checkRapidOrders(userId);
    if (hasRapidOrders) {
      return {
        allowed: false,
        reason: "Too many orders created recently. Please wait before creating new orders.",
      };
    }

    // Check unpaid orders
    const hasUnpaidOrders = await this.checkUnpaidOrders(userId);
    if (hasUnpaidOrders) {
      return {
        allowed: false,
        reason: "Please complete or cancel your pending orders before creating new ones.",
      };
    }

    return { allowed: true };
  }
}
