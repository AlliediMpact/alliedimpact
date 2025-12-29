/**
 * Savings Jar Service
 * 
 * Automatically saves 1% of all profit events to a separate savings wallet.
 * Users can withdraw when balance >= R100 (or custom threshold).
 * 
 * Features:
 * - Auto-deposit 1% from profits
 * - Manual top-ups
 * - Withdrawal with 1% fee
 * - Transaction history
 * - Custom auto-threshold
 */

import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  Timestamp,
  serverTimestamp,
  runTransaction,
  increment,
  updateDoc,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { operationLogger, executeIdempotent } from './operation-logger';
import { SAVINGS_JAR_CONFIG } from './features';
import { 
  getCachedBalance, 
  getCachedJar, 
  invalidateUserCache,
  invalidateBalanceCache 
} from './savings-jar-cache';

export interface SavingsJar {
  userId: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  autoThreshold: number; // Min balance for withdrawal
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SavingsTransaction {
  id: string;
  userId: string;
  type: 'auto_deposit' | 'manual_deposit' | 'withdrawal';
  amount: number;
  fee?: number; // Withdrawal fee
  source: string; // e.g., 'loan_profit', 'crypto_profit', 'manual', 'stokvel_payout'
  balanceBefore: number;
  balanceAfter: number;
  operationId: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Timestamp;
  metadata?: Record<string, any>;
}

export interface DepositResult {
  success: boolean;
  transactionId: string;
  amount: number;
  newBalance: number;
  message: string;
}

export interface WithdrawalResult {
  success: boolean;
  transactionId: string;
  amount: number;
  fee: number;
  netAmount: number;
  newBalance: number;
  message: string;
}

class SavingsJarService {
  private readonly savingsJarCollection = 'savingsJar';
  private readonly transactionsCollection = 'savingsJarTransactions';

