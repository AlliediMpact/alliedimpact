/**
 * Tests for /api/create-checkout route
 */

import { NextRequest } from 'next/server';
import { POST } from '../../src/app/api/create-checkout/route';

// Mock billing service
jest.mock('@allied-impact/billing', () => ({
  BillingService: jest.fn(),
  getBillingService: jest.fn(),
}));

const { getBillingService } = require('@allied-impact/billing');

describe('POST /api/create-checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('valid requests', () => {
    it('should create checkout for premium plan', async () => {
      const mockBillingService = {
        createPayment: jest.fn().mockResolvedValue({
          paymentUrl: 'https://payment.example.com/checkout123',
          paymentId: 'payment123',
        }),
      };

      getBillingService.mockReturnValue(mockBillingService);

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        checkoutUrl: 'https://payment.example.com/checkout123',
        paymentId: 'payment123',
      });

      expect(mockBillingService.createPayment).toHaveBeenCalledWith({
        userId: 'user123',
        amount: 299,
        currency: 'ZAR',
        productId: 'edutech',
        description: 'EduTech Premium Plan - Monthly',
        metadata: {
          plan: 'premium',
          productId: 'edutech',
          subscriptionType: 'monthly',
        },
      });
    });

    it('should handle free plan without checkout', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user456',
          plan: 'free',
          productId: 'edutech',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        checkoutUrl: null,
        message: 'Free plan does not require checkout',
      });

      expect(getBillingService).not.toHaveBeenCalled();
    });

    it('should use checkoutUrl when paymentUrl not available', async () => {
      const mockBillingService = {
        createPayment: jest.fn().mockResolvedValue({
          checkoutUrl: 'https://checkout.example.com/session456',
          paymentId: 'payment456',
        }),
      };

      getBillingService.mockReturnValue(mockBillingService);

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user789',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.checkoutUrl).toBe('https://checkout.example.com/session456');
    });

    it('should include premium plan details', async () => {
      const mockBillingService = {
        createPayment: jest.fn().mockResolvedValue({
          paymentUrl: 'https://payment.example.com/checkout789',
          paymentId: 'payment789',
        }),
      };

      getBillingService.mockReturnValue(mockBillingService);

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user999',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      await POST(request);

      const paymentCall = mockBillingService.createPayment.mock.calls[0][0];
      expect(paymentCall.amount).toBe(299);
      expect(paymentCall.currency).toBe('ZAR');
      expect(paymentCall.description).toBe('EduTech Premium Plan - Monthly');
    });
  });

  describe('validation', () => {
    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required fields: userId, plan, productId',
      });
    });

    it('should return 400 when plan is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          productId: 'edutech',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 when productId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          plan: 'premium',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 when all required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid plan type', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          plan: 'invalid-plan',
          productId: 'edutech',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid plan type',
      });
    });
  });

  describe('billing service error handling', () => {
    it('should handle billing service not configured', async () => {
      getBillingService.mockImplementation(() => {
        throw new Error('Billing service not initialized');
      });

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Billing service not yet configured');
      expect(data.checkoutUrl).toBeNull();
    });

    it('should handle createPayment failure', async () => {
      const mockBillingService = {
        createPayment: jest.fn().mockRejectedValue(new Error('Payment gateway error')),
      };

      getBillingService.mockReturnValue(mockBillingService);

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.checkoutUrl).toBeNull();
    });

    it('should return 500 for unexpected errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify('invalid json'),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create checkout session',
      });
    });
  });

  describe('plan configuration', () => {
    it('should use correct amount for premium plan', async () => {
      const mockBillingService = {
        createPayment: jest.fn().mockResolvedValue({
          paymentUrl: 'https://payment.example.com/checkout',
          paymentId: 'payment123',
        }),
      };

      getBillingService.mockReturnValue(mockBillingService);

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      await POST(request);

      const paymentData = mockBillingService.createPayment.mock.calls[0][0];
      expect(paymentData.amount).toBe(299);
    });

    it('should use ZAR currency', async () => {
      const mockBillingService = {
        createPayment: jest.fn().mockResolvedValue({
          paymentUrl: 'https://payment.example.com/checkout',
          paymentId: 'payment123',
        }),
      };

      getBillingService.mockReturnValue(mockBillingService);

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      await POST(request);

      const paymentData = mockBillingService.createPayment.mock.calls[0][0];
      expect(paymentData.currency).toBe('ZAR');
    });

    it('should include subscription metadata', async () => {
      const mockBillingService = {
        createPayment: jest.fn().mockResolvedValue({
          paymentUrl: 'https://payment.example.com/checkout',
          paymentId: 'payment123',
        }),
      };

      getBillingService.mockReturnValue(mockBillingService);

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      await POST(request);

      const paymentData = mockBillingService.createPayment.mock.calls[0][0];
      expect(paymentData.metadata).toEqual({
        plan: 'premium',
        productId: 'edutech',
        subscriptionType: 'monthly',
      });
    });
  });
});
