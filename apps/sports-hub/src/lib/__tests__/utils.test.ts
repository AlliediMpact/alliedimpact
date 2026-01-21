import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  getRelativeTime,
  truncateText,
  generateSlug,
  validateEmail,
  validatePhoneNumber,
} from '../utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('should deduplicate Tailwind classes', () => {
      const result = cn('px-4', 'px-8'); // px-8 should win
      expect(result).toContain('px-8');
      expect(result).not.toContain('px-4');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in ZAR', () => {
      expect(formatCurrency(5000)).toBe('R 50.00');
      expect(formatCurrency(12345)).toBe('R 123.45');
      expect(formatCurrency(100)).toBe('R 1.00');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('R 0.00');
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toBe('R 10,000.00');
      expect(formatCurrency(123456789)).toBe('R 1,234,567.89');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-5000);
      expect(result).toContain('-');
      expect(result).toContain('50.00');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-01-21T10:00:00Z');
      const formatted = formatDate(date);
      
      expect(formatted).toContain('2026');
      expect(formatted).toContain('January');
      expect(formatted).toContain('21');
    });

    it('should use ZA locale format', () => {
      const date = new Date('2026-12-31');
      const formatted = formatDate(date);
      
      expect(formatted).toMatch(/\d+ \w+ \d{4}/); // e.g., "31 December 2026"
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime with time', () => {
      const date = new Date('2026-01-21T14:30:00Z');
      const formatted = formatDateTime(date);
      
      expect(formatted).toContain('2026');
      expect(formatted).toContain('January');
      expect(formatted).toContain('21');
      // Time might vary based on timezone
    });
  });

  describe('getRelativeTime', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-21T12:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return "just now" for recent times', () => {
      const date = new Date('2026-01-21T11:59:45Z'); // 15 seconds ago
      expect(getRelativeTime(date)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const date = new Date('2026-01-21T11:55:00Z'); // 5 minutes ago
      expect(getRelativeTime(date)).toBe('5 minutes ago');
    });

    it('should return hours ago', () => {
      const date = new Date('2026-01-21T10:00:00Z'); // 2 hours ago
      expect(getRelativeTime(date)).toBe('2 hours ago');
    });

    it('should return days ago', () => {
      const date = new Date('2026-01-19T12:00:00Z'); // 2 days ago
      expect(getRelativeTime(date)).toBe('2 days ago');
    });

    it('should return months ago', () => {
      const date = new Date('2025-11-21T12:00:00Z'); // 2 months ago
      expect(getRelativeTime(date)).toBe('2 months ago');
    });

    it('should return years ago', () => {
      const date = new Date('2024-01-21T12:00:00Z'); // 2 years ago
      expect(getRelativeTime(date)).toBe('2 years ago');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncateText(text, 20);
      
      expect(result.length).toBeLessThanOrEqual(23); // 20 + "..."
      expect(result).toContain('...');
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);
      
      expect(result).toBe(text);
      expect(result).not.toContain('...');
    });

    it('should handle empty string', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('generateSlug', () => {
    it('should generate slug from text', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Test Tournament 2026')).toBe('test-tournament-2026');
    });

    it('should handle special characters', () => {
      expect(generateSlug('Test & Tournament!')).toBe('test-tournament');
      expect(generateSlug('São Paulo FC')).toBe('so-paulo-fc');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Test    Tournament')).toBe('test-tournament');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(generateSlug('-Test Tournament-')).toBe('test-tournament');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.za')).toBe(true);
      expect(validateEmail('test123@domain.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test @example.com')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate South African phone numbers', () => {
      expect(validatePhoneNumber('0821234567')).toBe(true);
      expect(validatePhoneNumber('+27821234567')).toBe(true);
      expect(validatePhoneNumber('27821234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('abcdefghij')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });

    it('should handle phone numbers with spaces', () => {
      expect(validatePhoneNumber('082 123 4567')).toBe(true);
      expect(validatePhoneNumber('+27 82 123 4567')).toBe(true);
    });
  });
});
