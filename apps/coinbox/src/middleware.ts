import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { verifyAuth } from '@allied-impact/auth/middleware';
import { hasProductAccess } from '@allied-impact/entitlements';

// Rate limiting store (in-memory for Edge Runtime)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// CSRF token store (in-memory for Edge Runtime)
const csrfTokens = new Map<string, number>();

// Rate limiting configuration
const RATE_LIMITS = {
  api: { requests: 100, windowMs: 60000 }, // 100 requests per minute
  auth: { requests: 5, windowMs: 300000 }, // 5 requests per 5 minutes
  trading: { requests: 30, windowMs: 60000 }, // 30 requests per minute (financial operations)
  payment: { requests: 10, windowMs: 300000 }, // 10 requests per 5 minutes (payment operations)
  default: { requests: 200, windowMs: 60000 }, // 200 requests per minute
};

// Get client identifier (IP address)
function getClientId(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwardedFor?.split(',')[0] || realIp || 'unknown';
}

// Check rate limit
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

// Generate CSRF token
function generateCsrfToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Validate CSRF token
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

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always',
});

/**
 * Platform-integrated middleware for Coin Box
 * 
 * Flow:
 * 1. Handle internationalization
 * 2. Check if route requires authentication
 * 3. Verify platform session cookie
 * 4. Check entitlement for 'coinbox' product
 * 5. Redirect to Dashboard if no access
 */
export async function middleware(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const clientId = getClientId(request);
        
        // Skip rate limiting for static files
        if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/static') ||
            pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
        ) {
            return intlMiddleware(request);
        }
        
        // CSRF Protection for POST/PUT/DELETE requests (critical for financial operations)
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
            const csrfToken = request.headers.get('x-csrf-token') || request.cookies.get('csrf-token')?.value;
            
            if (!csrfToken || !validateCsrfToken(csrfToken)) {
                // Allow requests without CSRF for specific endpoints (like auth and webhooks)
                if (!pathname.startsWith('/api/auth') && !pathname.startsWith('/api/webhooks')) {
                    return new NextResponse('Invalid CSRF token', { status: 403 });
                }
            }
        }
        
        // Apply rate limiting
        let limit = RATE_LIMITS.default;
        
        if (pathname.includes('/api/auth') || pathname.includes('login') || pathname.includes('signup')) {
            limit = RATE_LIMITS.auth;
        } else if (pathname.includes('/api/trading') || pathname.includes('/api/p2p-crypto')) {
            limit = RATE_LIMITS.trading;
        } else if (pathname.includes('/api/payment') || pathname.includes('/api/checkout')) {
            limit = RATE_LIMITS.payment;
        } else if (pathname.startsWith('/api')) {
            limit = RATE_LIMITS.api;
        }
        
        const rateLimit = checkRateLimit(clientId, pathname, limit);
        
        if (!rateLimit.allowed) {
            const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
            return new NextResponse('Too Many Requests - Rate limit exceeded', {
                status: 429,
                headers: {
                    'Retry-After': retryAfter.toString(),
                    'X-RateLimit-Limit': limit.requests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': rateLimit.resetAt.toString(),
                },
            });
        }
        
        // First, handle internationalization
        const intlResponse = intlMiddleware(request);
        
        // Add rate limit headers
        intlResponse.headers.set('X-RateLimit-Limit', limit.requests.toString());
        intlResponse.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
        intlResponse.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toString());
        
        // Add security headers
        intlResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
        intlResponse.headers.set('X-Content-Type-Options', 'nosniff');
        intlResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        intlResponse.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        // Generate and set CSRF token for GET requests
        if (request.method === 'GET' && !request.cookies.get('csrf-token')) {
            const csrfToken = generateCsrfToken();
            csrfTokens.set(csrfToken, Date.now());
            intlResponse.cookies.set('csrf-token', csrfToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600, // 1 hour
            });
        }
        
        // Extract locale from pathname
        const pathnameLocale = locales.find(
            (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        );

        // Check if this is a protected route (after locale)
        const protectedRoutes = ['/dashboard', '/api/trading', '/api/tickets', '/api/savings'];
        const isProtectedRoute = protectedRoutes.some((route) => {
            if (pathnameLocale) {
                return pathname.startsWith(`/${pathnameLocale}${route}`);
            }
            return pathname.startsWith(route);
        });

        // If not a protected route, just return the intl response
        if (!isProtectedRoute) {
            return intlResponse;
        }

        // Bypass all auth in development mode for protected routes
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (isDevelopment) {
            console.log('⚠️ Running in dev mode - bypassing auth and entitlement checks for:', pathname);
            return intlResponse;
        }

        // Verify authentication using platform auth service
        const decodedToken = await verifyAuth(request);
        
        if (!decodedToken) {
            return redirectToDashboard(request, pathnameLocale || defaultLocale, 'auth-required');
        }

        // Check if user has entitlement to access Coin Box
        const hasAccess = await hasProductAccess(decodedToken.uid, 'coinbox');
        
        if (!hasAccess) {
            return redirectToDashboard(request, pathnameLocale || defaultLocale, 'subscription-required');
        }

        // User is authenticated and has valid entitlement
        return intlResponse;
    } catch (error) {
        console.error('[Coin Box Middleware] Error:', error);
        const pathname = request.nextUrl.pathname;
        const pathnameLocale = locales.find(
            (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        );
        return redirectToDashboard(request, pathnameLocale || defaultLocale, 'error');
    }
}

/**
 * Redirect to Allied iMpact Dashboard with appropriate error message
 */
function redirectToDashboard(request: NextRequest, locale: string, reason: 'auth-required' | 'subscription-required' | 'error') {
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001';
    const url = new URL(`${dashboardUrl}/${locale}`, request.url);
    
    // Add query params for error message display
    url.searchParams.set('error', reason);
    url.searchParams.set('product', 'coinbox');
    url.searchParams.set('redirect', request.nextUrl.pathname);
    
    return NextResponse.redirect(url);
}

/**
 * Legacy redirect (kept for backward compatibility)
 * @deprecated Use redirectToDashboard instead
 */
function redirectToLogin(request: NextRequest, locale: string) {
    return redirectToDashboard(request, locale, 'auth-required');
}

// Specify which routes should be handled by middleware
export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api/auth`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api/auth|_next|_vercel|.*\\..*).*)',
        '/api/escrow/:path*',
    ],
}