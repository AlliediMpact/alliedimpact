/**
 * @jest-environment jsdom
 */

import { debounce, throttle, RateLimiter } from '@/lib/utils/rateLimiting';

describe('rateLimiting utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn('test');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(999);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn('first');
      jest.advanceTimersByTime(500);

      debouncedFn('second');
      jest.advanceTimersByTime(500);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledWith('second');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      debouncedFn('arg1', 'arg2', 'arg3');
      jest.advanceTimersByTime(1000);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('should only execute last call in rapid succession', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn('call1');
      jest.advanceTimersByTime(100);
      debouncedFn('call2');
      jest.advanceTimersByTime(100);
      debouncedFn('call3');
      jest.advanceTimersByTime(100);
      debouncedFn('call4');

      jest.advanceTimersByTime(500);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call4');
    });
  });

  describe('throttle', () => {
    it('should execute immediately on first call', () => {
      const mockFn = jest.fn(() => 'result');
      const throttledFn = throttle(mockFn, 1000);

      const result = throttledFn('test');

      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should block subsequent calls within wait period', () => {
      const mockFn = jest.fn(() => 'result');
      const throttledFn = throttle(mockFn, 1000);

      throttledFn('call1');
      throttledFn('call2');
      throttledFn('call3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');
    });

    it('should allow call after wait period', () => {
      const mockFn = jest.fn(() => 'result');
      const throttledFn = throttle(mockFn, 1000);

      throttledFn('call1');
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);

      throttledFn('call2');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('call2');
    });

    it('should return last result during throttle period', () => {
      const mockFn = jest.fn(() => 'first-result');
      const throttledFn = throttle(mockFn, 1000);

      const result1 = throttledFn();
      const result2 = throttledFn();

      expect(result1).toBe('first-result');
      expect(result2).toBe('first-result');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle zero wait time', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 0);

      throttledFn('call1');
      jest.advanceTimersByTime(0);
      throttledFn('call2');

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('RateLimiter', () => {
    it('should allow calls under the limit', () => {
      const limiter = new RateLimiter(3, 1000);

      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(true);
    });

    it('should block calls over the limit', () => {
      const limiter = new RateLimiter(2, 1000);

      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(false);
      expect(limiter.isAllowed()).toBe(false);
    });

    it('should allow calls after window expires', () => {
      const limiter = new RateLimiter(2, 1000);

      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(false);

      jest.advanceTimersByTime(1000);

      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(false);
    });

    it('should track calls within sliding window', () => {
      const limiter = new RateLimiter(3, 1000);

      expect(limiter.isAllowed()).toBe(true); // t=0
      jest.advanceTimersByTime(300);

      expect(limiter.isAllowed()).toBe(true); // t=300
      jest.advanceTimersByTime(300);

      expect(limiter.isAllowed()).toBe(true); // t=600
      expect(limiter.isAllowed()).toBe(false); // t=600, limit reached

      jest.advanceTimersByTime(400); // t=1000, first call expired

      expect(limiter.isAllowed()).toBe(true); // Should allow now
    });

    it('should return correct time until allowed', () => {
      const limiter = new RateLimiter(2, 1000);

      limiter.isAllowed(); // Call 1
      limiter.isAllowed(); // Call 2

      const timeUntil = limiter.getTimeUntilAllowed();

      expect(timeUntil).toBeGreaterThan(0);
      expect(timeUntil).toBeLessThanOrEqual(1000);
    });

    it('should return zero time until allowed when under limit', () => {
      const limiter = new RateLimiter(3, 1000);

      limiter.isAllowed(); // Call 1

      const timeUntil = limiter.getTimeUntilAllowed();

      expect(timeUntil).toBe(0);
    });

    it('should handle edge case of zero max calls', () => {
      const limiter = new RateLimiter(0, 1000);

      expect(limiter.isAllowed()).toBe(false);
      expect(limiter.isAllowed()).toBe(false);
    });

    it('should handle edge case of very short window', () => {
      const limiter = new RateLimiter(2, 10);

      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(true);
      expect(limiter.isAllowed()).toBe(false);

      jest.advanceTimersByTime(10);

      expect(limiter.isAllowed()).toBe(true);
    });

    it('should calculate decreasing time until allowed', () => {
      const limiter = new RateLimiter(1, 1000);

      limiter.isAllowed(); // First call at t=0

      let timeUntil = limiter.getTimeUntilAllowed();
      expect(timeUntil).toBe(1000);

      jest.advanceTimersByTime(300);

      timeUntil = limiter.getTimeUntilAllowed();
      expect(timeUntil).toBe(700);

      jest.advanceTimersByTime(500);

      timeUntil = limiter.getTimeUntilAllowed();
      expect(timeUntil).toBe(200);

      jest.advanceTimersByTime(200);

      timeUntil = limiter.getTimeUntilAllowed();
      expect(timeUntil).toBe(0);
    });

    it('should correctly handle high frequency calls', () => {
      const limiter = new RateLimiter(5, 100);

      for (let i = 0; i < 5; i++) {
        expect(limiter.isAllowed()).toBe(true);
      }

      for (let i = 0; i < 10; i++) {
        expect(limiter.isAllowed()).toBe(false);
      }

      jest.advanceTimersByTime(100);

      for (let i = 0; i < 5; i++) {
        expect(limiter.isAllowed()).toBe(true);
      }
    });
  });

  describe('Integration scenarios', () => {
    it('debounce should work with search input simulation', () => {
      const mockSearch = jest.fn();
      const debouncedSearch = debounce(mockSearch, 300);

      // User typing "test"
      debouncedSearch('t');
      jest.advanceTimersByTime(50);
      debouncedSearch('te');
      jest.advanceTimersByTime(50);
      debouncedSearch('tes');
      jest.advanceTimersByTime(50);
      debouncedSearch('test');

      expect(mockSearch).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      expect(mockSearch).toHaveBeenCalledTimes(1);
      expect(mockSearch).toHaveBeenCalledWith('test');
    });

    it('throttle should work with scroll event simulation', () => {
      const mockScroll = jest.fn();
      const throttledScroll = throttle(mockScroll, 100);

      // Rapid scroll events
      for (let i = 0; i < 10; i++) {
        throttledScroll(i * 10);
      }

      expect(mockScroll).toHaveBeenCalledTimes(1);
      expect(mockScroll).toHaveBeenCalledWith(0);

      jest.advanceTimersByTime(100);

      throttledScroll(100);
      expect(mockScroll).toHaveBeenCalledTimes(2);
      expect(mockScroll).toHaveBeenCalledWith(100);
    });

    it('RateLimiter should work with API request simulation', () => {
      const limiter = new RateLimiter(10, 60000); // 10 requests per minute

      // Simulate 10 successful API calls
      for (let i = 0; i < 10; i++) {
        expect(limiter.isAllowed()).toBe(true);
      }

      // 11th call should be blocked
      expect(limiter.isAllowed()).toBe(false);

      const waitTime = limiter.getTimeUntilAllowed();
      expect(waitTime).toBeGreaterThan(0);
      expect(waitTime).toBeLessThanOrEqual(60000);

      // Fast forward to after window
      jest.advanceTimersByTime(60000);

      // Should allow new requests
      expect(limiter.isAllowed()).toBe(true);
    });
  });
});
