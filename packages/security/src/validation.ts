/**
 * @alliedimpact/security - Request Validation Module
 * 
 * Centralized input sanitization and validation for all Allied iMpact apps.
 * Prevents XSS, SQL injection, and other input-based attacks.
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  // Email validation
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  
  // Password validation (min 8 chars, uppercase, lowercase, number, special char)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[@$!%*?&]/, 'Password must contain special character'),
  
  // Username (alphanumeric + underscore/hyphen, 3-20 chars)
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  // Phone number (South African format)
  phoneZA: z.string()
    .regex(/^(\+27|0)[0-9]{9}$/, 'Invalid South African phone number'),
  
  // Name (letters, spaces, hyphens, apostrophes)
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  // URL validation
  url: z.string().url('Invalid URL'),
  
  // UUID validation
  uuid: z.string().uuid('Invalid UUID'),
  
  // Positive integer
  positiveInt: z.number().int().positive('Must be a positive integer'),
  
  // Amount (currency, 2 decimal places)
  amount: z.number()
    .nonnegative('Amount must be non-negative')
    .refine((val) => Number.isFinite(val) && val >= 0, 'Invalid amount')
    .transform((val) => Math.round(val * 100) / 100), // Round to 2 decimals
  
  // ID Number (South African, 13 digits)
  idNumberZA: z.string()
    .length(13, 'ID number must be exactly 13 digits')
    .regex(/^[0-9]{13}$/, 'ID number must contain only digits')
    .refine((val) => {
      // Basic Luhn check for SA ID numbers
      const digits = val.split('').map(Number);
      const checksum = digits.reduce((acc, digit, i) => {
        let value = digit;
        if (i % 2 === 1) value *= 2;
        if (value > 9) value -= 9;
        return acc + value;
      }, 0);
      return checksum % 10 === 0;
    }, 'Invalid ID number checksum'),
  
  // Text with XSS prevention (no <script>, no HTML tags)
  safeText: z.string()
    .max(1000, 'Text must be at most 1000 characters')
    .transform((val) => sanitizeText(val))
    .refine((val) => !containsHTML(val), 'HTML tags are not allowed'),
  
  // Short text (titles, names)
  shortText: z.string()
    .min(1, 'Field is required')
    .max(100, 'Text must be at most 100 characters')
    .transform((val) => sanitizeText(val)),
  
  // Long text (descriptions, comments)
  longText: z.string()
    .min(1, 'Field is required')
    .max(5000, 'Text must be at most 5000 characters')
    .transform((val) => sanitizeText(val)),
  
  // Pagination
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
  
  // Date validation
  futureDate: z.date().refine((date) => date > new Date(), 'Date must be in the future'),
  pastDate: z.date().refine((date) => date < new Date(), 'Date must be in the past'),
};

/**
 * Sanitize text input (remove dangerous characters)
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    // Trim whitespace
    .trim();
}

/**
 * Check if string contains HTML tags
 */
export function containsHTML(input: string): boolean {
  const htmlPattern = /<\s*[a-z][^>]*>/i;
  return htmlPattern.test(input);
}

/**
 * Sanitize HTML (strip all tags)
 */
export function stripHTML(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(input: string): string {
  if (!input) return '';
  
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => escapeMap[char]);
}

/**
 * Sanitize SQL input (escape single quotes)
 */
export function sanitizeSQL(input: string): string {
  if (!input) return '';
  return input.replace(/'/g, "''");
}

/**
 * Validate and sanitize file upload
 */
export interface FileValidationOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSizeMB = 10,
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
  } = options;
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  
  // Check MIME type
  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: `File extension ${extension} is not allowed` };
  }
  
  return { valid: true };
}

/**
 * Sanitize filename (remove path traversal attacks)
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed';
  
  return filename
    // Remove path separators
    .replace(/[/\\]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Remove dangerous characters
    .replace(/[<>:"|?*]/g, '')
    // Trim dots and spaces
    .replace(/^[.\s]+|[.\s]+$/g, '')
    // Limit length
    .substring(0, 255);
}

/**
 * Validate JSON Web Token format (without verification)
 */
export function isValidJWTFormat(token: string): boolean {
  const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  return jwtPattern.test(token);
}

/**
 * Validate IP address
 */
export function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(ip)) {
    const parts = ip.split('.').map(Number);
    return parts.every((part) => part >= 0 && part <= 255);
  }
  
  // IPv6
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv6Pattern.test(ip);
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  // This is a placeholder - actual implementation would use Redis or similar
  // For edge runtime, use in-memory Map as in middleware
  return { allowed: true, remaining: limit };
}

/**
 * Validate cryptocurrency address
 */
export function isValidCryptoAddress(address: string, currency: 'BTC' | 'ETH'): boolean {
  if (currency === 'BTC') {
    // Bitcoin address (P2PKH, P2SH, Bech32)
    const btcPattern = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/;
    return btcPattern.test(address);
  }
  
  if (currency === 'ETH') {
    // Ethereum address (0x + 40 hex chars)
    const ethPattern = /^0x[a-fA-F0-9]{40}$/;
    return ethPattern.test(address);
  }
  
  return false;
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export function isValidCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Export all schemas for external use
 */
export { z };

/**
 * Validation error handler
 */
export function handleValidationError(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return errors;
}

/**
 * Create API response with validation errors
 */
export function validationErrorResponse(error: z.ZodError) {
  return {
    error: 'Validation failed',
    details: handleValidationError(error),
    code: 'VALIDATION_ERROR',
    status: 400,
  };
}
