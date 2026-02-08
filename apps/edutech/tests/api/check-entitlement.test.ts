/**
 * Tests for /api/check-entitlement route
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../../src/app/api/check-entitlement/route';

// Mock the entitlements package
jest.mock('@allied-impact/entitlements', () => ({
  hasProductAccess: jest.fn(),
}));

const { hasProductAccess } = require('@allied-impact/entitlements');

describe('GET /api/check-entitlement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('valid requests', () => {
    it('should return true when user has access', async () => {
      hasProductAccess.mockResolvedValueOnce(true);

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

    it('should return false when user does not have access', async () => {
      hasProductAccess.mockResolvedValueOnce(false);

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
      hasProductAccess.mockResolvedValueOnce(true);

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
      hasProductAccess.mockResolvedValueOnce(true);

      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement?userId=user999&productId=custom-product'
      );

      const response = await GET(request);
      await response.json();

      expect(hasProductAccess).toHaveBeenCalledWith('user999', 'custom-product');
    });
  });

  describe('validation', () => {
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
      hasProductAccess.mockRejectedValueOnce(new Error('Database error'));

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

    it('should return 500 when hasProductAccess throws unexpected error', async () => {
      hasProductAccess.mockRejectedValueOnce('Unexpected error');

      const request = new NextRequest(
        'http://localhost:3000/api/check-entitlement?userId=user123'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
    });
  });
});
