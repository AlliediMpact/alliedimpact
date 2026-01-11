import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateUrl,
  validateMinLength,
  validateMaxLength,
  validateFile,
} from '@/utils/validation';

describe('Validation Utilities', () => {
  describe('validateRequired', () => {
    it('should return valid for non-empty string', () => {
      const result = validateRequired('test', 'Field');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty string', () => {
      const result = validateRequired('', 'Field');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Field is required');
    });

    it('should return invalid for whitespace only', () => {
      const result = validateRequired('   ', 'Field');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Field is required');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.za',
        'name+tag@example.com',
        'test123@test-domain.com',
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    it('should invalidate incorrect email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test @example.com',
        'test..name@example.com',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid email address');
      });
    });
  });

  describe('validatePhone', () => {
    it('should validate South African phone numbers', () => {
      const validPhones = [
        '+27 11 123 4567',
        '+27821234567',
        '0821234567',
        '011 123 4567',
      ];

      validPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
      });
    });

    it('should invalidate incorrect phone numbers', () => {
      const invalidPhones = [
        '123',
        'abcd',
        '+1234',
      ];

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid phone number');
      });
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.co.za',
        'https://www.domain.com/path?query=value',
      ];

      validUrls.forEach(url => {
        const result = validateUrl(url);
        expect(result.isValid).toBe(true);
      });
    });

    it('should invalidate incorrect URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'example.com',
        'ftp://example.com',
      ];

      invalidUrls.forEach(url => {
        const result = validateUrl(url);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid URL');
      });
    });
  });

  describe('validateMinLength', () => {
    it('should validate strings meeting minimum length', () => {
      const result = validateMinLength('12345', 5, 'Field');
      expect(result.isValid).toBe(true);
    });

    it('should invalidate strings below minimum length', () => {
      const result = validateMinLength('123', 5, 'Field');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Field must be at least 5 characters');
    });
  });

  describe('validateMaxLength', () => {
    it('should validate strings within maximum length', () => {
      const result = validateMaxLength('12345', 10, 'Field');
      expect(result.isValid).toBe(true);
    });

    it('should invalidate strings exceeding maximum length', () => {
      const result = validateMaxLength('12345678901', 10, 'Field');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Field must not exceed 10 characters');
    });
  });

  describe('validateFile', () => {
    it('should validate file within size limit', () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

      const result = validateFile(file, {
        required: true,
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['application/pdf'],
      });

      expect(result.isValid).toBe(true);
    });

    it('should invalidate file exceeding size limit', () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB

      const result = validateFile(file, {
        required: true,
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['application/pdf'],
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size must not exceed');
    });

    it('should invalidate file with wrong type', () => {
      const file = new File(['test content'], 'test.exe', { type: 'application/x-msdownload' });

      const result = validateFile(file, {
        required: true,
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['application/pdf'],
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });
  });
});
