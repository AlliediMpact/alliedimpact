import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { verifyAuth } from '@allied-impact/auth/middleware';
import { hasProductAccess } from '@allied-impact/entitlements';

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
        // First, handle internationalization
        const intlResponse = intlMiddleware(request);
        
        // Extract locale from pathname
        const pathname = request.nextUrl.pathname;
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