import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie } from '@allied-impact/auth/admin';
import { createLogger } from '@allied-impact/shared';

const logger = createLogger('dashboard:middleware');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/api/health'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    // No session - redirect to homepage login
    const homepageUrl = process.env.NEXT_PUBLIC_HOMEPAGE_URL || 'http://localhost:3000';
    const loginUrl = new URL('/login', homepageUrl);
    loginUrl.searchParams.set('returnUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify session cookie
    const decodedClaims = await verifySessionCookie(sessionCookie);
    
    // Add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', decodedClaims.uid);
    response.headers.set('x-user-email', decodedClaims.email || '');
    
    // Check for admin role
    if (decodedClaims.role) {
      response.headers.set('x-user-role', decodedClaims.role as string);
    }

    return response;
  } catch (error) {
    logger.error('Session verification failed', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      path: pathname 
    });
    
    // Invalid session - clear cookie and redirect to login
    const homepageUrl = process.env.NEXT_PUBLIC_HOMEPAGE_URL || 'http://localhost:3000';
    const loginUrl = new URL('/login', homepageUrl);
    loginUrl.searchParams.set('returnUrl', request.url);
    
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
