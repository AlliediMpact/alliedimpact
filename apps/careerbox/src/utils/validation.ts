// Form validation utilities for CareerBox

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

// Phone validation (South African format)
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // South African phone numbers: 10 digits starting with 0, or with +27
  const saPhoneRegex = /^(0[0-9]{9}|(\+27|27)[0-9]{9})$/;
  
  if (!saPhoneRegex.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid South African phone number' };
  }

  return { isValid: true };
}

// Password validation
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string;
  isValid: boolean;
}

export function validatePassword(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, feedback: 'Password is required', isValid: false };
  }

  if (password.length < 8) {
    return { score: 0, feedback: 'Password must be at least 8 characters', isValid: false };
  }

  let score = 0;
  const checks = {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  // Calculate score
  if (password.length >= 8) score++;
  if (checks.lowercase && checks.uppercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;
  if (checks.length) score++;

  const feedback = [
    'Very weak password',
    'Weak password',
    'Fair password',
    'Strong password',
    'Very strong password',
  ][Math.min(score, 4)];

  return {
    score: Math.min(score, 4),
    feedback,
    isValid: score >= 2, // Require at least "Fair" strength
  };
}

// Confirm password validation
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
}

// Required field validation
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

// Minimum length validation
export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  return { isValid: true };
}

// Maximum length validation
export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationResult {
  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { isValid: true };
}

// URL validation
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: true }; // URL is optional
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

// Number validation
export function validateNumber(value: string, fieldName: string): ValidationResult {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (isNaN(Number(value))) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  return { isValid: true };
}

// Number range validation
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (value < min || value > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }

  return { isValid: true };
}

// Date validation
export function validateDate(date: string, fieldName: string): ValidationResult {
  if (!date) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} must be a valid date` };
  }

  return { isValid: true };
}

// Future date validation
export function validateFutureDate(date: string, fieldName: string): ValidationResult {
  const validation = validateDate(date, fieldName);
  if (!validation.isValid) {
    return validation;
  }

  const dateObj = new Date(date);
  const now = new Date();

  if (dateObj <= now) {
    return { isValid: false, error: `${fieldName} must be in the future` };
  }

  return { isValid: true };
}

// Past date validation
export function validatePastDate(date: string, fieldName: string): ValidationResult {
  const validation = validateDate(date, fieldName);
  if (!validation.isValid) {
    return validation;
  }

  const dateObj = new Date(date);
  const now = new Date();

  if (dateObj >= now) {
    return { isValid: false, error: `${fieldName} must be in the past` };
  }

  return { isValid: true };
}

// File validation
export function validateFile(
  file: File | null,
  options: {
    required?: boolean;
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }
): ValidationResult {
  if (!file) {
    if (options.required) {
      return { isValid: false, error: 'File is required' };
    }
    return { isValid: true };
  }

  if (options.maxSize && file.size > options.maxSize) {
    const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(1);
    return { isValid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }

  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}` };
  }

  return { isValid: true };
}

// Salary range validation
export function validateSalaryRange(min: number, max: number): ValidationResult {
  if (min < 0) {
    return { isValid: false, error: 'Minimum salary must be positive' };
  }

  if (max < min) {
    return { isValid: false, error: 'Maximum salary must be greater than minimum salary' };
  }

  return { isValid: true };
}

// Composite form validation
export function validateForm(
  fields: Record<string, any>,
  validators: Record<string, (value: any) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [fieldName, validator] of Object.entries(validators)) {
    const result = validator(fields[fieldName]);
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
