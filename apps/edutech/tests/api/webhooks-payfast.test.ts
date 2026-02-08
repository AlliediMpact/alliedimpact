/**
 * Tests for /api/webhooks/payfast route
 */

import { NextRequest } from 'next/server';
import { POST } from '../../../src/app/api/webhooks/payfast/route';

// Mock payment service
jest.mock('../../../src/services/paymentService', () => ({
  getPayFastService: jest.fn(),
}));

// Mock email service
jest.mock('../../../src/services/emailService', () => ({
  getEmailService: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
}));

const { getPayFastService } = require('../../../src/services/paymentService');
const { getEmailService } = require('../../../src/services/emailService');
const firestore = require('firebase/firestore');

describe('POST /api/webhooks/payfast', () => {
  let mockPayFastService: any;
  let mockEmailService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPayFastService = {
      processITN: jest.fn(),
    };

    mockEmailService = {
      sendPaymentSuccess: jest.fn(),
      sendPaymentFailed: jest.fn(),
    };

    getPayFastService.mockReturnValue(mockPayFastService);
    getEmailService.mockReturnValue(mockEmailService);
  });

  describe('successful payment', () => {
    it('should process successful payment', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user123',
        amount: 299,
        paymentId: 'payment123',
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user@example.com',
          displayName: 'Test User',
        }),
      });

      firestore.updateDoc.mockResolvedValue(undefined);
      mockEmailService.sendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('m_payment_id', 'payment123');
      formData.append('payment_status', 'COMPLETE');
      formData.append('amount_gross', '299.00');
      formData.append('custom_str1', 'user123');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ status: 'ok' });
      expect(mockPayFastService.processITN).toHaveBeenCalled();
      expect(firestore.updateDoc).toHaveBeenCalled();
      expect(mockEmailService.sendPaymentSuccess).toHaveBeenCalled();
    });

    it('should update user subscription to PREMIUM', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user456',
        amount: 299,
        paymentId: 'payment456',
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user456@example.com',
          displayName: 'User 456',
        }),
      });

      firestore.updateDoc.mockResolvedValue(undefined);
      mockEmailService.sendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user456');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      const updateCall = firestore.updateDoc.mock.calls[0][1];
      expect(updateCall['products.edutech.tier']).toBe('PREMIUM');
      expect(updateCall['products.edutech.active']).toBe(true);
      expect(updateCall['products.edutech.trialEndsAt']).toBeNull();
    });

    it('should store payment details', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user789',
        amount: 299,
        paymentId: 'payment789',
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user789@example.com',
          displayName: 'User 789',
        }),
      });

      firestore.updateDoc.mockResolvedValue(undefined);
      mockEmailService.sendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user789');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      const updateCall = firestore.updateDoc.mock.calls[0][1];
      expect(updateCall['products.edutech.lastPaymentAmount']).toBe(299);
      expect(updateCall['products.edutech.lastPaymentId']).toBe('payment789');
    });

    it('should send confirmation email', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user999',
        amount: 299,
        paymentId: 'payment999',
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user999@example.com',
          displayName: 'User 999',
        }),
      });

      firestore.updateDoc.mockResolvedValue(undefined);
      mockEmailService.sendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user999');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockEmailService.sendPaymentSuccess).toHaveBeenCalledWith(
        { email: 'user999@example.com', name: 'User 999' },
        299,
        expect.any(String)
      );
    });
  });

  describe('failed payment', () => {
    it('should handle failed payment status', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'FAILED',
        userId: 'user123',
        amount: 299,
        paymentId: 'payment123',
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user@example.com',
          displayName: 'Test User',
        }),
      });

      mockEmailService.sendPaymentFailed.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'FAILED');
      formData.append('custom_str1', 'user123');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ status: 'ok' });
      expect(mockEmailService.sendPaymentFailed).toHaveBeenCalled();
      expect(firestore.updateDoc).not.toHaveBeenCalled();
    });

    it('should handle cancelled payment status', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'CANCELLED',
        userId: 'user456',
        amount: 299,
        paymentId: 'payment456',
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user456@example.com',
          displayName: 'User 456',
        }),
      });

      mockEmailService.sendPaymentFailed.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'CANCELLED');
      formData.append('custom_str1', 'user456');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(mockEmailService.sendPaymentFailed).toHaveBeenCalledWith(
        { email: 'user456@example.com', name: 'User 456' },
        299,
        'CANCELLED'
      );
    });

    it('should send failure email with reason', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'FAILED',
        userId: 'user789',
        amount: 299,
        paymentId: 'payment789',
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user789@example.com',
          displayName: 'User 789',
        }),
      });

      mockEmailService.sendPaymentFailed.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('payment_status', 'FAILED');
      formData.append('custom_str1', 'user789');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockEmailService.sendPaymentFailed).toHaveBeenCalledWith(
        { email: 'user789@example.com', name: 'User 789' },
        299,
        'FAILED'
      );
    });
  });

  describe('validation', () => {
    it('should return 400 for invalid signature', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: false,
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
      expect(data).toEqual({ error: 'Invalid signature' });
      expect(firestore.updateDoc).not.toHaveBeenCalled();
      expect(mockEmailService.sendPaymentSuccess).not.toHaveBeenCalled();
    });

    it('should return 400 when userId is missing', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: null,
        amount: 299,
        paymentId: 'payment123',
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
      expect(data).toEqual({ error: 'Missing userId' });
    });

    it('should return 400 when userId is undefined', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        amount: 299,
        paymentId: 'payment123',
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
    });
  });

  describe('unhandled payment status', () => {
    it('should return 200 for unhandled status', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'PENDING',
        userId: 'user123',
        amount: 299,
        paymentId: 'payment123',
      });

      const formData = new FormData();
      formData.append('payment_status', 'PENDING');
      formData.append('custom_str1', 'user123');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ status: 'ok' });
      expect(firestore.updateDoc).not.toHaveBeenCalled();
      expect(mockEmailService.sendPaymentSuccess).not.toHaveBeenCalled();
      expect(mockEmailService.sendPaymentFailed).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return 500 when processITN throws error', async () => {
      mockPayFastService.processITN.mockRejectedValue(new Error('ITN processing error'));

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal error' });
    });

    it('should return 500 when firestore operation fails', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user123',
        amount: 299,
        paymentId: 'payment123',
      });

      firestore.getDoc.mockRejectedValue(new Error('Firestore error'));

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user123');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
    });

    it('should handle user not found gracefully', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'nonexistent',
        amount: 299,
        paymentId: 'payment123',
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'nonexistent');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('should handle email service errors gracefully', async () => {
      mockPayFastService.processITN.mockResolvedValue({
        valid: true,
        paymentStatus: 'COMPLETE',
        userId: 'user123',
        amount: 299,
        paymentId: 'payment123',
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user@example.com',
          displayName: 'Test User',
        }),
      });

      firestore.updateDoc.mockResolvedValue(undefined);
      mockEmailService.sendPaymentSuccess.mockRejectedValue(new Error('Email error'));

      const formData = new FormData();
      formData.append('payment_status', 'COMPLETE');
      formData.append('custom_str1', 'user123');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });

  describe('form data parsing', () => {
    it('should parse form data correctly', async () => {
      const parsedData: any = {};

      mockPayFastService.processITN.mockImplementation((data) => {
        Object.assign(parsedData, data);
        return Promise.resolve({
          valid: true,
          paymentStatus: 'COMPLETE',
          userId: 'user123',
          amount: 299,
          paymentId: 'payment123',
        });
      });

      firestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          email: 'user@example.com',
          displayName: 'Test User',
        }),
      });

      firestore.updateDoc.mockResolvedValue(undefined);
      mockEmailService.sendPaymentSuccess.mockResolvedValue(undefined);

      const formData = new FormData();
      formData.append('m_payment_id', 'payment123');
      formData.append('payment_status', 'COMPLETE');
      formData.append('amount_gross', '299.00');
      formData.append('custom_str1', 'user123');

      const request = new NextRequest('http://localhost:3000/api/webhooks/payfast', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(parsedData.m_payment_id).toBe('payment123');
      expect(parsedData.payment_status).toBe('COMPLETE');
      expect(parsedData.amount_gross).toBe('299.00');
      expect(parsedData.custom_str1).toBe('user123');
    });
  });
});
