/**
 * Tests for /api/check-entitlement endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/check-entitlement/route';

// Mock the entitlements package
jest.mock('@allied-impact/entitlements', () => ({
  hasProductAccess: jest.fn(),
}));

const { hasProductAccess } = require('@allied-impact/entitlements');

describe('GET /api/check-entitlement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful requests', () => {
    it('should return success when user has access', async () => {
      hasProductAccess.mockResolvedValue(true);

      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement?userId=user123&productId=edutech'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        hasAccess: true,
        productId: 'edutech',
      });
      expect(hasProductAccess).toHaveBeenCalledWith('user123', 'edutech');
    });

    it('should return success when user does not have access', async () => {
      hasProductAccess.mockResolvedValue(false);

      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement?userId=user456'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        hasAccess: false,
        productId: 'edutech',
      });
    });

    it('should use default productId when not provided', async () => {
      hasProductAccess.mockResolvedValue(true);

      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement?userId=user789'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.productId).toBe('edutech');
      expect(hasProductAccess).toHaveBeenCalledWith('user789', 'edutech');
    });

    it('should accept custom productId', async () => {
      hasProductAccess.mockResolvedValue(true);

      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement?userId=user123&productId=custom-product'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.productId).toBe('custom-product');
      expect(hasProductAccess).toHaveBeenCalledWith('user123', 'custom-product');
    });
  });

  describe('validation errors', () => {
    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing userId parameter',
      });
      expect(hasProductAccess).not.toHaveBeenCalled();
    });

    it('should return 400 when userId is empty string', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement?userId='
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing userId parameter');
    });
  });

  describe('error handling', () => {
    it('should return 500 when hasProductAccess throws error', async () => {
      hasProductAccess.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement?userId=user123'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to check entitlement',
      });
    });

    it('should handle network errors gracefully', async () => {
      hasProductAccess.mockRejectedValue(new Error('Network timeout'));

      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement?userId=user456'
      );

      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});
