import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always',
});

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
        const protectedRoutes = ['/dashboard', '/api/trading', '/api/tickets'];
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
            console.log('⚠️ Running in dev mode - bypassing auth middleware for:', pathname);
            return intlResponse;
        }

        // Check authentication for protected routes
        const sessionCookie = request.cookies.get('session')?.value || '';

        if (!sessionCookie) {
            return redirectToLogin(request, pathnameLocale || defaultLocale);
        }

        // Verify session through API route
        const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
            headers: {
                Cookie: `session=${sessionCookie}`
            }
        });

        if (!verifyResponse.ok) {
            return redirectToLogin(request, pathnameLocale || defaultLocale);
        }

        return intlResponse;
    } catch (error) {
        console.error('Middleware error:', error);
        const pathname = request.nextUrl.pathname;
        const pathnameLocale = locales.find(
            (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
        );
        return redirectToLogin(request, pathnameLocale || defaultLocale);
    }
}

function redirectToLogin(request: NextRequest, locale: string) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/auth`
    url.search = `redirect=${request.nextUrl.pathname}`
    return NextResponse.redirect(url)
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