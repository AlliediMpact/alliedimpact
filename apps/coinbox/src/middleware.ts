import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

/**
 * Minimal middleware for Coin Box
 * 
 * Responsibilities:
 * 1. Handle internationalization (locale routing)
 * 2. Add security headers
 * 
 * Note: Auth checks are handled at the Next.js server level
 */
export async function middleware(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;

        // Skip middleware for static files and next internals
        if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/static') ||
            pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
        ) {
            return;
        }

        // Create the intl middleware handler
        const intlMiddleware = createIntlMiddleware({
            locales: locales,
            defaultLocale: defaultLocale,
            localePrefix: 'as-needed',
        });

        // Apply internationalization middleware
        const intlResponse = intlMiddleware(request);

        // Add security headers
        intlResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
        intlResponse.headers.set('X-Content-Type-Options', 'nosniff');
        intlResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        intlResponse.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Return the intl middleware response with security headers
        return intlResponse;
    } catch (error) {
        console.error('[Coin Box Middleware] Error:', error);
        // On error, allow the request to continue
        return undefined;
    }
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