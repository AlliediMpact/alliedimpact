import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/verify',
    '/auth/forgot-password',
    '/verify',
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for authentication token (Firebase Auth sets this)
  // In a real app, you'd verify the Firebase ID token
  // For now, we check if user has a session cookie or token
  const token = request.cookies.get('session')?.value;
  const authHeader = request.headers.get('authorization');

  // If no token found, redirect to login
  if (!token && !authHeader) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protected dashboard routes
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/journey') || 
      pathname.startsWith('/profile') || 
      pathname.startsWith('/schools') ||
      pathname.startsWith('/certificates') ||
      pathname.startsWith('/badges') ||
      pathname.startsWith('/subscribe')) {
    
    // Check if user is authenticated
    // This is a simplified check - in production, verify the token with Firebase Admin SDK
    if (!token && !authHeader) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin routes - require admin role
  if (pathname.startsWith('/admin')) {
    // TODO: Check if user has admin role
    // const isAdmin = await checkUserRole(token, 'admin');
    // if (!isAdmin) {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }
  }

  // School dashboard routes - require school owner role
  if (pathname.startsWith('/school/dashboard')) {
    // TODO: Check if user has school owner role
    // const isSchoolOwner = await checkUserRole(token, 'school_owner');
    // if (!isSchoolOwner) {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }
  }

  return NextResponse.next();
}

// Configure which routes use middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
