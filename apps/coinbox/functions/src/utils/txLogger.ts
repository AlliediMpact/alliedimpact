import { db, FieldValue } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";
import { Transaction, TransactionType, TransactionStatus } from "../types";

/**
 * Transaction Logger Utility
 */

export class TransactionLogger {
  /**
   * Log a transaction
   */
  static async log(params: {
    userId: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    balanceBefore: number;
    balanceAfter: number;
    relatedUserId?: string;
    relatedOrderId?: string;
    relatedOfferId?: string;
    metadata?: any;
  }): Promise<string> {
    const transactionRef = db.collection(COLLECTIONS.TRANSACTIONS).doc();

    const transaction: Omit<Transaction, "id"> = {
      userId: params.userId,
      type: params.type,
      amount: params.amount,
      status: params.status,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      relatedUserId: params.relatedUserId,
      relatedOrderId: params.relatedOrderId,
      relatedOfferId: params.relatedOfferId,
      metadata: params.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (params.status === "success") {
      transaction.processedAt = new Date();
    }

    await transactionRef.set(transaction);

    console.log(`Transaction logged: ${transactionRef.id} - ${params.type} - ${params.amount}`);

    return transactionRef.id;
  }

  /**
   * Update transaction status
   */
  static async updateStatus(
    transactionId: string,
    status: TransactionStatus,
    metadata?: any
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "success" || status === "failed") {
      updateData.processedAt = new Date();
    }

    if (metadata) {
      updateData.metadata = FieldValue.arrayUnion(metadata);
    }

    await db.collection(COLLECTIONS.TRANSACTIONS).doc(transactionId).update(updateData);

    console.log(`Transaction ${transactionId} status updated to: ${status}`);
  }

  /**
   * Get user transaction history
   */
  static async getUserTransactions(
    userId: string,
    limit = 50,
    type?: TransactionType
  ): Promise<Transaction[]> {
    let query = db
      .collection(COLLECTIONS.TRANSACTIONS)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (type) {
      query = query.where("type", "==", type) as any;
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(transactionId: string): Promise<Transaction | null> {
    const doc = await db.collection(COLLECTIONS.TRANSACTIONS).doc(transactionId).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Transaction;
  }

  /**
   * Get pending transactions for user
   */
  static async getPendingTransactions(userId: string): Promise<Transaction[]> {
    const snapshot = await db
      .collection(COLLECTIONS.TRANSACTIONS)
      .where("userId", "==", userId)
      .where("status", "==", "pending")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
  }
}
