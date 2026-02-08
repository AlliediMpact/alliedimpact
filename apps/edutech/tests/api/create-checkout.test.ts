/**
 * Tests for /api/create-checkout endpoint
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/create-checkout/route';

// Mock the billing package
const mockCreatePayment = jest.fn();
const mockGetBillingService = jest.fn(() => ({
  createPayment: mockCreatePayment,
}));

jest.mock('@allied-impact/billing', () => ({
  BillingService: jest.fn(),
  getBillingService: () => mockGetBillingService(),
}));

describe('POST /api/create-checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('premium plan checkout', () => {
    it('should create checkout for premium plan with correct amount', async () => {
      mockCreatePayment.mockResolvedValue({
        paymentUrl: 'https://payment.example.com/checkout/123',
        paymentId: 'payment123',
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
      expect(data).toEqual({
        success: true,
        checkoutUrl: 'https://payment.example.com/checkout/123',
        paymentId: 'payment123',
      });
      expect(mockCreatePayment).toHaveBeenCalledWith({
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

    it('should use R299 amount in ZAR currency', async () => {
      mockCreatePayment.mockResolvedValue({
        paymentUrl: 'https://payment.example.com/checkout/456',
        paymentId: 'payment456',
      });

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user456',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      await POST(request);

      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 299,
          currency: 'ZAR',
        })
      );
    });

    it('should include metadata for premium plan', async () => {
      mockCreatePayment.mockResolvedValue({
        paymentUrl: 'https://payment.example.com/checkout/789',
        paymentId: 'payment789',
      });

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user789',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      await POST(request);

      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            plan: 'premium',
            productId: 'edutech',
            subscriptionType: 'monthly',
          },
        })
      );
    });

    it('should return checkoutUrl from payment service', async () => {
      mockCreatePayment.mockResolvedValue({
        checkoutUrl: 'https://checkout.example.com/session/999',
        paymentId: 'payment999',
      });

      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user999',
          plan: 'premium',
          productId: 'edutech',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.checkoutUrl).toBe('https://checkout.example.com/session/999');
    });
  });

  describe('free plan handling', () => {
    it('should return null checkoutUrl for free plan', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
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
      expect(mockCreatePayment).not.toHaveBeenCalled();
    });

    it('should not call billing service for free plan', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user456',
          plan: 'free',
          productId: 'edutech',
        }),
      });

      await POST(request);

      expect(mockGetBillingService).not.toHaveBeenCalled();
      expect(mockCreatePayment).not.toHaveBeenCalled();
    });
  });

  describe('billing service errors', () => {
    it('should handle billing service not configured error', async () => {
      mockGetBillingService.mockImplementation(() => {
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

      expect(data.success).toBe(false);
      expect(data.error).toContain('Billing service not yet configured');
      expect(data.checkoutUrl).toBeNull();
    });

    it('should handle payment creation failure', async () => {
      mockCreatePayment.mockRejectedValue(new Error('Payment gateway error'));

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

      expect(data.success).toBe(false);
      expect(data.error).toContain('Billing service not yet configured');
    });
  });

  describe('validation errors', () => {
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
      expect(data.error).toBe('Missing required fields: userId, plan, productId');
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
      expect(data.error).toBe('Missing required fields: userId, plan, productId');
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
      expect(data.error).toBe('Missing required fields: userId, plan, productId');
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
      expect(data.error).toBe('Invalid plan type');
    });
  });

  describe('error handling', () => {
    it('should return 500 on unexpected errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/create-checkout', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
    });
  });
});
