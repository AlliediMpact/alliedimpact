/**
 * Bulk Operations Service
 * Handles batch processing for loans, investments, crypto orders, and messages
 * 
 * Phase 7 Feature Implementation
 * @module bulk-operations-service
 */

import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { walletService } from './wallet-service';
import { membershipService } from './membership-service';
import { notificationService } from './notification-service';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface BulkOperationResult {
  success: boolean;
  batchId: string;
  totalItems: number;
  successful: number;
  failed: number;
  errors: BulkOperationError[];
  results: any[];
  processingTimeMs: number;
}

export interface BulkOperationError {
  index: number;
  item: any;
  error: string;
  code: string;
}

export interface BulkLoanRequest {
  amount: number;
  duration: number; // days
  interestRate: number;
  purpose?: string;
}

export interface BulkInvestmentRequest {
  ticketId: string;
  amount: number;
}

export interface BulkCryptoOrder {
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC';
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
}

export interface BulkMessageRequest {
  recipients: string[]; // userIds
  subject: string;
  message: string;
  template?: string;
  priority?: 'normal' | 'high' | 'urgent';
}

// ============================================
// BULK OPERATIONS SERVICE
// ============================================

class BulkOperationsService {
  
  /**
   * Create multiple loan tickets in a single batch
   * 
   * @param userId - User creating the loans
   * @param loans - Array of loan requests
   * @returns Bulk operation result
   */
  async createBulkLoans(
    userId: string,
    loans: BulkLoanRequest[]
  ): Promise<BulkOperationResult> {
    const startTime = Date.now();
    const batchId = `bulk_loans_${Date.now()}_${userId.substring(0, 8)}`;
    
    const result: BulkOperationResult = {
      success: false,
      batchId,
      totalItems: loans.length,
      successful: 0,
      failed: 0,
      errors: [],
      results: [],
      processingTimeMs: 0
    };

    try {
      // Validate user membership
      const membership = await membershipService.getUserMembership(userId);
      if (!membership) {
        throw new Error('User membership not found');
      }

      // Get user's wallet balance
      const wallet = await walletService.getUserWallet(userId);
      if (!wallet) {
        throw new Error('User wallet not found');
      }

      // Validate each loan
      for (let i = 0; i < loans.length; i++) {
        const loan = loans[i];
        
        try {
          // Validate loan amount against tier limit
          if (loan.amount > membership.loanLimit) {
            throw new Error(`Loan amount R${loan.amount} exceeds tier limit R${membership.loanLimit}`);
          }

          // Validate interest rate
          if (loan.interestRate < 15 || loan.interestRate > 25) {
            throw new Error('Interest rate must be between 15% and 25%');
          }

          // Validate duration
          if (loan.duration < 7 || loan.duration > 365) {
            throw new Error('Duration must be between 7 and 365 days');
          }

          // Create loan ticket
          const ticketRef = await addDoc(collection(db, 'tickets'), {
            userId,
            type: 'Borrow',
            amount: loan.amount,
            duration: loan.duration,
            interestRate: loan.interestRate,
            purpose: loan.purpose || 'Personal loan',
            status: 'Open',
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
            batchId,
            matchedWith: null
          });

          result.successful++;
          result.results.push({
            index: i,
            ticketId: ticketRef.id,
            amount: loan.amount,
            status: 'success'
          });

        } catch (error: any) {
          result.failed++;
          result.errors.push({
            index: i,
            item: loan,
            error: error.message,
            code: 'LOAN_CREATION_FAILED'
          });
        }
      }

      // Send notification
      if (result.successful > 0) {
        await notificationService.createNotification({
          userId,
          type: 'info',
          title: 'Bulk Loans Created',
          message: `Successfully created ${result.successful} out of ${loans.length} loan requests`,
          priority: 'normal'
        });
      }

      result.success = result.failed === 0;
      result.processingTimeMs = Date.now() - startTime;

      // Log bulk operation
      await this.logBulkOperation({
        userId,
        operationType: 'bulk_loans',
        batchId,
        totalItems: result.totalItems,
        successful: result.successful,
        failed: result.failed,
        processingTimeMs: result.processingTimeMs
      });

      return result;

    } catch (error: any) {
      console.error('Bulk loan creation error:', error);
      result.success = false;
      result.processingTimeMs = Date.now() - startTime;
      result.errors.push({
        index: -1,
        item: null,
        error: error.message,
        code: 'BULK_OPERATION_FAILED'
      });
      return result;
    }
  }

