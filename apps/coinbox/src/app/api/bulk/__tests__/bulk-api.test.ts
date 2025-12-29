/**
 * Bulk Operations API Tests
 * Tests for bulk loans, investments, crypto orders, and messages APIs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/bulk-operations-service', () => ({
  bulkOperationsService: {
    createBulkLoans: vi.fn(),
    createBulkInvestments: vi.fn(),
    createBulkCryptoOrders: vi.fn(),
    sendBulkMessages: vi.fn(),
    getBulkOperationStatus: vi.fn()
  }
}));

vi.mock('@/lib/auth-helpers', () => ({
  verifyAuthentication: vi.fn()
}));

vi.mock('@/lib/auth-utils', () => ({
  hasAdminAccess: vi.fn()
}));

describe('Bulk Loans API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/bulk/loans/create', () => {
    it('should create bulk loans successfully', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      // Mock authentication
      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);

      // Mock service response
      vi.mocked(bulkOperationsService.createBulkLoans).mockResolvedValue({
        success: true,
        batchId: 'batch123',
        totalItems: 2,
        successful: 2,
        failed: 0,
        errors: [],
        results: [
          { index: 0, ticketId: 'ticket1', amount: 1000, status: 'success' },
          { index: 1, ticketId: 'ticket2', amount: 2000, status: 'success' }
        ],
        processingTimeMs: 500
      });

      const request = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({
          loans: [
            { amount: 1000, duration: 30, interestRate: 20 },
            { amount: 2000, duration: 60, interestRate: 20 }
          ]
        })
      });

      const { POST } = await import('@/app/api/bulk/loans/create/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalItems).toBe(2);
      expect(data.successful).toBe(2);
      expect(data.failed).toBe(0);
    });

    it('should return 401 when not authenticated', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      
      vi.mocked(verifyAuthentication).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({ loans: [] })
      });

      const { POST } = await import('@/app/api/bulk/loans/create/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should validate loans array is provided', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      
      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);

      const request = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const { POST } = await import('@/app/api/bulk/loans/create/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('loans array is required');
    });

    it('should enforce maximum 20 loans per batch', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      
      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);

      const loans = Array.from({ length: 21 }, () => ({
        amount: 1000,
        duration: 30,
        interestRate: 20
      }));

      const request = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({ loans })
      });

      const { POST } = await import('@/app/api/bulk/loans/create/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Maximum 20 loans');
    });
  });

  describe('GET /api/bulk/loans/create', () => {
    it('should retrieve batch status', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);
      
      vi.mocked(bulkOperationsService.getBulkOperationStatus).mockResolvedValue({
        batchId: 'batch123',
        operationType: 'bulk_loans',
        totalItems: 5,
        successful: 4,
        failed: 1,
        processingTimeMs: 1234
      });

      const request = new NextRequest('http://localhost/api/bulk/loans/create?batchId=batch123');

      const { GET } = await import('@/app/api/bulk/loans/create/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.batchId).toBe('batch123');
    });
  });
});

describe('Bulk Investments API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/bulk/investments/create', () => {
    it('should create bulk investments successfully', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'investor123' } as any);

      vi.mocked(bulkOperationsService.createBulkInvestments).mockResolvedValue({
        success: true,
        batchId: 'batch456',
        totalItems: 2,
        successful: 2,
        failed: 0,
        errors: [],
        results: [
          { index: 0, ticketId: 'ticket1', amount: 1000, status: 'success' },
          { index: 1, ticketId: 'ticket2', amount: 2000, status: 'success' }
        ],
        processingTimeMs: 600
      });

      const request = new NextRequest('http://localhost/api/bulk/investments/create', {
        method: 'POST',
        body: JSON.stringify({
          investments: [
            { ticketId: 'ticket1', amount: 1000 },
            { ticketId: 'ticket2', amount: 2000 }
          ]
        })
      });

      const { POST } = await import('@/app/api/bulk/investments/create/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalItems).toBe(2);
    });

    it('should validate investment structure', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      
      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'investor123' } as any);

      const request = new NextRequest('http://localhost/api/bulk/investments/create', {
        method: 'POST',
        body: JSON.stringify({
          investments: [
            { ticketId: 'ticket1' } // Missing amount
          ]
        })
      });

      const { POST } = await import('@/app/api/bulk/investments/create/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('ticketId and amount');
    });
  });
});

describe('Bulk Crypto Orders API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/bulk/crypto/orders', () => {
    it('should create bulk crypto orders successfully', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'trader123' } as any);

      vi.mocked(bulkOperationsService.createBulkCryptoOrders).mockResolvedValue({
        success: true,
        batchId: 'batch789',
        totalItems: 2,
        successful: 2,
        failed: 0,
        errors: [],
        results: [
          { index: 0, listingId: 'listing1', asset: 'BTC', type: 'BUY', amount: 0.01, status: 'success' },
          { index: 1, listingId: 'listing2', asset: 'ETH', type: 'SELL', amount: 0.5, status: 'success' }
        ],
        processingTimeMs: 450
      });

      const request = new NextRequest('http://localhost/api/bulk/crypto/orders', {
        method: 'POST',
        body: JSON.stringify({
          orders: [
            { asset: 'BTC', type: 'BUY', amount: 0.01, price: 1250000 },
            { asset: 'ETH', type: 'SELL', amount: 0.5, price: 45000 }
          ]
        })
      });

      const { POST } = await import('@/app/api/bulk/crypto/orders/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalItems).toBe(2);
    });

    it('should validate asset values', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      
      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'trader123' } as any);

      const request = new NextRequest('http://localhost/api/bulk/crypto/orders', {
        method: 'POST',
        body: JSON.stringify({
          orders: [
            { asset: 'DOGE', type: 'BUY', amount: 100, price: 5 } // Invalid asset
          ]
        })
      });

      const { POST } = await import('@/app/api/bulk/crypto/orders/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid asset');
    });

    it('should validate order type', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      
      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'trader123' } as any);

      const request = new NextRequest('http://localhost/api/bulk/crypto/orders', {
        method: 'POST',
        body: JSON.stringify({
          orders: [
            { asset: 'BTC', type: 'HOLD', amount: 0.01, price: 1250000 } // Invalid type
          ]
        })
      });

      const { POST } = await import('@/app/api/bulk/crypto/orders/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('BUY or SELL');
    });
  });
});

describe('Bulk Messages API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/bulk/messages/send', () => {
    it('should send bulk messages successfully', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { hasAdminAccess } = await import('@/lib/auth-utils');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'admin123' } as any);
      vi.mocked(hasAdminAccess).mockResolvedValue(true);

      vi.mocked(bulkOperationsService.sendBulkMessages).mockResolvedValue({
        success: true,
        batchId: 'batch_msg_123',
        totalItems: 3,
        successful: 3,
        failed: 0,
        errors: [],
        results: [
          { index: 0, recipientId: 'user1', status: 'success' },
          { index: 1, recipientId: 'user2', status: 'success' },
          { index: 2, recipientId: 'user3', status: 'success' }
        ],
        processingTimeMs: 350
      });

      const request = new NextRequest('http://localhost/api/bulk/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          recipients: ['user1', 'user2', 'user3'],
          subject: 'Important Update',
          message: 'This is a test message',
          priority: 'normal'
        })
      });

      const { POST } = await import('@/app/api/bulk/messages/send/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalItems).toBe(3);
    });

    it('should require admin/support access', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { hasAdminAccess } = await import('@/lib/auth-utils');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);
      vi.mocked(hasAdminAccess).mockResolvedValue(false);

      const request = new NextRequest('http://localhost/api/bulk/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          recipients: ['user1'],
          subject: 'Test',
          message: 'Test message'
        })
      });

      const { POST } = await import('@/app/api/bulk/messages/send/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should enforce maximum 50 recipients', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { hasAdminAccess } = await import('@/lib/auth-utils');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'admin123' } as any);
      vi.mocked(hasAdminAccess).mockResolvedValue(true);

      const recipients = Array.from({ length: 51 }, (_, i) => `user${i}`);

      const request = new NextRequest('http://localhost/api/bulk/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          recipients,
          subject: 'Test',
          message: 'Test message'
        })
      });

      const { POST } = await import('@/app/api/bulk/messages/send/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Maximum 50 recipients');
    });

    it('should validate required fields', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { hasAdminAccess } = await import('@/lib/auth-utils');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'admin123' } as any);
      vi.mocked(hasAdminAccess).mockResolvedValue(true);

      const request = new NextRequest('http://localhost/api/bulk/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          recipients: ['user1']
          // Missing subject and message
        })
      });

      const { POST } = await import('@/app/api/bulk/messages/send/route');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('subject is required');
    });
  });
});

describe('Bulk Operations Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Loan Workflow', () => {
    it('should handle loan creation, status check, and results retrieval', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);

      // Step 1: Create bulk loans
      vi.mocked(bulkOperationsService.createBulkLoans).mockResolvedValue({
        success: true,
        batchId: 'batch-workflow-1',
        totalItems: 3,
        successful: 3,
        failed: 0,
        errors: [],
        results: [
          { index: 0, ticketId: 'ticket1', status: 'success' },
          { index: 1, ticketId: 'ticket2', status: 'success' },
          { index: 2, ticketId: 'ticket3', status: 'success' },
        ],
        processingTimeMs: 800,
      });

      const { POST } = await import('@/app/api/bulk/loans/create/route');
      const createRequest = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({
          loans: [
            { amount: 1000, duration: 30, interestRate: 20 },
            { amount: 2000, duration: 45, interestRate: 21 },
            { amount: 1500, duration: 60, interestRate: 22 },
          ],
        }),
      });

      const createResponse = await POST(createRequest);
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(200);
      expect(createData.batchId).toBe('batch-workflow-1');

      // Step 2: Check status
      vi.mocked(bulkOperationsService.getBulkOperationStatus).mockResolvedValue({
        batchId: 'batch-workflow-1',
        operationType: 'bulk_loans',
        userId: 'user123',
        totalItems: 3,
        successful: 3,
        failed: 0,
        processingTimeMs: 800,
        createdAt: new Date().toISOString(),
      });

      const { GET } = await import('@/app/api/bulk/loans/create/route');
      const statusRequest = new NextRequest(
        'http://localhost/api/bulk/loans/create?batchId=batch-workflow-1'
      );

      const statusResponse = await GET(statusRequest);
      const statusData = await statusResponse.json();

      expect(statusResponse.status).toBe(200);
      expect(statusData.data.successful).toBe(3);
      expect(statusData.data.failed).toBe(0);
    });
  });

  describe('Mixed Success/Failure Workflow', () => {
    it('should handle partial failures and provide detailed error information', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);

      vi.mocked(bulkOperationsService.createBulkLoans).mockResolvedValue({
        success: false,
        batchId: 'batch-mixed-1',
        totalItems: 4,
        successful: 2,
        failed: 2,
        errors: [
          { index: 1, error: 'Amount exceeds tier limit of R500' },
          { index: 3, error: 'Interest rate must be between 15% and 25%' },
        ],
        results: [
          { index: 0, ticketId: 'ticket1', status: 'success' },
          { index: 1, status: 'error', error: 'Amount exceeds tier limit' },
          { index: 2, ticketId: 'ticket3', status: 'success' },
          { index: 3, status: 'error', error: 'Invalid interest rate' },
        ],
        processingTimeMs: 650,
      });

      const { POST } = await import('@/app/api/bulk/loans/create/route');
      const request = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({
          loans: [
            { amount: 400, duration: 30, interestRate: 20 },
            { amount: 600, duration: 30, interestRate: 20 }, // Too high
            { amount: 300, duration: 45, interestRate: 21 },
            { amount: 500, duration: 60, interestRate: 10 }, // Rate too low
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.successful).toBe(2);
      expect(data.failed).toBe(2);
      expect(data.errors).toHaveLength(2);
      expect(data.errors[0].index).toBe(1);
      expect(data.results).toHaveLength(4);
    });
  });

  describe('Concurrent Batch Operations', () => {
    it('should handle multiple concurrent batch requests from same user', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);

      vi.mocked(bulkOperationsService.createBulkLoans)
        .mockResolvedValueOnce({
          success: true,
          batchId: 'batch-concurrent-1',
          totalItems: 2,
          successful: 2,
          failed: 0,
          errors: [],
          results: [],
          processingTimeMs: 500,
        })
        .mockResolvedValueOnce({
          success: true,
          batchId: 'batch-concurrent-2',
          totalItems: 2,
          successful: 2,
          failed: 0,
          errors: [],
          results: [],
          processingTimeMs: 520,
        });

      const { POST } = await import('@/app/api/bulk/loans/create/route');
      
      const request1 = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({
          loans: [
            { amount: 1000, duration: 30, interestRate: 20 },
            { amount: 1500, duration: 45, interestRate: 21 },
          ],
        }),
      });

      const request2 = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({
          loans: [
            { amount: 2000, duration: 60, interestRate: 22 },
            { amount: 2500, duration: 30, interestRate: 20 },
          ],
        }),
      });

      // Execute concurrently
      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2),
      ]);

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(data1.batchId).not.toBe(data2.batchId);
      expect(data1.success).toBe(true);
      expect(data2.success).toBe(true);
    });
  });

  describe('Investment + Loan Workflow', () => {
    it('should handle cross-operation workflow (create loans, then invest)', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);

      // Create loans
      vi.mocked(bulkOperationsService.createBulkLoans).mockResolvedValue({
        success: true,
        batchId: 'batch-loans',
        totalItems: 2,
        successful: 2,
        failed: 0,
        errors: [],
        results: [
          { index: 0, ticketId: 'ticket-new-1', status: 'success' },
          { index: 1, ticketId: 'ticket-new-2', status: 'success' },
        ],
        processingTimeMs: 600,
      });

      const { POST: createLoans } = await import('@/app/api/bulk/loans/create/route');
      const loansRequest = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({
          loans: [
            { amount: 3000, duration: 30, interestRate: 20 },
            { amount: 4000, duration: 45, interestRate: 21 },
          ],
        }),
      });

      const loansResponse = await createLoans(loansRequest);
      const loansData = await loansResponse.json();

      expect(loansData.success).toBe(true);
      const ticketIds = loansData.results.map((r: any) => r.ticketId);

      // Now create investments for those tickets
      vi.mocked(bulkOperationsService.createBulkInvestments).mockResolvedValue({
        success: true,
        batchId: 'batch-investments',
        totalItems: 2,
        successful: 2,
        failed: 0,
        errors: [],
        results: [
          { index: 0, investmentId: 'inv1', ticketId: ticketIds[0], status: 'success' },
          { index: 1, investmentId: 'inv2', ticketId: ticketIds[1], status: 'success' },
        ],
        processingTimeMs: 550,
      });

      const { POST: createInvestments } = await import('@/app/api/bulk/investments/create/route');
      const investmentsRequest = new NextRequest('http://localhost/api/bulk/investments/create', {
        method: 'POST',
        body: JSON.stringify({
          investments: [
            { ticketId: ticketIds[0], amount: 1000 },
            { ticketId: ticketIds[1], amount: 1500 },
          ],
        }),
      });

      const investmentsResponse = await createInvestments(investmentsRequest);
      const investmentsData = await investmentsResponse.json();

      expect(investmentsData.success).toBe(true);
      expect(investmentsData.successful).toBe(2);
    });
  });

  describe('Error Recovery and Retry', () => {
    it('should handle retry after validation errors', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);

      // First attempt with errors
      vi.mocked(bulkOperationsService.createBulkLoans).mockResolvedValueOnce({
        success: false,
        batchId: 'batch-retry-1',
        totalItems: 2,
        successful: 0,
        failed: 2,
        errors: [
          { index: 0, error: 'Amount exceeds tier limit' },
          { index: 1, error: 'Interest rate must be between 15% and 25%' },
        ],
        results: [],
        processingTimeMs: 300,
      });

      const { POST } = await import('@/app/api/bulk/loans/create/route');
      const firstRequest = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({
          loans: [
            { amount: 10000, duration: 30, interestRate: 20 }, // Too high
            { amount: 1000, duration: 45, interestRate: 30 }, // Rate too high
          ],
        }),
      });

      const firstResponse = await POST(firstRequest);
      const firstData = await firstResponse.json();

      expect(firstData.success).toBe(false);
      expect(firstData.failed).toBe(2);

      // Retry with corrected values
      vi.mocked(bulkOperationsService.createBulkLoans).mockResolvedValueOnce({
        success: true,
        batchId: 'batch-retry-2',
        totalItems: 2,
        successful: 2,
        failed: 0,
        errors: [],
        results: [
          { index: 0, ticketId: 'ticket-corrected-1', status: 'success' },
          { index: 1, ticketId: 'ticket-corrected-2', status: 'success' },
        ],
        processingTimeMs: 550,
      });

      const retryRequest = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({
          loans: [
            { amount: 500, duration: 30, interestRate: 20 }, // Corrected
            { amount: 1000, duration: 45, interestRate: 21 }, // Corrected
          ],
        }),
      });

      const retryResponse = await POST(retryRequest);
      const retryData = await retryResponse.json();

      expect(retryResponse.status).toBe(200);
      expect(retryData.success).toBe(true);
      expect(retryData.successful).toBe(2);
    });
  });

  describe('Performance and Metrics', () => {
    it('should track processing time for all operations', async () => {
      const { verifyAuthentication } = await import('@/lib/auth-helpers');
      const { bulkOperationsService } = await import('@/lib/bulk-operations-service');

      vi.mocked(verifyAuthentication).mockResolvedValue({ uid: 'user123' } as any);

      vi.mocked(bulkOperationsService.createBulkLoans).mockResolvedValue({
        success: true,
        batchId: 'batch-perf',
        totalItems: 5,
        successful: 5,
        failed: 0,
        errors: [],
        results: [],
        processingTimeMs: 1250,
      });

      const { POST } = await import('@/app/api/bulk/loans/create/route');
      const request = new NextRequest('http://localhost/api/bulk/loans/create', {
        method: 'POST',
        body: JSON.stringify({
          loans: Array.from({ length: 5 }, () => ({
            amount: 1000,
            duration: 30,
            interestRate: 20,
          })),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.processingTimeMs).toBeDefined();
      expect(data.processingTimeMs).toBeGreaterThan(0);
      expect(data.processingTimeMs).toBeLessThan(5000); // Should be under 5 seconds
    });
  });
});
