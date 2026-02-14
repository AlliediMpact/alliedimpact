/**
 * @alliedimpact/security - Middleware Module
 * 
 * Reusable security middleware for Next.js Edge Runtime.
 * Includes: CSRF protection, rate limiting (per-IP and per-user), security headers.
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory stores for Edge Runtime
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const userRateLimitStore = new Map<string, { count: number; resetAt: number }>();
const csrfTokens = new Map<string, number>();

/**
 * Configuration interface
 */
export interface SecurityMiddlewareConfig {
  rateLimits?: {
    api?: { requests: number; windowMs: number };
    auth?: { requests: number; windowMs: number };
    default?: { requests: number; windowMs: number };
  };
  userRateLimits?: {
    api?: { requests: number; windowMs: number };
    trading?: { requests: number; windowMs: number };
  };
  csrfProtection?: boolean;
  csrfExemptPaths?: string[];
  securityHeaders?: boolean;
  customHeaders?: Record<string, string>;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: SecurityMiddlewareConfig = {
  rateLimits: {
    api: { requests: 100, windowMs: 60000 },
    auth: { requests: 5, windowMs: 300000 },
    default: { requests: 200, windowMs: 60000 },
  },
  userRateLimits: {
    api: { requests: 500, windowMs: 60000 },
    trading: { requests: 100, windowMs: 60000 },
  },
  csrfProtection: true,
  csrfExemptPaths: ['/api/auth', '/api/webhooks'],
  securityHeaders: true,
  customHeaders: {},
};

/**
 * Get client identifier (IP address)
 */
export function getClientId(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwardedFor?.split(',')[0] || realIp || 'unknown';
}

/**
 * Get user ID from session cookie
 */
export function getUserId(request: NextRequest): string | null {
  const sessionCookie = request.cookies.get('__session');
  return sessionCookie?.value || null;
}

/**
 * Check endpoint-based rate limit
 */
export function checkRateLimit(
  clientId: string,
  endpoint: string,
  limit: { requests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${clientId}:${endpoint}`;
  const now = Date.now();
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    const resetAt = now + limit.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit.requests - 1, resetAt };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  
  const allowed = record.count <= limit.requests;
  const remaining = Math.max(0, limit.requests - record.count);
  
  return { allowed, remaining, resetAt: record.resetAt };
}

/**
 * Check user-based rate limit
 */
export function checkUserRateLimit(
  userId: string,
  category: string,
  limit: { requests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `user:${userId}:${category}`;
  const now = Date.now();
  
  const record = userRateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    const resetAt = now + limit.windowMs;
    userRateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit.requests - 1, resetAt };
  }
  
  record.count++;
  userRateLimitStore.set(key, record);
  
  const allowed = record.count <= limit.requests;
  const remaining = Math.max(0, limit.requests - record.count);
  
  return { allowed, remaining, resetAt: record.resetAt };
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  const timestamp = csrfTokens.get(token);
  if (!timestamp) return false;
  
  const isValid = Date.now() - timestamp < 3600000; // 1 hour
  
  if (!isValid) {
    csrfTokens.delete(token);
  }
  
  return isValid;
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  customHeaders?: Record<string, string>
): NextResponse {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  if (customHeaders) {
    Object.entries(customHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  
  return response;
}

/**
 * Create security middleware
 */
export function createSecurityMiddleware(userConfig: SecurityMiddlewareConfig = {}) {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  
  return async function securityMiddleware(request: NextRequest): Promise<NextResponse> {
    const { pathname } = request.nextUrl;
    const clientId = getClientId(request);
    const userId = getUserId(request);
    
    // Skip for static files
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
    ) {
      return NextResponse.next();
    }
    
    // CSRF Protection
    if (config.csrfProtection && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token') || request.cookies.get('csrf-token')?.value;
      const isExempt = config.csrfExemptPaths?.some((path) => pathname.startsWith(path));
      
      if (!isExempt && (!csrfToken || !validateCsrfToken(csrfToken))) {
        return new NextResponse('Invalid CSRF token', { status: 403 });
      }
    }
    
    // Endpoint-based rate limiting
    let limit = config.rateLimits?.default || { requests: 200, windowMs: 60000 };
    
    if (pathname.includes('/api/auth') || pathname.includes('login') || pathname.includes('signup')) {
      limit = config.rateLimits?.auth || { requests: 5, windowMs: 300000 };
    } else if (pathname.startsWith('/api')) {
      limit = config.rateLimits?.api || { requests: 100, windowMs: 60000 };
    }
    
    const rateLimit = checkRateLimit(clientId, pathname, limit);
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.requests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
        },
      });
    }
    
    // User-based rate limiting (if authenticated)
    if (userId && config.userRateLimits) {
      let userLimit;
      let category = 'api';
      
      if (pathname.startsWith('/api/trading') || pathname.startsWith('/api/escrow')) {
        userLimit = config.userRateLimits.trading;
        category = 'trading';
      } else if (pathname.startsWith('/api')) {
        userLimit = config.userRateLimits.api;
        category = 'api';
      }
      
      if (userLimit) {
        const userRateLimit = checkUserRateLimit(userId, category, userLimit);
        
        if (!userRateLimit.allowed) {
          const retryAfter = Math.ceil((userRateLimit.resetAt - Date.now()) / 1000);
          return new NextResponse('User Rate Limit Exceeded', {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-User-RateLimit-Limit': userLimit.requests.toString(),
              'X-User-RateLimit-Remaining': '0',
              'X-User-RateLimit-Reset': userRateLimit.resetAt.toString(),
            },
          });
        }
      }
    }
    
    // Create response
    const response = NextResponse.next();
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limit.requests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toString());
    
    // Apply security headers
    if (config.securityHeaders) {
      applySecurityHeaders(response, config.customHeaders);
    }
    
    // Generate CSRF token for GET requests
    if (config.csrfProtection && request.method === 'GET' && !request.cookies.get('csrf-token')) {
      const csrfToken = generateCsrfToken();
      csrfTokens.set(csrfToken, Date.now());
      response.cookies.set('csrf-token', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600,
      });
    }
    
    return response;
  };
}

/**
 * Matcher config for middleware
 */
export const securityMiddlewareMatcher = [
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
];

/**
 * Export individual functions for custom implementations
 */
export {
  rateLimitStore,
  userRateLimitStore,
  csrfTokens,
};