  /**
   * Create multiple investments in a single batch
   * 
   * @param userId - User making investments
   * @param investments - Array of investment requests
   * @returns Bulk operation result
   */
  async createBulkInvestments(
    userId: string,
    investments: BulkInvestmentRequest[]
  ): Promise<BulkOperationResult> {
    const startTime = Date.now();
    const batchId = `bulk_investments_${Date.now()}_${userId.substring(0, 8)}`;
    
    const result: BulkOperationResult = {
      success: false,
      batchId,
      totalItems: investments.length,
      successful: 0,
      failed: 0,
      errors: [],
      results: [],
      processingTimeMs: 0
    };

    try {
      // Get user wallet
      const wallet = await walletService.getUserWallet(userId);
      if (!wallet) {
        throw new Error('User wallet not found');
      }

      // Calculate total investment amount
      const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
      
      // Check if user has sufficient balance
      if (wallet.balance < totalAmount) {
        throw new Error(`Insufficient balance. Required: R${totalAmount}, Available: R${wallet.balance}`);
      }

      // Process each investment using transaction
      await runTransaction(db, async (transaction) => {
        for (let i = 0; i < investments.length; i++) {
          const investment = investments[i];
          
          try {
            // Get ticket
            const ticketRef = doc(db, 'tickets', investment.ticketId);
            const ticketSnap = await transaction.get(ticketRef);
            
            if (!ticketSnap.exists()) {
              throw new Error(`Ticket ${investment.ticketId} not found`);
            }

            const ticket = ticketSnap.data();
            
            // Validate ticket status
            if (ticket.status !== 'Open') {
              throw new Error(`Ticket is not open for investment (Status: ${ticket.status})`);
            }

            // Validate investment amount
            if (investment.amount !== ticket.amount) {
              throw new Error(`Investment amount must match ticket amount: R${ticket.amount}`);
            }

            // Deduct from investor's wallet
            const investorWalletRef = doc(db, 'wallets', userId);
            transaction.update(investorWalletRef, {
              balance: wallet.balance - investment.amount,
              lockedBalance: (wallet.lockedBalance || 0) + investment.amount,
              updatedAt: Timestamp.now()
            });

            // Update ticket status
            transaction.update(ticketRef, {
              status: 'Matched',
              matchedWith: userId,
              matchedAt: Timestamp.now(),
              batchId
            });

            // Create transaction record
            const transactionRef = doc(collection(db, 'transactions'));
            transaction.set(transactionRef, {
              userId,
              ticketId: investment.ticketId,
              type: 'Investment',
              amount: investment.amount,
              status: 'Completed',
              createdAt: Timestamp.now(),
              batchId
            });

            result.successful++;
            result.results.push({
              index: i,
              ticketId: investment.ticketId,
              amount: investment.amount,
              status: 'success'
            });

          } catch (error: any) {
            result.failed++;
            result.errors.push({
              index: i,
              item: investment,
              error: error.message,
              code: 'INVESTMENT_FAILED'
            });
          }
        }
      });

      // Send notification
      if (result.successful > 0) {
        await notificationService.createNotification({
          userId,
          type: 'success',
          title: 'Bulk Investments Completed',
          message: `Successfully invested in ${result.successful} out of ${investments.length} loans`,
          priority: 'normal'
        });
      }

      result.success = result.failed === 0;
      result.processingTimeMs = Date.now() - startTime;

      // Log bulk operation
      await this.logBulkOperation({
        userId,
        operationType: 'bulk_investments',
        batchId,
        totalItems: result.totalItems,
        successful: result.successful,
        failed: result.failed,
        processingTimeMs: result.processingTimeMs
      });

      return result;

    } catch (error: any) {
      console.error('Bulk investment error:', error);
      result.success = false;
      result.processingTimeMs = Date.now() - startTime;
      result.errors.push({
        index: -1,
        item: null,
        error: error.message,
        code: 'BULK_OPERATION_FAILED'
      });
      return result;
    }
  }

