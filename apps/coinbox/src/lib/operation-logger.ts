/**
 * Operation Logger - Ensures Idempotency for All Money Operations
 * 
 * Every operation that moves money MUST use a unique operationId
 * and check this log before executing to prevent duplicate transactions.
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';

export interface Operation {
  id: string;
  type: 'savings_deposit' | 'savings_withdrawal' | 'stokvel_contribution' | 'stokvel_payout' | 'loan_disbursement' | 'loan_repayment';
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  metadata: Record<string, any>;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  error?: string;
}

class OperationLogger {
  private readonly collectionName = 'operations_log';

  /**
   * Check if an operation has already been executed
   */
  async hasExecuted(operationId: string): Promise<boolean> {
    try {
      const operationRef = doc(db, this.collectionName, operationId);
      const operationDoc = await getDoc(operationRef);
      
      if (!operationDoc.exists()) {
        return false;
      }

      const data = operationDoc.data() as Operation;
      return data.status === 'completed';
    } catch (error) {
      console.error('Error checking operation:', error);
      throw error;
    }
  }

  /**
   * Start an operation (mark as pending)
   */
  async start(
    operationId: string,
    type: Operation['type'],
    userId: string,
    amount: number,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Check if already exists
      if (await this.hasExecuted(operationId)) {
        throw new Error(`Operation ${operationId} already completed`);
      }

      const operationRef = doc(db, this.collectionName, operationId);
      const existingDoc = await getDoc(operationRef);

      if (existingDoc.exists()) {
        const data = existingDoc.data() as Operation;
        if (data.status === 'pending') {
          throw new Error(`Operation ${operationId} is already in progress`);
        }
        // If failed, allow retry
        if (data.status === 'failed') {
          console.log(`Retrying failed operation: ${operationId}`);
        }
      }

      const operation: Operation = {
        id: operationId,
        type,
        userId,
        amount,
        status: 'pending',
        metadata,
        createdAt: serverTimestamp() as Timestamp,
      };

      await setDoc(operationRef, operation);
    } catch (error) {
      console.error('Error starting operation:', error);
      throw error;
    }
  }

  /**
   * Mark operation as completed
   */
  async complete(operationId: string): Promise<void> {
    try {
      const operationRef = doc(db, this.collectionName, operationId);
      await setDoc(operationRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error completing operation:', error);
      throw error;
    }
  }

  /**
   * Mark operation as failed
   */
  async fail(operationId: string, error: string): Promise<void> {
    try {
      const operationRef = doc(db, this.collectionName, operationId);
      await setDoc(operationRef, {
        status: 'failed',
        error,
        completedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Error marking operation as failed:', err);
      throw err;
    }
  }

  /**
   * Get operation details
   */
  async getOperation(operationId: string): Promise<Operation | null> {
    try {
      const operationRef = doc(db, this.collectionName, operationId);
      const operationDoc = await getDoc(operationRef);
      
      if (!operationDoc.exists()) {
        return null;
      }

      return operationDoc.data() as Operation;
    } catch (error) {
      console.error('Error getting operation:', error);
      throw error;
    }
  }

  /**
   * Generate a unique operation ID
   * Format: {type}_{userId}_{timestamp}_{random}
   */
  generateOperationId(type: string, userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}_${userId}_${timestamp}_${random}`;
  }
}

export const operationLogger = new OperationLogger();

/**
 * Wrapper function for idempotent operations
 * 
 * Usage:
 * ```typescript
 * await executeIdempotent(operationId, 'savings_deposit', userId, amount, async () => {
 *   // Your operation logic here
 *   await transferMoney(from, to, amount);
 * });
 * ```
 */
export async function executeIdempotent<T>(
  operationId: string,
  type: Operation['type'],
  userId: string,
  amount: number,
  operation: () => Promise<T>,
  metadata: Record<string, any> = {}
): Promise<T> {
  // Check if already executed
  if (await operationLogger.hasExecuted(operationId)) {
    console.log(`Operation ${operationId} already completed, skipping`);
    const existingOp = await operationLogger.getOperation(operationId);
    if (existingOp?.metadata?.result) {
      return existingOp.metadata.result as T;
    }
    throw new Error(`Operation ${operationId} already completed`);
  }

  // Start operation
  await operationLogger.start(operationId, type, userId, amount, metadata);

  try {
    // Execute operation
    const result = await operation();

    // Mark as completed
    await operationLogger.complete(operationId);

    return result;
  } catch (error: any) {
    // Mark as failed
    await operationLogger.fail(operationId, error.message);
    throw error;
  }
}
