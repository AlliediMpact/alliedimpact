/**
 * Tests for ErrorCode enum
 */

import { ErrorCode } from '../../src/lib/errors';

describe('ErrorCode', () => {
  describe('authentication error codes', () => {
    it('should have authentication error codes', () => {
      expect(ErrorCode.AUTH_FAILED).toBe('AUTH_FAILED');
      expect(ErrorCode.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
      expect(ErrorCode.AUTH_TOKEN_EXPIRED).toBe('AUTH_TOKEN_EXPIRED');
      expect(ErrorCode.AUTH_TOKEN_INVALID).toBe('AUTH_TOKEN_INVALID');
      expect(ErrorCode.AUTH_UNAUTHORIZED).toBe('AUTH_UNAUTHORIZED');
      expect(ErrorCode.AUTH_EMAIL_NOT_VERIFIED).toBe('AUTH_EMAIL_NOT_VERIFIED');
    });
  });

  describe('course error codes', () => {
    it('should have course error codes', () => {
      expect(ErrorCode.COURSE_NOT_FOUND).toBe('COURSE_NOT_FOUND');
      expect(ErrorCode.COURSE_FETCH_FAILED).toBe('COURSE_FETCH_FAILED');
      expect(ErrorCode.COURSES_FETCH_FAILED).toBe('COURSES_FETCH_FAILED');
      expect(ErrorCode.COURSE_ENROLLMENT_FAILED).toBe('COURSE_ENROLLMENT_FAILED');
    });
  });

  describe('subscription error codes', () => {
    it('should have subscription error codes', () => {
      expect(ErrorCode.SUBSCRIPTION_REQUIRED).toBe('SUBSCRIPTION_REQUIRED');
      expect(ErrorCode.SUBSCRIPTION_EXPIRED).toBe('SUBSCRIPTION_EXPIRED');
      expect(ErrorCode.SUBSCRIPTION_PAYMENT_FAILED).toBe('SUBSCRIPTION_PAYMENT_FAILED');
    });
  });

  describe('generic error codes', () => {
    it('should have generic error codes', () => {
      expect(ErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorCode.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });
});
