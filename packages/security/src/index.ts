/**
 * @alliedimpact/security
 * 
 * Shared security utilities for Allied iMpact platform.
 * Provides:
 * - CSRF protection
 * - Rate limiting (per-IP and per-user)
 * - Input validation and sanitization
 * - Security headers
 */

// Export all validation utilities
export * from './validation';

// Export all middleware utilities
export * from './middleware';

/**
 * Package version
 */
export const VERSION = '1.0.0';

/**
 * Security best practices guide
 */
export const SECURITY_BEST_PRACTICES = {
  csrf: 'Always validate CSRF tokens for state-changing operations (POST/PUT/DELETE)',
  rateLimit: 'Implement both per-IP and per-user rate limiting for API endpoints',
  validation: 'Validate and sanitize all user inputs on both client and server side',
  headers: 'Set security headers to prevent XSS, clickjacking, and other attacks',
  auth: 'Use JWT with short expiry times, store in httpOnly cookies',
  passwords: 'Hash with bcrypt (cost factor 12+), enforce strong password policy',
  sensitive: 'Never log sensitive data (passwords, tokens, credit cards, ID numbers)',
  https: 'Always use HTTPS in production, set Strict-Transport-Security header',
  csp: 'Implement Content Security Policy to prevent XSS attacks',
  cors: 'Configure CORS to allow only trusted origins',
};

/**
 * Common attack patterns to defend against
 */
export const ATTACK_PATTERNS = {
  sqlInjection: [
    "' OR '1'='1",
    '" OR "1"="1',
    "'; DROP TABLE users--",
    "' UNION SELECT * FROM users--",
  ],
  xss: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
  ],
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32',
    '%2e%2e%2f%2e%2e%2f',
  ],
  commandInjection: [
    '; ls -la',
    '| cat /etc/passwd',
    '&& whoami',
    '`whoami`',
  ],
};

/**
 * Compliance checklist
 */
export const COMPLIANCE_CHECKLIST = {
  gdpr: [
    'Data minimization',
    'Purpose limitation',
    'Right to access',
    'Right to deletion',
    'Right to portability',
    'Data breach notification',
    'Privacy by design',
  ],
  popia: [
    'Accountability',
    'Processing limitation',
    'Purpose specification',
    'Further processing limitation',
    'Information quality',
    'Openness',
    'Security safeguards',
    'Data subject participation',
  ],
  pci: [
    'Build and maintain secure network',
    'Protect cardholder data',
    'Maintain vulnerability management',
    'Implement strong access control',
    'Monitor and test networks',
    'Maintain information security policy',
  ],
};

/**
 * Security headers recommendations
 */
export const RECOMMENDED_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; '),
};
