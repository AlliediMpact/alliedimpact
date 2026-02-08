import { ErrorCode } from '../../lib/errors';

describe('errors', () => {
  describe('ErrorCode enum', () => {
    it('should have authentication error codes', () => {
      expect(ErrorCode.AUTH_INVALID_CREDENTIALS).toBe('AUTH_INVALID_CREDENTIALS');
      expect(ErrorCode.AUTH_USER_NOT_FOUND).toBe('AUTH_USER_NOT_FOUND');
      expect(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS).toBe('AUTH_EMAIL_ALREADY_EXISTS');
      expect(ErrorCode.AUTH_WEAK_PASSWORD).toBe('AUTH_WEAK_PASSWORD');
      expect(ErrorCode.AUTH_SESSION_EXPIRED).toBe('AUTH_SESSION_EXPIRED');
      expect(ErrorCode.AUTH_UNAUTHORIZED).toBe('AUTH_UNAUTHORIZED');
    });

    it('should have course error codes', () => {
      expect(ErrorCode.COURSE_NOT_FOUND).toBe('COURSE_NOT_FOUND');
      expect(ErrorCode.COURSE_ALREADY_ENROLLED).toBe('COURSE_ALREADY_ENROLLED');
      expect(ErrorCode.COURSE_ENROLLMENT_FAILED).toBe('COURSE_ENROLLMENT_FAILED');
      expect(ErrorCode.COURSE_ACCESS_DENIED).toBe('COURSE_ACCESS_DENIED');
    });

    it('should have subscription error codes', () => {
      expect(ErrorCode.SUBSCRIPTION_TRIAL_ALREADY_USED).toBe('SUBSCRIPTION_TRIAL_ALREADY_USED');
      expect(ErrorCode.SUBSCRIPTION_ACTIVATION_FAILED).toBe('SUBSCRIPTION_ACTIVATION_FAILED');
      expect(ErrorCode.SUBSCRIPTION_PAYMENT_FAILED).toBe('SUBSCRIPTION_PAYMENT_FAILED');
    });

    it('should have generic error codes', () => {
      expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
      expect(ErrorCode.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
    });
  });
});
