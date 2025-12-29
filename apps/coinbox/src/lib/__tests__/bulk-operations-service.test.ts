/**
 * Bulk Operations Service Tests
 * Tests for bulk loans, investments, crypto orders, and messaging
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bulkOperationsService } from '../bulk-operations-service';

// Mock Firebase
vi.mock('../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn((date) => ({ toDate: () => date }))
  },
  writeBatch: vi.fn(),
  runTransaction: vi.fn()
}));

// Mock services
vi.mock('../wallet-service', () => ({
  walletService: {
    getUserWallet: vi.fn()
  }
}));

vi.mock('../membership-service', () => ({
  membershipService: {
    getUserMembership: vi.fn()
  }
}));

vi.mock('../notification-service', () => ({
  notificationService: {
    createNotification: vi.fn()
  }
}));

describe('BulkOperationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBulkLoans', () => {
    it('should create multiple loan tickets successfully', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');
      const { addDoc } = await import('firebase/firestore');

      // Mock membership
      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'Basic',
        loanLimit: 5000,
        investmentLimit: 10000,
        p2pCryptoLimit: 5000
      } as any);

      // Mock wallet
      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      // Mock addDoc
      vi.mocked(addDoc).mockResolvedValue({ id: 'ticket123' } as any);

      const loans = [
        { amount: 1000, duration: 30, interestRate: 20 },
        { amount: 2000, duration: 60, interestRate: 20 }
      ];

      const result = await bulkOperationsService.createBulkLoans('user123', loans);

      expect(result.success).toBe(true);
      expect(result.totalItems).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle validation errors for individual loans', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');

      // Mock membership with lower limit
      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'Basic',
        loanLimit: 500,
        investmentLimit: 10000,
        p2pCryptoLimit: 5000
      } as any);

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      const loans = [
        { amount: 400, duration: 30, interestRate: 20 },  // Valid
        { amount: 600, duration: 60, interestRate: 20 }   // Exceeds limit
      ];

      const result = await bulkOperationsService.createBulkLoans('user123', loans);

      expect(result.totalItems).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].index).toBe(1);
      expect(result.errors[0].error).toContain('exceeds tier limit');
    });

    it('should validate interest rate bounds', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');

      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'Basic',
        loanLimit: 5000,
        investmentLimit: 10000,
        p2pCryptoLimit: 5000
      } as any);

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      const loans = [
        { amount: 1000, duration: 30, interestRate: 10 }  // Too low
      ];

      const result = await bulkOperationsService.createBulkLoans('user123', loans);

      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toContain('Interest rate must be between 15% and 25%');
    });
  });

  describe('createBulkInvestments', () => {
    it('should create multiple investments successfully', async () => {
      const { walletService } = await import('../wallet-service');
      const { runTransaction, getDoc } = await import('firebase/firestore');

      // Mock wallet
      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'investor123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      // Mock transaction
      vi.mocked(runTransaction).mockImplementation(async (db, callback) => {
        const mockTransaction = {
          get: vi.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({
              status: 'Open',
              amount: 1000,
              userId: 'borrower123'
            })
          }),
          update: vi.fn(),
          set: vi.fn()
        };
        return await callback(mockTransaction);
      });

      const investments = [
        { ticketId: 'ticket1', amount: 1000 },
        { ticketId: 'ticket2', amount: 2000 }
      ];

      const result = await bulkOperationsService.createBulkInvestments('investor123', investments);

      expect(result.success).toBe(true);
      expect(result.totalItems).toBe(2);
      expect(result.successful).toBe(2);
    });

    it('should fail when insufficient balance', async () => {
      const { walletService } = await import('../wallet-service');

      // Mock wallet with low balance
      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'investor123',
        balance: 500,
        lockedBalance: 0
      } as any);

      const investments = [
        { ticketId: 'ticket1', amount: 1000 }
      ];

      const result = await bulkOperationsService.createBulkInvestments('investor123', investments);

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain('Insufficient balance');
    });
  });

  describe('createBulkCryptoOrders', () => {
    it('should create multiple crypto orders successfully', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');
      const { addDoc } = await import('firebase/firestore');

      // Mock membership
      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'VIP',
        loanLimit: 5000,
        investmentLimit: 50000,
        p2pCryptoLimit: 50000
      } as any);

      // Mock wallet
      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 100000,
        lockedBalance: 0
      } as any);

      // Mock addDoc
      vi.mocked(addDoc).mockResolvedValue({ id: 'listing123' } as any);

      const orders = [
        { asset: 'BTC' as const, type: 'BUY' as const, amount: 0.01, price: 1250000 },
        { asset: 'ETH' as const, type: 'SELL' as const, amount: 0.5, price: 45000 }
      ];

      const result = await bulkOperationsService.createBulkCryptoOrders('user123', orders);

      expect(result.success).toBe(true);
      expect(result.totalItems).toBe(2);
      expect(result.successful).toBe(2);
    });

    it('should validate order value against tier limit', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');

      // Mock membership with lower limit
      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'Basic',
        loanLimit: 500,
        investmentLimit: 5000,
        p2pCryptoLimit: 5000
      } as any);

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 100000,
        lockedBalance: 0
      } as any);

      const orders = [
        { asset: 'BTC' as const, type: 'BUY' as const, amount: 0.01, price: 1250000 } // R12,500 exceeds limit
      ];

      const result = await bulkOperationsService.createBulkCryptoOrders('user123', orders);

      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toContain('exceeds tier limit');
    });
  });

  describe('sendBulkMessages', () => {
    it('should send messages to multiple recipients successfully', async () => {
      const { getDoc } = await import('firebase/firestore');
      const { notificationService } = await import('../notification-service');

      // Mock getDoc to return valid recipient
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ userId: 'recipient123' })
      } as any);

      const messageRequest = {
        recipients: ['user1', 'user2', 'user3'],
        subject: 'Important Update',
        message: 'This is a test message',
        priority: 'normal' as const
      };

      const result = await bulkOperationsService.sendBulkMessages('admin123', messageRequest);

      expect(result.success).toBe(true);
      expect(result.totalItems).toBe(3);
      expect(result.successful).toBe(3);
      expect(notificationService.createNotification).toHaveBeenCalledTimes(3);
    });

    it('should enforce maximum 50 recipients limit', async () => {
      const recipients = Array.from({ length: 51 }, (_, i) => `user${i}`);

      const messageRequest = {
        recipients,
        subject: 'Test',
        message: 'Test message',
        priority: 'normal' as const
      };

      const result = await bulkOperationsService.sendBulkMessages('admin123', messageRequest);

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain('Maximum 50 recipients per batch');
    });
  });

  describe('getBulkOperationStatus', () => {
    it('should retrieve batch status by batchId', async () => {
      const { getDocs } = await import('firebase/firestore');

      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{
          data: () => ({
            batchId: 'batch123',
            operationType: 'bulk_loans',
            totalItems: 5,
            successful: 4,
            failed: 1,
            processingTimeMs: 1234
          })
        }]
      } as any);

      const status = await bulkOperationsService.getBulkOperationStatus('batch123');

      expect(status).toBeDefined();
      expect(status.batchId).toBe('batch123');
      expect(status.totalItems).toBe(5);
    });

    it('should return null for non-existent batch', async () => {
      const { getDocs } = await import('firebase/firestore');

      vi.mocked(getDocs).mockResolvedValue({
        empty: true,
        docs: []
      } as any);

      const status = await bulkOperationsService.getBulkOperationStatus('nonexistent');

      expect(status).toBeNull();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty loan array', async () => {
      const result = await bulkOperationsService.createBulkLoans('user123', []);

      expect(result.totalItems).toBe(0);
      expect(result.successful).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle concurrent bulk operations', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');
      const { addDoc } = await import('firebase/firestore');

      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'Basic',
        loanLimit: 5000,
        investmentLimit: 10000,
        p2pCryptoLimit: 5000
      } as any);

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      vi.mocked(addDoc).mockResolvedValue({ id: 'ticket123' } as any);

      const loans = [
        { amount: 1000, duration: 30, interestRate: 20 },
        { amount: 1500, duration: 45, interestRate: 22 }
      ];

      // Run two bulk operations concurrently
      const [result1, result2] = await Promise.all([
        bulkOperationsService.createBulkLoans('user123', loans),
        bulkOperationsService.createBulkLoans('user123', loans)
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.batchId).not.toBe(result2.batchId);
    });

    it('should validate loan duration is positive', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');

      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'Basic',
        loanLimit: 5000,
        investmentLimit: 10000,
        p2pCryptoLimit: 5000
      } as any);

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      const loans = [
        { amount: 1000, duration: 0, interestRate: 20 },  // Invalid duration
        { amount: 1000, duration: -30, interestRate: 20 } // Negative duration
      ];

      const result = await bulkOperationsService.createBulkLoans('user123', loans);

      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
    });

    it('should validate crypto asset is supported', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');

      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'VIP',
        loanLimit: 5000,
        investmentLimit: 50000,
        p2pCryptoLimit: 50000
      } as any);

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 100000,
        lockedBalance: 0
      } as any);

      const orders = [
        { asset: 'DOGE' as any, type: 'BUY' as const, amount: 1000, price: 1 }  // Unsupported asset
      ];

      const result = await bulkOperationsService.createBulkCryptoOrders('user123', orders);

      expect(result.failed).toBeGreaterThan(0);
    });

    it('should handle partial success with rollback', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');
      const { addDoc } = await import('firebase/firestore');

      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'Basic',
        loanLimit: 5000,
        investmentLimit: 10000,
        p2pCryptoLimit: 5000
      } as any);

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      // Mock addDoc to succeed once, then fail
      vi.mocked(addDoc)
        .mockResolvedValueOnce({ id: 'ticket1' } as any)
        .mockRejectedValueOnce(new Error('Database error'));

      const loans = [
        { amount: 1000, duration: 30, interestRate: 20 },
        { amount: 2000, duration: 60, interestRate: 20 }
      ];

      const result = await bulkOperationsService.createBulkLoans('user123', loans);

      expect(result.totalItems).toBe(2);
      expect(result.failed).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should enforce maximum batch size', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');

      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'Basic',
        loanLimit: 5000,
        investmentLimit: 10000,
        p2pCryptoLimit: 5000
      } as any);

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      // Create array with 101 items (exceeds typical batch limit of 100)
      const loans = Array.from({ length: 101 }, () => ({
        amount: 100,
        duration: 30,
        interestRate: 20
      }));

      const result = await bulkOperationsService.createBulkLoans('user123', loans);

      // Should either fail entirely or process only first 100
      expect(result.totalItems).toBeLessThanOrEqual(100);
    });

    it('should track processing time metrics', async () => {
      const { membershipService } = await import('../membership-service');
      const { walletService } = await import('../wallet-service');
      const { addDoc } = await import('firebase/firestore');

      vi.mocked(membershipService.getUserMembership).mockResolvedValue({
        userId: 'user123',
        currentTier: 'Basic',
        loanLimit: 5000,
        investmentLimit: 10000,
        p2pCryptoLimit: 5000
      } as any);

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'user123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      vi.mocked(addDoc).mockResolvedValue({ id: 'ticket123' } as any);

      const loans = [
        { amount: 1000, duration: 30, interestRate: 20 }
      ];

      const result = await bulkOperationsService.createBulkLoans('user123', loans);

      expect(result.processingTimeMs).toBeDefined();
      expect(result.processingTimeMs).toBeGreaterThan(0);
    });

    it('should validate message subject and body are not empty', async () => {
      const messageRequest = {
        recipients: ['user1', 'user2'],
        subject: '',
        message: '',
        priority: 'normal' as const
      };

      const result = await bulkOperationsService.sendBulkMessages('admin123', messageRequest);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle investment in closed/fulfilled ticket', async () => {
      const { walletService } = await import('../wallet-service');
      const { runTransaction } = await import('firebase/firestore');

      vi.mocked(walletService.getUserWallet).mockResolvedValue({
        userId: 'investor123',
        balance: 10000,
        lockedBalance: 0
      } as any);

      // Mock transaction with closed ticket
      vi.mocked(runTransaction).mockImplementation(async (db, callback) => {
        const mockTransaction = {
          get: vi.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({
              status: 'Fulfilled',  // Closed ticket
              amount: 1000,
              userId: 'borrower123'
            })
          }),
          update: vi.fn(),
          set: vi.fn()
        };
        return await callback(mockTransaction);
      });

      const investments = [
        { ticketId: 'closed-ticket', amount: 1000 }
      ];

      const result = await bulkOperationsService.createBulkInvestments('investor123', investments);

      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toContain('not open' || 'closed' || 'Fulfilled');
    });
  });
});
