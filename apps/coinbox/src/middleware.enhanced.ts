/**
 * Enhanced Security Middleware for CoinBox
 * Includes: CSRF Protection, Rate Limiting, Security Headers
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in-memory for Edge Runtime)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// CSRF token store
const csrfTokens = new Map<string, number>();

// User-based rate limiting store
const userRateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  api: { requests: 100, windowMs: 60000 }, // 100 requests per minute
  auth: { requests: 5, windowMs: 300000 }, // 5 requests per 5 minutes
  trading: { requests: 50, windowMs: 60000 }, // 50 requests per minute for trading
  default: { requests: 200, windowMs: 60000 }, // 200 requests per minute
};

/**
 * User-based rate limits (stricter limits per authenticated user)
 */
const USER_RATE_LIMITS = {
  api: { requests: 500, windowMs: 60000 }, // 500 requests per minute per user
  trading: { requests: 100, windowMs: 60000 }, // 100 trading requests per minute per user
};

/**
 * Get client identifier (IP address)
 */
function getClientId(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwardedFor?.split(',')[0] || realIp || 'unknown';
}

/**
 * Get user ID from auth token/session
 */
function getUserId(request: NextRequest): string | null {
  // Try to get from session cookie
  const sessionCookie = request.cookies.get('__session');
  if (sessionCookie) {
    try {
      // Extract user ID from session cookie (you can decode JWT here)
      // For now, return the cookie value as user identifier
      return sessionCookie.value;
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * Check rate limit (endpoint-based)
 */
function checkRateLimit(
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
function checkUserRateLimit(
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
function generateCsrfToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Validate CSRF token
 */
function validateCsrfToken(token: string): boolean {
  const timestamp = csrfTokens.get(token);
  if (!timestamp) return false;
  
  // Token expires after 1 hour
  const isValid = Date.now() - timestamp < 3600000;
  
  if (!isValid) {
    csrfTokens.delete(token);
  }
  
  return isValid;
}

/**
 * Enhanced Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientId = getClientId(request);
  const userId = getUserId(request);
  
  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }
  
  // CSRF Protection for POST/PUT/DELETE/PATCH requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token') || request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || !validateCsrfToken(csrfToken)) {
      // Allow requests without CSRF for specific endpoints
      if (!pathname.startsWith('/api/auth') && !pathname.startsWith('/api/webhooks')) {
        return new NextResponse('Invalid CSRF token', { status: 403 });
      }
    }
  }
  
  // Endpoint-based Rate Limiting
  let limit = RATE_LIMITS.default;
  
  if (pathname.startsWith('/api/auth') || pathname.includes('login') || pathname.includes('signup')) {
    limit = RATE_LIMITS.auth;
  } else if (pathname.startsWith('/api/trading') || pathname.startsWith('/api/escrow')) {
    limit = RATE_LIMITS.trading;
  } else if (pathname.startsWith('/api')) {
    limit = RATE_LIMITS.api;
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
  
  // User-based Rate Limiting (additional check for authenticated users)
  if (userId) {
    let userLimit;
    let category = 'api';
    
    if (pathname.startsWith('/api/trading') || pathname.startsWith('/api/escrow')) {
      userLimit = USER_RATE_LIMITS.trading;
      category = 'trading';
    } else if (pathname.startsWith('/api')) {
      userLimit = USER_RATE_LIMITS.api;
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
  
  // Add headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.requests.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toString());
  
  // Security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Generate and set CSRF token for GET requests
  if (request.method === 'GET' && !request.cookies.get('csrf-token')) {
    const csrfToken = generateCsrfToken();
    csrfTokens.set(csrfToken, Date.now());
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
    });
  }
  
  return response;
}

/**
 * Configure which paths to run middleware on
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
