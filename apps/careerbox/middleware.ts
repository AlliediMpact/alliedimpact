import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/config';
import { verifyAuth } from '@allied-impact/auth/middleware';
import { hasProductAccess } from '@allied-impact/entitlements';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

/**
 * Protected routes that require authentication
 */
const protectedRoutes = [
  '/dashboard',
];

/**
 * Check if a path requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.includes(route));
}

/**
 * Platform-integrated middleware for CareerBox
 * 
 * Flow:
 * 1. Handle internationalization
 * 2. Check if route requires authentication
 * 3. Verify platform session cookie
 * 4. Check entitlement for 'careerbox' product
 * 5. Redirect to Dashboard if no access
 */
export async function middleware(request: NextRequest) {
  // Handle internationalization first
  const intlResponse = intlMiddleware(request);
  
  const pathname = request.nextUrl.pathname;
  
  // Extract locale from pathname
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If not a protected route, just return the intl response
  if (!isProtectedRoute(pathname)) {
    return intlResponse;
  }

  try {
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

    // Check if user has entitlement to access CareerBox
    const hasAccess = await hasProductAccess(decodedToken.uid, 'careerbox');
    
    if (!hasAccess) {
      return redirectToDashboard(request, pathnameLocale || defaultLocale, 'subscription-required');
    }

    // User is authenticated and has valid entitlement
    return intlResponse;
  } catch (error) {
    console.error('[CareerBox Middleware] Error:', error);
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
  const dashboardUrl = process.env.NODE_ENV === 'production' 
    ? 'https://portal.alliedimpact.com' 
    : 'http://localhost:3005';
  
  const url = new URL(`/${locale}/dashboard`, dashboardUrl);
  url.searchParams.set('error', reason);
  url.searchParams.set('app', 'careerbox');
  
  return NextResponse.redirect(url);
}

// Specify which routes should be handled by middleware
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api/auth`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api/auth|_next|_vercel|.*\\..*).*)',
  ],
};
