import {
  cn,
  formatCurrency,
  formatNumber,
  truncate,
  formatRelativeTime,
  debounce,
  sleep,
} from '../../lib/utils';

describe('utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'active', false && 'disabled');
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });

    it('should override conflicting Tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('should handle arrays and objects', () => {
      const result = cn(['class1', 'class2'], { active: true, disabled: false });
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });
  });

  describe('formatCurrency', () => {
    it('should format ZAR currency correctly', () => {
      expect(formatCurrency(1000)).toBe('R1 000');
    });

    it('should format without decimals', () => {
      expect(formatCurrency(1500.75)).toBe('R1 501');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('R0');
    });

    it('should handle negative numbers', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('500');
      expect(result).toContain('-');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('R1 000 000');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers under 1000 as-is', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(0)).toBe('0');
    });

    it('should format thousands with K', () => {
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(12345)).toBe('12.3K');
    });

    it('should format millions with M', () => {
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(12345678)).toBe('12.3M');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(999999)).toBe('1000.0K');
      expect(formatNumber(1)).toBe('1');
    });
  });

  describe('truncate', () => {
    it('should not truncate text shorter than limit', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('should truncate text longer than limit', () => {
      expect(truncate('Hello World!', 8)).toBe('Hello Wo...');
    });

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('');
    });

    it('should handle zero length', () => {
      expect(truncate('Hello', 0)).toBe('...');
    });
  });

  describe('formatRelativeTime', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-02-08T12:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should show "just now" for recent times', () => {
      const date = new Date('2026-02-08T11:59:40Z'); // 20 seconds ago
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('should show minutes ago', () => {
      const date = new Date('2026-02-08T11:55:00Z'); // 5 minutes ago
      expect(formatRelativeTime(date)).toBe('5 minutes ago');
    });

    it('should show hours ago', () => {
      const date = new Date('2026-02-08T10:00:00Z'); // 2 hours ago
      expect(formatRelativeTime(date)).toBe('2 hours ago');
    });

    it('should show days ago', () => {
      const date = new Date('2026-02-06T12:00:00Z'); // 2 days ago
      expect(formatRelativeTime(date)).toBe('2 days ago');
    });

    it('should show months ago', () => {
      const date = new Date('2025-12-08T12:00:00Z'); // 2 months ago
      expect(formatRelativeTime(date)).toBe('2 months ago');
    });

    it('should show years ago', () => {
      const date = new Date('2024-02-08T12:00:00Z'); // 2 years ago
      expect(formatRelativeTime(date)).toBe('2 years ago');
    });

    it('should handle singular forms', () => {
      const oneMinuteAgo = new Date('2026-02-08T11:59:00Z');
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    });
  });

  describe('debounce', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('sleep', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should resolve after specified time', async () => {
      const promise = sleep(1000);
      
      jest.advanceTimersByTime(1000);
      await promise;

      expect(true).toBe(true); // If we get here, it worked
    });

    it('should work with different durations', async () => {
      const promise = sleep(500);
      
      jest.advanceTimersByTime(500);
      await promise;

      expect(true).toBe(true);
    });
  });
});
