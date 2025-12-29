/**
 * Tests for Bulk Export Service
 */

import {
  exportLoans,
  exportInvestments,
  exportTransactions,
  exportCryptoOrders,
  getExportHistory,
  ExportRequest,
} from '../bulk-export-service';
import { db } from '@/lib/firebase-admin';

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

describe('Bulk Export Service', () => {
  const mockUserId = 'test-user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportLoans', () => {
    it('should successfully export loans as CSV', async () => {
      const mockLoans = [
        {
          id: 'loan-1',
          amount: 10000,
          duration: 30,
          interestRate: 20,
          status: 'active',
          borrowerId: mockUserId,
          createdAt: { toDate: () => new Date('2024-01-01') },
        },
        {
          id: 'loan-2',
          amount: 5000,
          duration: 60,
          interestRate: 18,
          status: 'completed',
          borrowerId: mockUserId,
          createdAt: { toDate: () => new Date('2024-01-15') },
        },
      ];

      const mockSnapshot = {
        docs: mockLoans.map(loan => ({
          id: loan.id,
          data: () => loan,
        })),
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      const request: ExportRequest = {
        userId: mockUserId,
        exportType: 'loans',
        format: 'csv',
        maxRecords: 1000,
      };

      const result = await exportLoans(request);

      expect(result).toHaveProperty('exportId');
      expect(result).toHaveProperty('recordCount', 2);
      expect(result).toHaveProperty('fileSize');
      expect(result).toHaveProperty('downloadUrl');
      expect(result).toHaveProperty('expiresAt');
      expect(result.format).toBe('csv');
      expect(result.recordCount).toBe(2);
    });

    it('should filter loans by date range', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ docs: [] }),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      const request: ExportRequest = {
        userId: mockUserId,
        exportType: 'loans',
        format: 'csv',
        filters: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
      };

      await exportLoans(request);

      expect(mockQuery.where).toHaveBeenCalledWith('borrowerId', '==', mockUserId);
      expect(mockQuery.where).toHaveBeenCalledWith('createdAt', '>=', expect.any(Object));
      expect(mockQuery.where).toHaveBeenCalledWith('createdAt', '<=', expect.any(Object));
    });

    it('should export loans as JSON', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'loan-1',
            data: () => ({
              amount: 10000,
              duration: 30,
              status: 'active',
              createdAt: { toDate: () => new Date() },
            }),
          },
        ],
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      const request: ExportRequest = {
        userId: mockUserId,
        exportType: 'loans',
        format: 'json',
      };

      const result = await exportLoans(request);

      expect(result.format).toBe('json');
      expect(result.downloadUrl).toContain('application/json');
    });

    it('should filter fields when includeFields is provided', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'loan-1',
            data: () => ({
              amount: 10000,
              duration: 30,
              status: 'active',
              borrowerId: mockUserId,
              createdAt: { toDate: () => new Date() },
            }),
          },
        ],
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      const request: ExportRequest = {
        userId: mockUserId,
        exportType: 'loans',
        format: 'json',
        includeFields: ['amount', 'duration'],
      };

      const result = await exportLoans(request);

      expect(result.recordCount).toBe(1);
    });

    it('should handle errors and log failed exports', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      const mockLogCollection = {
        doc: jest.fn().mockReturnValue({
          set: jest.fn().mockResolvedValue(undefined),
        }),
      };

      (db.collection as jest.Mock).mockImplementation((name: string) => {
        if (name === 'exportLogs') return mockLogCollection;
        return mockCollection;
      });

      const request: ExportRequest = {
        userId: mockUserId,
        exportType: 'loans',
        format: 'csv',
      };

      await expect(exportLoans(request)).rejects.toThrow('Database error');
      expect(mockLogCollection.doc).toHaveBeenCalled();
    });
  });

  describe('exportInvestments', () => {
    it('should successfully export investments', async () => {
      const mockInvestments = [
        {
          id: 'inv-1',
          amount: 1000,
          ticketId: 'ticket-1',
          investorId: mockUserId,
          status: 'active',
          createdAt: { toDate: () => new Date() },
        },
      ];

      const mockSnapshot = {
        docs: mockInvestments.map(inv => ({
          id: inv.id,
          data: () => inv,
        })),
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      const request: ExportRequest = {
        userId: mockUserId,
        exportType: 'investments',
        format: 'csv',
      };

      const result = await exportInvestments(request);

      expect(result.recordCount).toBe(1);
      expect(result.format).toBe('csv');
    });
  });

  describe('exportTransactions', () => {
    it('should successfully export transactions', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          amount: 500,
          type: 'deposit',
          userId: mockUserId,
          status: 'completed',
          createdAt: { toDate: () => new Date() },
        },
      ];

      const mockSnapshot = {
        docs: mockTransactions.map(tx => ({
          id: tx.id,
          data: () => tx,
        })),
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      const request: ExportRequest = {
        userId: mockUserId,
        exportType: 'transactions',
        format: 'json',
      };

      const result = await exportTransactions(request);

      expect(result.recordCount).toBe(1);
      expect(mockQuery.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });
  });

  describe('exportCryptoOrders', () => {
    it('should successfully export crypto orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          asset: 'BTC',
          type: 'BUY',
          amount: 0.1,
          price: 50000,
          userId: mockUserId,
          status: 'completed',
          createdAt: { toDate: () => new Date() },
        },
      ];

      const mockSnapshot = {
        docs: mockOrders.map(order => ({
          id: order.id,
          data: () => order,
        })),
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      const request: ExportRequest = {
        userId: mockUserId,
        exportType: 'crypto_orders',
        format: 'excel',
      };

      const result = await exportCryptoOrders(request);

      expect(result.recordCount).toBe(1);
      expect(result.format).toBe('excel');
    });
  });

  describe('getExportHistory', () => {
    it('should retrieve export history for a user', async () => {
      const mockHistory = [
        {
          exportId: 'export-1',
          userId: mockUserId,
          exportType: 'loans',
          format: 'csv',
          recordCount: 10,
          fileSize: 1024,
          status: 'completed',
          createdAt: {},
        },
      ];

      const mockSnapshot = {
        docs: mockHistory.map(item => ({
          data: () => item,
        })),
      };

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      const history = await getExportHistory(mockUserId, 50);

      expect(history).toHaveLength(1);
      expect(history[0].exportId).toBe('export-1');
      expect(mockQuery.where).toHaveBeenCalledWith('userId', '==', mockUserId);
      expect(mockQuery.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockQuery.limit).toHaveBeenCalledWith(50);
    });

    it('should use default limit if not provided', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ docs: [] }),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      await getExportHistory(mockUserId);

      expect(mockQuery.limit).toHaveBeenCalledWith(50);
    });
  });
});
