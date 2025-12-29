import * as functions from "firebase-functions";

/**
 * Firebase Cloud Functions Index
 * Phase 2: Wallet System + Escrow Engine
 */

// Wallet Functions
export {
  initializeDeposit,
  verifyDeposit,
  requestWithdrawal,
  getWalletBalance,
  getTransactionHistory,
} from "./wallet";

// P2P Functions
export {
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
  getUserOffers,
  searchOffers,
  getOfferDetails,
  createOrder,
  markOrderAsPaid,
  releaseCrypto,
  cancelOrder,
  getUserOrders,
  getOrderDetails,
  // Phase 3: Matching Engine
  findMatches,
  autoMatchOrder,
  getMarketDepth,
  suggestPrice,
  getMatchingStats,
} from "./p2p";

// Scheduled Functions
export {
  autoCancelExpiredOrders,
  updateUserRiskProfiles,
  cleanupExpiredEscrowLocks,
} from "./scheduled";

// Phase 4: KYC Functions
export {
  submitKYCLevel1,
  submitKYCLevel2,
  submitKYCLevel3,
  getKYCProfile,
  approveKYCLevel,
  rejectKYCSubmission,
  getPendingKYCSubmissions,
  uploadKYCDocument,
} from "./kyc";

// Phase 6: Chat Functions
export {
  sendChatMessage,
  getChatMessages,
  markMessagesAsRead,
  uploadChatAttachment,
  getUnreadMessageCount,
} from "./chat";

// Phase 7: Dispute Functions
export {
  openDispute,
  addDisputeEvidence,
  resolveDispute,
  getDisputeDetails,
  getUserDisputes,
  getPendingDisputes,
  uploadDisputeEvidence,
} from "./disputes";

/**
 * Paystack Webhook Handler
 * Handles deposit confirmation webhooks
 */
export const paystackWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const { PaystackService } = await import("./utils/paystack");
    const { WalletService } = await import("./wallet/walletService");
    const { TransactionLogger } = await import("./utils/txLogger");

    // Verify webhook signature
    const signature = req.headers["x-paystack-signature"] as string;
    const body = JSON.stringify(req.body);

    if (!PaystackService.verifyWebhookSignature(body, signature)) {
      console.error("Invalid webhook signature");
      res.status(400).send("Invalid signature");
      return;
    }

    const event = req.body;

    console.log(`Paystack webhook received: ${event.event}`);

    // Handle charge.success event
    if (event.event === "charge.success") {
      const { reference, amount, metadata, customer } = event.data;

      if (metadata?.type === "wallet-deposit") {
        const userId = metadata.userId;
        const depositAmount = amount / 100; // Convert from kobo

        // Check if already processed
        const transactions = await TransactionLogger.getUserTransactions(userId, 100);
        const alreadyProcessed = transactions.some(
          (tx) => tx.metadata?.reference === reference && tx.status === "success"
        );

        if (!alreadyProcessed) {
          // Credit wallet
          await WalletService.creditWallet({
            userId,
            amount: depositAmount,
            type: "deposit",
            metadata: {
              reference,
              paystackReference: reference,
              email: customer.email,
              webhook: true,
            },
          });

          console.log(`Wallet credited via webhook: ${userId} + ${depositAmount}`);
        }
      }
    }

    res.status(200).send("Webhook processed");
  } catch (error) {
    console.error("Paystack webhook error:", error);
    res.status(500).send("Webhook processing failed");
  }
});

/**
 * User Signup Trigger
 * Create wallet automatically when user signs up
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const { WalletService } = await import("./wallet/walletService");

    await WalletService.createWallet(user.uid);

    console.log(`Wallet created for new user: ${user.uid}`);
  } catch (error) {
    console.error("Failed to create wallet for new user:", error);
  }
});

/**
 * Health Check Endpoint
 */
export const healthCheck = functions.https.onRequest((req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
  });
});