  /**
   * Initialize savings jar for a new user
   */
  async initializeSavingsJar(userId: string): Promise<void> {
    const jarRef = doc(db, this.savingsJarCollection, userId);
    const jarDoc = await getDoc(jarRef);

    if (!jarDoc.exists()) {
      const newJar: SavingsJar = {
        userId,
        balance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        autoThreshold: SAVINGS_JAR_CONFIG.MIN_THRESHOLD,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(jarRef, newJar);
      console.log(`Initialized savings jar for user: ${userId}`);
    }
  }

  /**
   * Auto-deposit 1% from profit events
   * This is called automatically when users earn profits
   */
  async autoDeposit(
    userId: string,
    profitAmount: number,
    source: string,
    operationId: string,
    metadata: Record<string, any> = {}
  ): Promise<DepositResult> {
    try {
      // Calculate 1% savings amount (round to cents)
      const savingsAmount = Math.floor(profitAmount * SAVINGS_JAR_CONFIG.AUTO_PERCENTAGE * 100) / 100;

      if (savingsAmount <= 0) {
        return {
          success: false,
          transactionId: '',
          amount: 0,
          newBalance: 0,
          message: 'Savings amount too small'
        };
      }

      // Ensure jar exists
      await this.initializeSavingsJar(userId);

      // Execute idempotently
      const result = await executeIdempotent(
        operationId,
        'savings_deposit',
        userId,
        savingsAmount,
        async () => {
          return await runTransaction(db, async (transaction) => {
            const jarRef = doc(db, this.savingsJarCollection, userId);
            const jarDoc = await transaction.get(jarRef);

            if (!jarDoc.exists()) {
              throw new Error('Savings jar not found');
            }

            const jarData = jarDoc.data() as SavingsJar;
            const newBalance = jarData.balance + savingsAmount;

            // Update jar balance
            transaction.update(jarRef, {
              balance: newBalance,
              totalDeposited: jarData.totalDeposited + savingsAmount,
              updatedAt: serverTimestamp(),
            });

            // Create transaction record
            const txId = `tx_${userId}_${Date.now()}`;
            const txRef = doc(db, this.transactionsCollection, txId);
            const txData: SavingsTransaction = {
              id: txId,
              userId,
              type: 'auto_deposit',
              amount: savingsAmount,
              source,
              balanceBefore: jarData.balance,
              balanceAfter: newBalance,
              operationId,
              status: 'completed',
              createdAt: serverTimestamp() as Timestamp,
              metadata,
            };
            transaction.set(txRef, txData);

            return {
              transactionId: txId,
              newBalance,
            };
          });
        },
        { source, profitAmount, ...metadata }
      );

      return {
        success: true,
        transactionId: result.transactionId,
        amount: savingsAmount,
        newBalance: result.newBalance,
        message: `Saved R${savingsAmount.toFixed(2)} from ${source}`
      };
    } catch (error: any) {
      console.error('Error in auto-deposit:', error);
      return {
        success: false,
        transactionId: '',
        amount: 0,
        newBalance: 0,
        message: error.message || 'Failed to auto-deposit'
      };
    }
  }

  /**
   * Manual deposit to savings jar
   */
  async manualDeposit(
    userId: string,
    amount: number,
    operationId: string
  ): Promise<DepositResult> {
    try {
      if (amount <= 0) {
        throw new Error('Amount must be positive');
      }

      // Ensure jar exists
      await this.initializeSavingsJar(userId);

      // Note: In a real system, you'd deduct from main wallet first
      // For now, we'll just add to savings jar

      const result = await executeIdempotent(
        operationId,
        'savings_deposit',
        userId,
        amount,
        async () => {
          return await runTransaction(db, async (transaction) => {
            const jarRef = doc(db, this.savingsJarCollection, userId);
            const jarDoc = await transaction.get(jarRef);

            if (!jarDoc.exists()) {
              throw new Error('Savings jar not found');
            }

            const jarData = jarDoc.data() as SavingsJar;
            const newBalance = jarData.balance + amount;

            // Update jar
            transaction.update(jarRef, {
              balance: newBalance,
              totalDeposited: jarData.totalDeposited + amount,
              updatedAt: serverTimestamp(),
            });

            // Create transaction
            const txId = `tx_${userId}_${Date.now()}`;
            const txRef = doc(db, this.transactionsCollection, txId);
            const txData: SavingsTransaction = {
              id: txId,
              userId,
              type: 'manual_deposit',
              amount,
              source: 'manual',
              balanceBefore: jarData.balance,
              balanceAfter: newBalance,
              operationId,
              status: 'completed',
              createdAt: serverTimestamp() as Timestamp,
            };
            transaction.set(txRef, txData);

            return {
              transactionId: txId,
              newBalance,
            };
          });
        }
      );

      return {
        success: true,
        transactionId: result.transactionId,
        amount,
        newBalance: result.newBalance,
        message: `Successfully deposited R${amount.toFixed(2)}`
      };
    } catch (error: any) {
      console.error('Error in manual deposit:', error);
      throw error;
    }
  }

  /**
   * Withdraw from savings jar
   * - Minimum withdrawal: R100 (or custom threshold)
   * - Withdrawal fee: 1%
   */
  async withdraw(
    userId: string,
    amount: number,
    operationId: string
  ): Promise<WithdrawalResult> {
    try {
      const jarRef = doc(db, this.savingsJarCollection, userId);
      const jarDoc = await getDoc(jarRef);

      if (!jarDoc.exists()) {
        throw new Error('Savings jar not found');
      }

      const jarData = jarDoc.data() as SavingsJar;

      // Validate withdrawal
      if (amount <= 0) {
        throw new Error('Withdrawal amount must be positive');
      }

      if (amount > jarData.balance) {
        throw new Error('Insufficient savings balance');
      }

      if (jarData.balance < jarData.autoThreshold) {
        throw new Error(`Minimum balance of R${jarData.autoThreshold} required for withdrawal`);
      }

      // Calculate fee
      const fee = Math.floor(amount * SAVINGS_JAR_CONFIG.WITHDRAWAL_FEE * 100) / 100;
      const netAmount = amount - fee;

      const result = await executeIdempotent(
        operationId,
        'savings_withdrawal',
        userId,
        amount,
        async () => {
          return await runTransaction(db, async (transaction) => {
            const jarRef = doc(db, this.savingsJarCollection, userId);
            const jarDoc = await transaction.get(jarRef);

            if (!jarDoc.exists()) {
              throw new Error('Savings jar not found');
            }

            const jarData = jarDoc.data() as SavingsJar;
            const newBalance = jarData.balance - amount;

            // Update jar
            transaction.update(jarRef, {
              balance: newBalance,
              totalWithdrawn: jarData.totalWithdrawn + amount,
              updatedAt: serverTimestamp(),
            });

            // Create transaction
            const txId = `tx_${userId}_${Date.now()}`;
            const txRef = doc(db, this.transactionsCollection, txId);
            const txData: SavingsTransaction = {
              id: txId,
              userId,
              type: 'withdrawal',
              amount,
              fee,
              source: 'withdrawal',
              balanceBefore: jarData.balance,
              balanceAfter: newBalance,
              operationId,
              status: 'completed',
              createdAt: serverTimestamp() as Timestamp,
              metadata: { netAmount },
            };
            transaction.set(txRef, txData);

            // Credit main wallet with net amount (after fee)
            const walletRef = doc(db, 'wallets', userId);
            const walletDoc = await transaction.get(walletRef);
            
            if (walletDoc.exists()) {
              // Update existing wallet
              transaction.update(walletRef, {
                balance: increment(netAmount),
                updatedAt: serverTimestamp(),
              });
            } else {
              // Create new wallet if it doesn't exist
              transaction.set(walletRef, {
                userId,
                balance: netAmount,
                lockedBalance: 0,
                availableBalance: netAmount,
                totalDeposited: 0,
                totalWithdrawn: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            }

            // Create wallet transaction record
            const walletTxId = `wtx_${userId}_${Date.now()}`;
            const walletTxRef = doc(db, 'transactions', walletTxId);
            transaction.set(walletTxRef, {
              userId,
              type: 'savings_withdrawal',
              amount: netAmount,
              status: 'completed',
              description: `Savings Jar withdrawal (R${amount.toFixed(2)} - R${fee.toFixed(2)} fee)`,
              timestamp: serverTimestamp(),
              balanceBefore: walletDoc.exists() ? walletDoc.data().balance : 0,
              balanceAfter: walletDoc.exists() ? walletDoc.data().balance + netAmount : netAmount,
              metadata: {
                savingsJarTransactionId: txId,
                withdrawalAmount: amount,
                fee,
                netAmount,
              },
            });

            return {
              transactionId: txId,
              newBalance,
            };
          });
        }
      );

      return {
        success: true,
        transactionId: result.transactionId,
        amount,
        fee,
        netAmount,
        newBalance: result.newBalance,
        message: `Withdrew R${netAmount.toFixed(2)} (fee: R${fee.toFixed(2)})`
      };
    } catch (error: any) {
      console.error('Error in withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get savings jar balance
   */
  async getBalance(userId: string): Promise<number> {
    try {
      const jarRef = doc(db, this.savingsJarCollection, userId);
      const jarDoc = await getDoc(jarRef);

      if (!jarDoc.exists()) {
        return 0;
      }

      const jarData = jarDoc.data() as SavingsJar;
      return jarData.balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Get savings jar details
   */
  async getSavingsJar(userId: string): Promise<SavingsJar | null> {
    try {
      const jarRef = doc(db, this.savingsJarCollection, userId);
      const jarDoc = await getDoc(jarRef);

      if (!jarDoc.exists()) {
        return null;
      }

      return jarDoc.data() as SavingsJar;
    } catch (error) {
      console.error('Error getting savings jar:', error);
      return null;
    }
  }

  /**
   * Get transaction history
   */
  async getHistory(
    userId: string,
    limitCount: number = 50
  ): Promise<SavingsTransaction[]> {
    try {
      const q = query(
        collection(db, this.transactionsCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as SavingsTransaction);
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  /**
   * Update auto-threshold
   */
  async updateThreshold(userId: string, threshold: number): Promise<void> {
    try {
      if (threshold < SAVINGS_JAR_CONFIG.MIN_THRESHOLD) {
        throw new Error(`Minimum threshold is R${SAVINGS_JAR_CONFIG.MIN_THRESHOLD}`);
      }

      const jarRef = doc(db, this.savingsJarCollection, userId);
      await setDoc(jarRef, {
        autoThreshold: threshold,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating threshold:', error);
      throw error;
    }
  }

  /**
   * Generate unique operation ID
   */
  generateOperationId(userId: string, type: string): string {
    return operationLogger.generateOperationId(type, userId);
  }
}

export const savingsJarService = new SavingsJarService();
