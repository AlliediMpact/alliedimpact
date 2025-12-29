import * as functions from "firebase-functions";
import { WalletService } from "./walletService";
import { PaystackService } from "../utils/paystack";
import { validate, ValidationException } from "../utils/validate";
import { TransactionLogger } from "../utils/txLogger";
import { NotificationService } from "../utils/notifications";
import { ERROR_CODES, CONFIG } from "../config/constants";
import { CloudFunctionResponse } from "../types";

/**
 * Initialize Deposit
 * Create a Paystack payment link for wallet deposit
 */
export const initializeDeposit = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      // Check authentication
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { amount, email } = data;

      // Validate input
      validate.run([
        validate.amount(amount),
        validate.email(email),
      ]);

      // Check minimum deposit
      if (amount < CONFIG.WALLET.MIN_DEPOSIT) {
        throw new Error(`Minimum deposit is ${CONFIG.WALLET.MIN_DEPOSIT}`);
      }

      // Ensure wallet exists
      let wallet = await WalletService.getWallet(userId);
      if (!wallet) {
        wallet = await WalletService.createWallet(userId);
      }

      // Generate unique reference
      const reference = PaystackService.generateReference("DEP");

      // Log pending transaction
      const transactionId = await TransactionLogger.log({
        userId,
        type: "deposit",
        amount,
        status: "pending",
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
        metadata: {
          reference,
          email,
          method: "paystack",
        },
      });

      // Initialize Paystack transaction
      const paystackResult = await PaystackService.initializeTransaction({
        email,
        amount,
        reference,
        metadata: {
          userId,
          type: "wallet-deposit",
          transactionId,
        },
      });

      if (!paystackResult.success) {
        await TransactionLogger.updateStatus(transactionId, "failed", {
          error: paystackResult.error,
        });

        throw new Error(paystackResult.error);
      }

      return {
        success: true,
        data: {
          authorizationUrl: paystackResult.data.authorization_url,
          accessCode: paystackResult.data.access_code,
          reference,
          transactionId,
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Initialize deposit error:", error);

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
          code: ERROR_CODES.TRANSACTION_FAILED,
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }
);

/**
 * Verify Deposit
 * Verify Paystack payment and credit wallet
 */