  /**
   * Create multiple crypto orders in a single batch
   * 
   * @param userId - User placing orders
   * @param orders - Array of crypto orders
   * @returns Bulk operation result
   */
  async createBulkCryptoOrders(
    userId: string,
    orders: BulkCryptoOrder[]
  ): Promise<BulkOperationResult> {
    const startTime = Date.now();
    const batchId = `bulk_crypto_${Date.now()}_${userId.substring(0, 8)}`;
    
    const result: BulkOperationResult = {
      success: false,
      batchId,
      totalItems: orders.length,
      successful: 0,
      failed: 0,
      errors: [],
      results: [],
      processingTimeMs: 0
    };

    try {
      // Get user membership
      const membership = await membershipService.getUserMembership(userId);
      if (!membership) {
        throw new Error('User membership not found');
      }

      // Get wallet
      const wallet = await walletService.getUserWallet(userId);
      if (!wallet) {
        throw new Error('User wallet not found');
      }

      // Process each order
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        
        try {
          const totalValue = order.amount * order.price;
          
          // Validate against tier limit
          if (totalValue > membership.p2pCryptoLimit) {
            throw new Error(`Order value R${totalValue} exceeds tier limit R${membership.p2pCryptoLimit}`);
          }

          // For BUY orders, check wallet balance
          if (order.type === 'BUY' && wallet.balance < totalValue) {
            throw new Error(`Insufficient balance for BUY order. Required: R${totalValue}`);
          }

          // Create P2P crypto listing
          const listingRef = await addDoc(collection(db, 'p2pCryptoListings'), {
            userId,
            asset: order.asset,
            type: order.type,
            amount: order.amount,
            price: order.price,
            totalValue,
            status: 'Active',
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
            batchId
          });

          result.successful++;
          result.results.push({
            index: i,
            listingId: listingRef.id,
            asset: order.asset,
            type: order.type,
            amount: order.amount,
            status: 'success'
          });

        } catch (error: any) {
          result.failed++;
          result.errors.push({
            index: i,
            item: order,
            error: error.message,
            code: 'ORDER_CREATION_FAILED'
          });
        }
      }

      // Send notification
      if (result.successful > 0) {
        await notificationService.createNotification({
          userId,
          type: 'success',
          title: 'Bulk Crypto Orders Placed',
          message: `Successfully created ${result.successful} out of ${orders.length} crypto orders`,
          priority: 'normal'
        });
      }

      result.success = result.failed === 0;
      result.processingTimeMs = Date.now() - startTime;

      // Log bulk operation
      await this.logBulkOperation({
        userId,
        operationType: 'bulk_crypto_orders',
        batchId,
        totalItems: result.totalItems,
        successful: result.successful,
        failed: result.failed,
        processingTimeMs: result.processingTimeMs
      });

      return result;

    } catch (error: any) {
      console.error('Bulk crypto orders error:', error);
      result.success = false;
      result.processingTimeMs = Date.now() - startTime;
      result.errors.push({
        index: -1,
        item: null,
        error: error.message,
        code: 'BULK_OPERATION_FAILED'
      });
      return result;
    }
  }

  /**
   * Send bulk messages to multiple recipients
   * 
   * @param senderId - User sending messages
   * @param messageRequest - Bulk message request
   * @returns Bulk operation result
   */
  async sendBulkMessages(
    senderId: string,
    messageRequest: BulkMessageRequest
  ): Promise<BulkOperationResult> {
    const startTime = Date.now();
    const batchId = `bulk_messages_${Date.now()}_${senderId.substring(0, 8)}`;
    
    const result: BulkOperationResult = {
      success: false,
      batchId,
      totalItems: messageRequest.recipients.length,
      successful: 0,
      failed: 0,
      errors: [],
      results: [],
      processingTimeMs: 0
    };

    try {
      // Rate limiting: Max 50 messages per batch
      if (messageRequest.recipients.length > 50) {
        throw new Error('Maximum 50 recipients per batch');
      }

      // Process each recipient
      for (let i = 0; i < messageRequest.recipients.length; i++) {
        const recipientId = messageRequest.recipients[i];
        
        try {
          // Check if recipient exists
          const recipientRef = doc(db, 'users', recipientId);
          const recipientSnap = await getDoc(recipientRef);
          
          if (!recipientSnap.exists()) {
            throw new Error('Recipient not found');
          }

          // Send notification
          await notificationService.createNotification({
            userId: recipientId,
            type: 'message',
            title: messageRequest.subject,
            message: messageRequest.message,
            priority: messageRequest.priority || 'normal',
            data: {
              senderId,
              batchId
            }
          });

          result.successful++;
          result.results.push({
            index: i,
            recipientId,
            status: 'success'
          });

        } catch (error: any) {
          result.failed++;
          result.errors.push({
            index: i,
            item: { recipientId },
            error: error.message,
            code: 'MESSAGE_SEND_FAILED'
          });
        }
      }

      result.success = result.failed === 0;
      result.processingTimeMs = Date.now() - startTime;

      // Log bulk operation
      await this.logBulkOperation({
        userId: senderId,
        operationType: 'bulk_messages',
        batchId,
        totalItems: result.totalItems,
        successful: result.successful,
        failed: result.failed,
        processingTimeMs: result.processingTimeMs
      });

      return result;

    } catch (error: any) {
      console.error('Bulk messages error:', error);
      result.success = false;
      result.processingTimeMs = Date.now() - startTime;
      result.errors.push({
        index: -1,
        item: null,
        error: error.message,
        code: 'BULK_OPERATION_FAILED'
      });
      return result;
    }
  }

  /**
   * Get bulk operation status
   * 
   * @param batchId - Batch ID to query
   * @returns Bulk operation result
   */
  async getBulkOperationStatus(batchId: string): Promise<any> {
    try {
      const logRef = collection(db, 'bulkOperationsLog');
      const q = query(logRef, where('batchId', '==', batchId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      return snapshot.docs[0].data();
    } catch (error) {
      console.error('Get bulk operation status error:', error);
      return null;
    }
  }

  /**
   * Log bulk operation for audit trail
   * 
   * @param logData - Operation log data
   */
  private async logBulkOperation(logData: any): Promise<void> {
    try {
      await addDoc(collection(db, 'bulkOperationsLog'), {
        ...logData,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error logging bulk operation:', error);
    }
  }
}

export const bulkOperationsService = new BulkOperationsService();
