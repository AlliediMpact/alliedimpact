/**
 * Tests for /api/webhooks/payfast endpoint
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/webhooks/payfast/route';

// Mock payment service
const mockProcessITN = jest.fn();
const mockGetPayFastService = jest.fn(() => ({
  processITN: mockProcessITN,
}));

jest.mock('@/services/paymentService', () => ({
  getPayFastService: () => mockGetPayFastService(),
}));

// Mock email service
const mockSendPaymentSuccess = jest.fn();
const mockSendPaymentFailed = jest.fn();
const mockGetEmailService = jest.fn(() => ({
  sendPaymentSuccess: mockSendPaymentSuccess,
  sendPaymentFailed: mockSendPaymentFailed,
}));

jest.mock('@/services/emailService', () => ({
  getEmailService: () => mockGetEmailService(),
}));

// Mock Firestore
const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDoc = jest.fn(() => 'mock-doc-ref');

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
}));

describe('POST /api/webhooks/payfast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'https://edutech.example.com';
  });

  describe('successful payment processing', () => {
    it('should process COMPLETE payment status successfully', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user123',
        amount: 299,
        paymentId: 'payment123',
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user@example.com',
          displayName: 'John Doe',
        }),
      });

      mockUpdateDoc.mockResolvedValue(undefined);
      mockSendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user123');
      formData.append('amount_gross', '299.00');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(mockUpdateDoc).toHaveBeenCalled();
      expect(mockSendPaymentSuccess).toHaveBeenCalled();
    });

    it('should update subscription status to PREMIUM', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user456',
        amount: 299,
        paymentId: 'payment456',
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'premium@example.com',
          displayName: 'Jane Smith',
        }),
      });

      mockUpdateDoc.mockResolvedValue(undefined);
      mockSendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user456');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          'products.edutech.tier': 'PREMIUM',
          'products.edutech.active': true,
          'products.edutech.trialEndsAt': null,
        })
      );
    });

    it('should send success email notification', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user789',
        amount: 299,
        paymentId: 'payment789',
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'success@example.com',
          displayName: 'Success User',
        }),
      });

      mockUpdateDoc.mockResolvedValue(undefined);
      mockSendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user789');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockSendPaymentSuccess).toHaveBeenCalledWith(
        { email: 'success@example.com', name: 'Success User' },
        299,
        'https://edutech.example.com/account/billing'
      );
    });
  });

  describe('failed payment processing', () => {
    it('should handle FAILED payment status', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'FAILED',
        userId: 'user111',
        amount: 299,
        paymentId: 'payment111',
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'failed@example.com',
          displayName: 'Failed User',
        }),
      });

      mockSendPaymentFailed.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'FAILED');
      formData.append('custom_str1', 'user111');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSendPaymentFailed).toHaveBeenCalledWith(
        { email: 'failed@example.com', name: 'Failed User' },
        299,
        'FAILED'
      );
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should handle CANCELLED payment status', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'CANCELLED',
        userId: 'user222',
        amount: 299,
        paymentId: 'payment222',
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'cancelled@example.com',
          displayName: 'Cancelled User',
        }),
      });

      mockSendPaymentFailed.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'CANCELLED');
      formData.append('custom_str1', 'user222');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockSendPaymentFailed).toHaveBeenCalledWith(
        expect.any(Object),
        299,
        'CANCELLED'
      );
    });

    it('should send failure email for failed payment', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'FAILED',
        userId: 'user333',
        amount: 299,
        paymentId: 'payment333',
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'failure@example.com',
          displayName: 'Failure User',
        }),
      });

      mockSendPaymentFailed.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'FAILED');
      formData.append('custom_str1', 'user333');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockSendPaymentFailed).toHaveBeenCalledWith(
        { email: 'failure@example.com', name: 'Failure User' },
        299,
        'FAILED'
      );
    });
  });

  describe('validation errors', () => {
    it('should return 400 for invalid signature', async () => {
      mockProcessITN.mockResolvedValue({
        valid: false,
      });

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user123');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid signature');
    });

    it('should return 400 when userId is missing', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: null,
        amount: 299,
        paymentId: 'payment999',
      });

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing userId');
    });
  });

  describe('subscription updates', () => {
    it('should clear trial when payment is successful', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user444',
        amount: 299,
        paymentId: 'payment444',
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'trial@example.com',
          displayName: 'Trial User',
        }),
      });

      mockUpdateDoc.mockResolvedValue(undefined);
      mockSendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user444');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          'products.edutech.trialEndsAt': null,
        })
      );
    });

    it('should store payment details in subscription', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user555',
        amount: 299,
        paymentId: 'payment555',
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'payment@example.com',
          displayName: 'Payment User',
        }),
      });

      mockUpdateDoc.mockResolvedValue(undefined);
      mockSendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user555');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({
          'products.edutech.lastPaymentAmount': 299,
          'products.edutech.lastPaymentId': 'payment555',
        })
      );
    });
  });

  describe('email notifications', () => {
    it('should include billing URL in success email', async () => {
      mockProcessITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user666',
        amount: 299,
        paymentId: 'payment666',
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'billing@example.com',
          displayName: 'Billing User',
        }),
      });

      mockUpdateDoc.mockResolvedValue(undefined);
      mockSendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user666');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockSendPaymentSuccess).toHaveBeenCalledWith(
        expect.any(Object),
        299,
        expect.stringContaining('/account/billing')
      );
    });
  });

  describe('error handling', () => {
    it('should return 500 on unexpected errors', async () => {
      mockProcessITN.mockRejectedValue(new Error('Unexpected error'));

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal error');
    });
  });
});
