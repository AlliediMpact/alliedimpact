import { db, FieldValue } from "../config/firebase";
import { COLLECTIONS, ERROR_CODES } from "../config/constants";
import { Wallet } from "../types";
import { TransactionLogger } from "../utils/txLogger";

/**
 * Wallet Management Service
 * All wallet operations must be atomic and transactional
 */

export class WalletService {
  /**
   * Create wallet for new user
   */
  static async createWallet(userId: string): Promise<Wallet> {
    const walletRef = db.collection(COLLECTIONS.WALLETS).doc(userId);

    const existingWallet = await walletRef.get();
    if (existingWallet.exists) {
      return existingWallet.data() as Wallet;
    }

    const wallet: Wallet = {
      userId,
      balance: 0,
      lockedBalance: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEscrowLocked: 0,
      totalEscrowReleased: 0,
      lastTransactionAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await walletRef.set(wallet);

    console.log(`Wallet created for user: ${userId}`);

    return wallet;
  }

  /**
   * Get wallet by user ID
   */
  static async getWallet(userId: string): Promise<Wallet | null> {
    const walletDoc = await db.collection(COLLECTIONS.WALLETS).doc(userId).get();

    if (!walletDoc.exists) {
      return null;
    }

    return walletDoc.data() as Wallet;
  }

  /**
   * Credit wallet (add funds) - ATOMIC
   */
  static async creditWallet(params: {
    userId: string;
    amount: number;
    type: "deposit" | "receive" | "escrow-refund";
    metadata?: any;
    relatedOrderId?: string;
  }): Promise<{ success: boolean; newBalance: number; transactionId: string }> {
    const walletRef = db.collection(COLLECTIONS.WALLETS).doc(params.userId);

    return await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error(ERROR_CODES.WALLET_NOT_FOUND);
      }

      const wallet = walletDoc.data() as Wallet;
      const balanceBefore = wallet.balance;
      const newBalance = balanceBefore + params.amount;

      // Update wallet
      transaction.update(walletRef, {
        balance: newBalance,
        totalDeposited: FieldValue.increment(params.amount),
        lastTransactionAt: new Date(),
        updatedAt: new Date(),
      });

      // Log transaction
      const transactionId = await TransactionLogger.log({
        userId: params.userId,
        type: params.type,
        amount: params.amount,
        status: "success",
        balanceBefore,
        balanceAfter: newBalance,
        relatedOrderId: params.relatedOrderId,
        metadata: params.metadata,
      });

      console.log(`Wallet credited: ${params.userId} + ${params.amount} = ${newBalance}`);

      return {
        success: true,
        newBalance,
        transactionId,
      };
    });
  }

  /**
   * Debit wallet (remove funds) - ATOMIC
   */
  static async debitWallet(params: {
    userId: string;
    amount: number;
    type: "withdrawal" | "send" | "fee";
    metadata?: any;
    relatedOrderId?: string;
  }): Promise<{ success: boolean; newBalance: number; transactionId: string }> {
    const walletRef = db.collection(COLLECTIONS.WALLETS).doc(params.userId);

    return await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error(ERROR_CODES.WALLET_NOT_FOUND);
      }

      const wallet = walletDoc.data() as Wallet;
      const balanceBefore = wallet.balance;

      // Check sufficient balance
      if (balanceBefore < params.amount) {
        throw new Error(ERROR_CODES.INSUFFICIENT_BALANCE);
      }

      const newBalance = balanceBefore - params.amount;

      // Update wallet
      transaction.update(walletRef, {
        balance: newBalance,
        totalWithdrawn: FieldValue.increment(params.amount),
        lastTransactionAt: new Date(),
        updatedAt: new Date(),
      });

      // Log transaction
      const transactionId = await TransactionLogger.log({
        userId: params.userId,
        type: params.type,
        amount: params.amount,
        status: "success",
        balanceBefore,
        balanceAfter: newBalance,
        relatedOrderId: params.relatedOrderId,
        metadata: params.metadata,
      });

      console.log(`Wallet debited: ${params.userId} - ${params.amount} = ${newBalance}`);

      return {
        success: true,
        newBalance,
        transactionId,
      };
    });
  }

  /**
   * Lock balance for escrow - ATOMIC
   */
  static async lockBalance(params: {
    userId: string;
    amount: number;
    orderId: string;
    metadata?: any;
  }): Promise<{ success: boolean; lockedBalance: number; transactionId: string }> {
    const walletRef = db.collection(COLLECTIONS.WALLETS).doc(params.userId);

    return await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error(ERROR_CODES.WALLET_NOT_FOUND);
      }

      const wallet = walletDoc.data() as Wallet;
      const availableBalance = wallet.balance;

      // Check sufficient balance
      if (availableBalance < params.amount) {
        throw new Error(ERROR_CODES.INSUFFICIENT_BALANCE);
      }

      const newBalance = availableBalance - params.amount;
      const newLockedBalance = wallet.lockedBalance + params.amount;

      // Update wallet
      transaction.update(walletRef, {
        balance: newBalance,
        lockedBalance: newLockedBalance,
        totalEscrowLocked: FieldValue.increment(params.amount),
        lastTransactionAt: new Date(),
        updatedAt: new Date(),
      });

      // Create escrow lock record
      const escrowLockRef = db.collection(COLLECTIONS.ESCROW_LOCKS).doc();
      transaction.set(escrowLockRef, {
        orderId: params.orderId,
        userId: params.userId,
        amount: params.amount,
        status: "locked",
        lockedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Log transaction
      const transactionId = await TransactionLogger.log({
        userId: params.userId,
        type: "escrow-lock",
        amount: params.amount,
        status: "success",
        balanceBefore: availableBalance,
        balanceAfter: newBalance,
        relatedOrderId: params.orderId,
        metadata: params.metadata,
      });

      console.log(`Balance locked: ${params.userId} - ${params.amount} (Order: ${params.orderId})`);

      return {
        success: true,
        lockedBalance: newLockedBalance,
        transactionId,
      };
    });
  }

  /**
   * Unlock balance (cancel escrow) - ATOMIC
   */
  static async unlockBalance(params: {
    userId: string;
    amount: number;
    orderId: string;
    metadata?: any;
  }): Promise<{ success: boolean; newBalance: number; transactionId: string }> {
    const walletRef = db.collection(COLLECTIONS.WALLETS).doc(params.userId);

    return await db.runTransaction(async (transaction) => {
      const walletDoc = await transaction.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error(ERROR_CODES.WALLET_NOT_FOUND);
      }

      const wallet = walletDoc.data() as Wallet;

      // Check sufficient locked balance
      if (wallet.lockedBalance < params.amount) {
        throw new Error(ERROR_CODES.ESCROW_NOT_LOCKED);
      }

      const newBalance = wallet.balance + params.amount;
      const newLockedBalance = wallet.lockedBalance - params.amount;

      // Update wallet
      transaction.update(walletRef, {
        balance: newBalance,
        lockedBalance: newLockedBalance,
        lastTransactionAt: new Date(),
        updatedAt: new Date(),
      });

      // Update escrow lock record
      const escrowLockSnapshot = await db
        .collection(COLLECTIONS.ESCROW_LOCKS)
        .where("orderId", "==", params.orderId)
        .where("status", "==", "locked")
        .limit(1)
        .get();

      if (!escrowLockSnapshot.empty) {
        transaction.update(escrowLockSnapshot.docs[0].ref, {
          status: "refunded",
          refundedAt: new Date(),
        });
      }

      // Log transaction
      const transactionId = await TransactionLogger.log({
        userId: params.userId,
        type: "escrow-refund",
        amount: params.amount,
        status: "success",
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
        relatedOrderId: params.orderId,
        metadata: params.metadata,
      });

      console.log(`Balance unlocked: ${params.userId} + ${params.amount} (Order: ${params.orderId})`);

      return {
        success: true,
        newBalance,
        transactionId,
      };
    });
  }

  /**
   * Release locked funds to buyer - ATOMIC
   */
  static async releaseLockedFunds(params: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    orderId: string;
    metadata?: any;
  }): Promise<{ success: boolean; transactionIds: string[] }> {
    const fromWalletRef = db.collection(COLLECTIONS.WALLETS).doc(params.fromUserId);
    const toWalletRef = db.collection(COLLECTIONS.WALLETS).doc(params.toUserId);

    return await db.runTransaction(async (transaction) => {
      const [fromWalletDoc, toWalletDoc] = await Promise.all([
        transaction.get(fromWalletRef),
        transaction.get(toWalletRef),
      ]);

      if (!fromWalletDoc.exists || !toWalletDoc.exists) {
        throw new Error(ERROR_CODES.WALLET_NOT_FOUND);
      }

      const fromWallet = fromWalletDoc.data() as Wallet;
      const toWallet = toWalletDoc.data() as Wallet;

      // Check sufficient locked balance
      if (fromWallet.lockedBalance < params.amount) {
        throw new Error(ERROR_CODES.ESCROW_NOT_LOCKED);
      }

      // Update seller wallet (unlock and remove)
      transaction.update(fromWalletRef, {
        lockedBalance: fromWallet.lockedBalance - params.amount,
        totalEscrowReleased: FieldValue.increment(params.amount),
        lastTransactionAt: new Date(),
        updatedAt: new Date(),
      });

      // Update buyer wallet (add funds)
      transaction.update(toWalletRef, {
        balance: toWallet.balance + params.amount,
        lastTransactionAt: new Date(),
        updatedAt: new Date(),
      });

      // Update escrow lock record
      const escrowLockSnapshot = await db
        .collection(COLLECTIONS.ESCROW_LOCKS)
        .where("orderId", "==", params.orderId)
        .where("status", "==", "locked")
        .limit(1)
        .get();

      if (!escrowLockSnapshot.empty) {
        transaction.update(escrowLockSnapshot.docs[0].ref, {
          status: "released",
          releasedAt: new Date(),
        });
      }

      // Log transactions
      const sellerTxId = await TransactionLogger.log({
        userId: params.fromUserId,
        type: "escrow-release",
        amount: -params.amount,
        status: "success",
        balanceBefore: fromWallet.balance,
        balanceAfter: fromWallet.balance,
        relatedUserId: params.toUserId,
        relatedOrderId: params.orderId,
        metadata: params.metadata,
      });

      const buyerTxId = await TransactionLogger.log({
        userId: params.toUserId,
        type: "receive",
        amount: params.amount,
        status: "success",
        balanceBefore: toWallet.balance,
        balanceAfter: toWallet.balance + params.amount,
        relatedUserId: params.fromUserId,
        relatedOrderId: params.orderId,
        metadata: params.metadata,
      });

      console.log(
        `Funds released: ${params.fromUserId} -> ${params.toUserId} (${params.amount}) Order: ${params.orderId}`
      );

      return {
        success: true,
        transactionIds: [sellerTxId, buyerTxId],
      };
    });
  }
}