export const verifyDeposit = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      // Check authentication
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { reference } = data;

      if (!reference) {
        throw new Error("Payment reference is required");
      }

      // Verify transaction with Paystack
      const verificationResult = await PaystackService.verifyTransaction(reference);

      if (!verificationResult.success) {
        throw new Error(verificationResult.error);
      }

      const paymentData = verificationResult.data;

      // Check if payment was successful
      if (paymentData.status !== "success") {
        throw new Error(`Payment ${paymentData.status}`);
      }

      // Check if already processed
      const existingTransactions = await TransactionLogger.getUserTransactions(userId, 100);
      const alreadyProcessed = existingTransactions.some(
        (tx) => tx.metadata?.reference === reference && tx.status === "success"
      );

      if (alreadyProcessed) {
        throw new Error(ERROR_CODES.DUPLICATE_TRANSACTION);
      }

      // Convert from kobo to naira
      const amount = paymentData.amount / 100;

      // Credit wallet
      const result = await WalletService.creditWallet({
        userId,
        amount,
        type: "deposit",
        metadata: {
          reference,
          paystackReference: paymentData.reference,
          channel: paymentData.channel,
          paidAt: paymentData.paid_at,
        },
      });

      // Send notification
      await NotificationService.sendWalletNotification({
        userId,
        type: "deposit-success",
        amount,
        data: {
          reference,
          newBalance: result.newBalance,
        },
      });

      return {
        success: true,
        data: {
          amount,
          newBalance: result.newBalance,
          transactionId: result.transactionId,
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Verify deposit error:", error);

      return {
        success: false,
        error: {
          code: ERROR_CODES.PAYMENT_VERIFICATION_FAILED,
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }
);

/**
 * Request Withdrawal
 * Initiate withdrawal to bank account
 */
export const requestWithdrawal = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      // Check authentication
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { amount, accountNumber, bankCode, accountName } = data;

      // Validate input
      validate.run([validate.amount(amount)]);

      // Check minimum withdrawal
      if (amount < CONFIG.WALLET.MIN_WITHDRAWAL) {
        throw new Error(`Minimum withdrawal is ${CONFIG.WALLET.MIN_WITHDRAWAL}`);
      }

      // Check maximum withdrawal
      if (amount > CONFIG.WALLET.MAX_WITHDRAWAL) {
        throw new Error(`Maximum withdrawal is ${CONFIG.WALLET.MAX_WITHDRAWAL}`);
      }

      // Get wallet
      const wallet = await WalletService.getWallet(userId);
      if (!wallet) {
        throw new Error(ERROR_CODES.WALLET_NOT_FOUND);
      }

      // Calculate total (amount + fee)
      const fee = CONFIG.WALLET.WITHDRAWAL_FEE;
      const totalAmount = amount + fee;

      // Check sufficient balance
      if (wallet.balance < totalAmount) {
        throw new Error(ERROR_CODES.INSUFFICIENT_BALANCE);
      }

      // Verify account with Paystack
      const accountVerification = await PaystackService.resolveAccountNumber(
        accountNumber,
        bankCode
      );

      if (!accountVerification.success) {
        throw new Error("Failed to verify bank account");
      }

      // Create transfer recipient
      const recipientResult = await PaystackService.createTransferRecipient({
        type: "nuban",
        name: accountName || accountVerification.data.account_name,
        account_number: accountNumber,
        bank_code: bankCode,
      });

      if (!recipientResult.success) {
        throw new Error("Failed to create transfer recipient");
      }

      // Generate reference
      const reference = PaystackService.generateReference("WTH");

      // Debit wallet (amount + fee)
      const debitResult = await WalletService.debitWallet({
        userId,
        amount: totalAmount,
        type: "withdrawal",
        metadata: {
          reference,
          accountNumber,
          bankCode,
          accountName: accountVerification.data.account_name,
          fee,
        },
      });

      // Initiate Paystack transfer
      const transferResult = await PaystackService.initiateTransfer({
        amount,
        recipient: recipientResult.data.recipient_code,
        reference,
        reason: "Wallet withdrawal",
      });

      if (!transferResult.success) {
        // Refund if transfer failed
        await WalletService.creditWallet({
          userId,
          amount: totalAmount,
          type: "escrow-refund",
          metadata: {
            reason: "Withdrawal failed",
            originalReference: reference,
          },
        });

        throw new Error(transferResult.error);
      }

      // Send notification
      await NotificationService.sendWalletNotification({
        userId,
        type: "withdrawal-success",
        amount,
        data: {
          reference,
          accountNumber,
          newBalance: debitResult.newBalance,
        },
      });

      return {
        success: true,
        data: {
          amount,
          fee,
          totalAmount,
          newBalance: debitResult.newBalance,
          reference,
          accountNumber,
          accountName: accountVerification.data.account_name,
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Request withdrawal error:", error);

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
          code: ERROR_CODES.TRANSACTION_FAILED,
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }
);

/**
 * Get Wallet Balance
 */
export const getWalletBalance = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;

      let wallet = await WalletService.getWallet(userId);

      // Create wallet if it doesn't exist
      if (!wallet) {
        wallet = await WalletService.createWallet(userId);
      }

      return {
        success: true,
        data: {
          balance: wallet.balance,
          lockedBalance: wallet.lockedBalance,
          availableBalance: wallet.balance,
          totalDeposited: wallet.totalDeposited,
          totalWithdrawn: wallet.totalWithdrawn,
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get wallet balance error:", error);

      return {
        success: false,
        error: {
          code: ERROR_CODES.WALLET_NOT_FOUND,
          message: error.message,
        },
        timestamp: new Date(),
      };
    }
  }
);

/**
 * Get Transaction History
 */
export const getTransactionHistory = functions.https.onCall(
  async (data, context): Promise<CloudFunctionResponse> => {
    try {
      if (!context.auth) {
        throw new Error(ERROR_CODES.UNAUTHORIZED);
      }

      const userId = context.auth.uid;
      const { limit = 50, type } = data;

      const transactions = await TransactionLogger.getUserTransactions(userId, limit, type);

      return {
        success: true,
        data: {
          transactions,
          total: transactions.length,
        },
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("Get transaction history error:", error);

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
