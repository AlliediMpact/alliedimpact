/**
 * Tests for utility functions
 */

import { cn, formatCurrency, formatNumber, truncate, formatRelativeTime, debounce, sleep } from '../../src/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'included', false && 'excluded');
      expect(result).toContain('base');
      expect(result).toContain('included');
      expect(result).not.toContain('excluded');
    });

    it('should handle conflicting Tailwind classes', () => {
      const result = cn('px-2', 'px-4');
      // Should resolve to px-4 (last wins)
      expect(result).toContain('px-4');
    });

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('should handle object notation', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      });
      expect(result).toContain('class1');
      expect(result).not.toContain('class2');
      expect(result).toContain('class3');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with ZAR symbol', () => {
      const result = formatCurrency(100);
      expect(result).toBe('R100.00');
    });

    it('should format currency with decimals', () => {
      const result = formatCurrency(123.45);
      expect(result).toBe('R123.45');
    });

    it('should format zero', () => {
      const result = formatCurrency(0);
      expect(result).toBe('R0.00');
    });

    it('should format negative numbers', () => {
      const result = formatCurrency(-50);
      expect(result).toBe('-R50.00');
    });

    it('should format large numbers', () => {
      const result = formatCurrency(1000000);
      expect(result).toBe('R1,000,000.00');
    });
  });

  describe('formatNumber', () => {
    it('should not abbreviate numbers under 1000', () => {
      expect(formatNumber(999)).toBe('999');
    });

    it('should abbreviate thousands with K', () => {
      expect(formatNumber(1500)).toBe('1.5K');
    });

    it('should abbreviate millions with M', () => {
      expect(formatNumber(2500000)).toBe('2.5M');
    });

    it('should handle exact thousands', () => {
      expect(formatNumber(5000)).toBe('5K');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(1)).toBe('1');
    });
  });

  describe('truncate', () => {
    it('should not truncate short text', () => {
      const result = truncate('Short text', 20);
      expect(result).toBe('Short text');
    });

    it('should truncate long text', () => {
      const result = truncate('This is a very long text that needs truncation', 20);
      expect(result).toBe('This is a very long...');
    });

    it('should truncate at exact length', () => {
      const result = truncate('Exactly twenty chars', 20);
      expect(result).toBe('Exactly twenty chars');
    });

    it('should handle empty string', () => {
      const result = truncate('', 10);
      expect(result).toBe('');
    });

    it('should handle zero length', () => {
      const result = truncate('Test', 0);
      expect(result).toBe('...');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should show "just now" for recent times', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      expect(result).toBe('just now');
    });

    it('should show minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeTime(fiveMinutesAgo);
      expect(result).toBe('5 minutes ago');
    });

    it('should show hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoHoursAgo);
      expect(result).toBe('2 hours ago');
    });

    it('should show days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(threeDaysAgo);
      expect(result).toBe('3 days ago');
    });

    it('should show months ago', () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoMonthsAgo);
      expect(result).toContain('months ago');
    });

    it('should show years ago', () => {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(oneYearAgo);
      expect(result).toContain('year');
    });

    it('should show singular for 1 minute', () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const result = formatRelativeTime(oneMinuteAgo);
      expect(result).toBe('1 minute ago');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous call', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn();
      jest.advanceTimersByTime(300);
      
      debouncedFn();
      jest.advanceTimersByTime(300);
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(200);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to function', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 500);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(500);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      jest.useFakeTimers();

      const promise = sleep(1000);
      jest.advanceTimersByTime(1000);

      await promise;
      expect(true).toBe(true);

      jest.useRealTimers();
    });

    it('should work with different durations', async () => {
      jest.useFakeTimers();

      const promise = sleep(500);
      jest.advanceTimersByTime(500);

      await promise;
      expect(true).toBe(true);

      jest.useRealTimers();
    });
  });
});
