/**
 * Next.js Middleware
 * Runs on Edge Runtime for security, rate limiting, and CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in-memory for Edge Runtime)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// CSRF token store
const csrfTokens = new Map<string, number>();

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  api: { requests: 100, windowMs: 60000 }, // 100 requests per minute
  auth: { requests: 5, windowMs: 300000 }, // 5 requests per 5 minutes
  default: { requests: 200, windowMs: 60000 }, // 200 requests per minute
};

/**
 * Get client identifier (IP address or user ID)
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from headers (Vercel, Cloudflare)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  return forwardedFor?.split(',')[0] || realIp || 'unknown';
}

/**
 * Check rate limit
 */
function checkRateLimit(
  clientId: string,
  endpoint: string,
  limit: { requests: number; windowMs: number }
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${clientId}:${endpoint}`;
  const now = Date.now();
  
  const record = rateLimitStore.get(key);
  
  // Reset if window expired
  if (!record || now > record.resetAt) {
    const resetAt = now + limit.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit.requests - 1, resetAt };
  }
  
  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  
  // Check if exceeded
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
  
  // Clean up expired token
  if (!isValid) {
    csrfTokens.delete(token);
  }
  
  return isValid;
}

/**
 * Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientId = getClientId(request);
  
  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }
  
  // CSRF Protection for POST/PUT/DELETE requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token') || request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || !validateCsrfToken(csrfToken)) {
      // Allow requests without CSRF for specific endpoints (like auth)
      if (!pathname.startsWith('/api/auth')) {
        return new NextResponse('Invalid CSRF token', { status: 403 });
      }
    }
  }
  
  // Rate Limiting
  let limit = RATE_LIMITS.default;
  
  if (pathname.startsWith('/api/auth') || pathname.includes('login') || pathname.includes('signup')) {
    limit = RATE_LIMITS.auth;
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
  
  // Add rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.requests.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toString());
  
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
