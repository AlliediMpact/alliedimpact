import {
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateUrl,
  validateNumber,
  validateNumberRange,
  validateDate,
  validateFutureDate,
  validatePastDate,
  validateFile,
  validateSalaryRange,
  validateForm,
} from '@/utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toEqual({ isValid: true });
      expect(validateEmail('test.email@company.co.za')).toEqual({ isValid: true });
      expect(validateEmail('name+tag@domain.com')).toEqual({ isValid: true });
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
      expect(validateEmail('test@')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
      expect(validateEmail('@example.com')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
      expect(validateEmail('')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
    });
  });

  describe('validatePhone', () => {
    it('should validate correct South African phone numbers', () => {
      expect(validatePhone('0821234567')).toEqual({ isValid: true });
      expect(validatePhone('+27821234567')).toEqual({ isValid: true });
      expect(validatePhone('0123456789')).toEqual({ isValid: true });
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toEqual({
        isValid: false,
        error: 'Please enter a valid phone number',
      });
      expect(validatePhone('abcdefghij')).toEqual({
        isValid: false,
        error: 'Please enter a valid phone number',
      });
      expect(validatePhone('')).toEqual({
        isValid: false,
        error: 'Please enter a valid phone number',
      });
    });
  });

  describe('validatePassword', () => {
    it('should score passwords correctly', () => {
      expect(validatePassword('weak').score).toBe(0); // Very weak
      expect(validatePassword('Password1').score).toBe(2); // Fair
      expect(validatePassword('Password123').score).toBe(3); // Good
      expect(validatePassword('StrongP@ssw0rd!').score).toBe(4); // Very strong
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should accept strong passwords', () => {
      const result = validatePassword('StrongP@ssw0rd!');
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(4);
    });
  });

  describe('validatePasswordMatch', () => {
    it('should validate matching passwords', () => {
      expect(validatePasswordMatch('password123', 'password123')).toEqual({
        isValid: true,
      });
    });

    it('should reject non-matching passwords', () => {
      expect(validatePasswordMatch('password123', 'different')).toEqual({
        isValid: false,
        error: 'Passwords do not match',
      });
    });
  });

  describe('validateRequired', () => {
    it('should accept non-empty values', () => {
      expect(validateRequired('value')).toEqual({ isValid: true });
      expect(validateRequired('  text  ')).toEqual({ isValid: true });
    });

    it('should reject empty values', () => {
      expect(validateRequired('')).toEqual({
        isValid: false,
        error: 'This field is required',
      });
      expect(validateRequired('   ')).toEqual({
        isValid: false,
        error: 'This field is required',
      });
    });

    it('should accept custom field names', () => {
      expect(validateRequired('', 'Email')).toEqual({
        isValid: false,
        error: 'Email is required',
      });
    });
  });

  describe('validateMinLength', () => {
    it('should accept values meeting minimum length', () => {
      expect(validateMinLength('hello', 5)).toEqual({ isValid: true });
      expect(validateMinLength('hello world', 5)).toEqual({ isValid: true });
    });

    it('should reject values below minimum length', () => {
      expect(validateMinLength('hi', 5)).toEqual({
        isValid: false,
        error: 'Must be at least 5 characters',
      });
    });
  });

  describe('validateMaxLength', () => {
    it('should accept values within maximum length', () => {
      expect(validateMaxLength('hello', 10)).toEqual({ isValid: true });
    });

    it('should reject values exceeding maximum length', () => {
      expect(validateMaxLength('hello world', 5)).toEqual({
        isValid: false,
        error: 'Must be no more than 5 characters',
      });
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toEqual({ isValid: true });
      expect(validateUrl('http://company.co.za')).toEqual({ isValid: true });
      expect(validateUrl('https://sub.domain.com/path?query=value')).toEqual({
        isValid: true,
      });
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toEqual({
        isValid: false,
        error: 'Please enter a valid URL',
      });
      expect(validateUrl('htp://wrong')).toEqual({
        isValid: false,
        error: 'Please enter a valid URL',
      });
    });
  });

  describe('validateNumber', () => {
    it('should validate numeric values', () => {
      expect(validateNumber('123')).toEqual({ isValid: true });
      expect(validateNumber('0')).toEqual({ isValid: true });
      expect(validateNumber('-50')).toEqual({ isValid: true });
      expect(validateNumber('99.99')).toEqual({ isValid: true });
    });

    it('should reject non-numeric values', () => {
      expect(validateNumber('abc')).toEqual({
        isValid: false,
        error: 'Please enter a valid number',
      });
      expect(validateNumber('12a')).toEqual({
        isValid: false,
        error: 'Please enter a valid number',
      });
    });
  });

  describe('validateNumberRange', () => {
    it('should validate numbers within range', () => {
      expect(validateNumberRange('50', 0, 100)).toEqual({ isValid: true });
      expect(validateNumberRange('0', 0, 100)).toEqual({ isValid: true });
      expect(validateNumberRange('100', 0, 100)).toEqual({ isValid: true });
    });

    it('should reject numbers outside range', () => {
      expect(validateNumberRange('150', 0, 100)).toEqual({
        isValid: false,
        error: 'Must be between 0 and 100',
      });
      expect(validateNumberRange('-5', 0, 100)).toEqual({
        isValid: false,
        error: 'Must be between 0 and 100',
      });
    });
  });

  describe('validateDate', () => {
    it('should validate correct date strings', () => {
      expect(validateDate('2024-01-01')).toEqual({ isValid: true });
      expect(validateDate('2023-12-31')).toEqual({ isValid: true });
    });

    it('should reject invalid date strings', () => {
      expect(validateDate('invalid')).toEqual({
        isValid: false,
        error: 'Please enter a valid date',
      });
      expect(validateDate('2024-13-01')).toEqual({
        isValid: false,
        error: 'Please enter a valid date',
      });
    });
  });

  describe('validateFutureDate', () => {
    it('should validate future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      expect(validateFutureDate(futureDate.toISOString().split('T')[0])).toEqual({
        isValid: true,
      });
    });

    it('should reject past dates', () => {
      expect(validateFutureDate('2020-01-01')).toEqual({
        isValid: false,
        error: 'Date must be in the future',
      });
    });
  });

  describe('validatePastDate', () => {
    it('should validate past dates', () => {
      expect(validatePastDate('2020-01-01')).toEqual({ isValid: true });
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validatePastDate(futureDate.toISOString().split('T')[0])).toEqual({
        isValid: false,
        error: 'Date must be in the past',
      });
    });
  });

  describe('validateFile', () => {
    it('should validate files within size and type constraints', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(validateFile(file, 5, ['application/pdf'])).toEqual({ isValid: true });
    });

    it('should reject files exceeding size limit', () => {
      const file = new File(['content'], 'large.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB
      expect(validateFile(file, 5, ['application/pdf'])).toEqual({
        isValid: false,
        error: 'File size must be less than 5MB',
      });
    });

    it('should reject files with invalid types', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/exe' });
      expect(validateFile(file, 5, ['application/pdf'])).toEqual({
        isValid: false,
        error: 'Invalid file type. Allowed types: application/pdf',
      });
    });
  });

  describe('validateSalaryRange', () => {
    it('should validate correct salary ranges', () => {
      expect(validateSalaryRange('50000', '100000')).toEqual({ isValid: true });
      expect(validateSalaryRange('50000', '50000')).toEqual({ isValid: true });
    });

    it('should reject invalid salary ranges', () => {
      expect(validateSalaryRange('100000', '50000')).toEqual({
        isValid: false,
        error: 'Maximum salary must be greater than minimum salary',
      });
    });

    it('should reject non-numeric salaries', () => {
      expect(validateSalaryRange('abc', '100000')).toEqual({
        isValid: false,
        error: 'Please enter valid salary amounts',
      });
    });
  });

  describe('validateForm', () => {
    it('should validate all fields in a form', () => {
      const validators = {
        email: (value: string) => validateEmail(value),
        password: (value: string) => validatePassword(value),
      };

      const data = {
        email: 'user@example.com',
        password: 'StrongP@ssw0rd!',
      };

      const result = validateForm(data, validators);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should collect all validation errors', () => {
      const validators = {
        email: (value: string) => validateEmail(value),
        password: (value: string) => validatePassword(value),
      };

      const data = {
        email: 'invalid-email',
        password: '123',
      };

      const result = validateForm(data, validators);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('password');
    });
  });
});
