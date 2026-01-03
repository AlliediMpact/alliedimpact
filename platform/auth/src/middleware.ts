/**
 * @allied-impact/auth - Middleware Module
 * 
 * Next.js middleware helpers for authentication and authorization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from './admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: DecodedIdToken;
}

export const SESSION_COOKIE_NAME = '__session';

export interface SessionCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  domain?: string;
  maxAge?: number;
  path?: string;
}

/**
 * Get session cookie options for cross-subdomain support
 */
export function getSessionCookieOptions(maxAge?: number): SessionCookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    domain: isProduction ? '.alliedimpact.com' : undefined,
    maxAge: maxAge || 60 * 60 * 24 * 7, // 7 days in seconds
    path: '/',
  };
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(
  response: NextResponse,
  sessionCookie: string,
  options?: SessionCookieOptions
): NextResponse {
  const cookieOptions = options || getSessionCookieOptions();
  
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionCookie,
    ...cookieOptions,
  });
  
  return response;
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

/**
 * Get session cookie from request
 */
export function getSessionCookieFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Middleware to verify authentication
 * Returns decoded token if valid, null if not
 */
export async function verifyAuth(request: NextRequest): Promise<DecodedIdToken | null> {
  const sessionCookie = getSessionCookieFromRequest(request);
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const decodedToken = await verifySessionCookie(sessionCookie);
    return decodedToken;
  } catch (error) {
    console.error('[Auth Middleware] Invalid session cookie:', error);
    return null;
  }
}

/**
 * Require authentication middleware
 * Redirects to login if not authenticated
 */
export async function requireAuth(
  request: NextRequest,
  loginUrl: string = '/login'
): Promise<DecodedIdToken | NextResponse> {
  const decodedToken = await verifyAuth(request);
  
  if (!decodedToken) {
    const url = new URL(loginUrl, request.url);
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  
  return decodedToken;
}

/**
 * Require role middleware
 * Checks if user has required role in custom claims
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[],
  forbiddenUrl: string = '/403'
): Promise<DecodedIdToken | NextResponse> {
  const decodedToken = await verifyAuth(request);
  
  if (!decodedToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const userRole = decodedToken.role as string | undefined;
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.redirect(new URL(forbiddenUrl, request.url));
  }
  
  return decodedToken;
}

/**
 * Optional auth middleware
 * Attaches user to request if authenticated, but doesn't redirect
 */
export async function optionalAuth(request: NextRequest): Promise<DecodedIdToken | null> {
  return verifyAuth(request);
}

/**
 * Helper to extract Authorization header token
 */
export function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * API route auth helper
 * Returns 401 if not authenticated
 */
export async function authenticateApiRoute(
  request: NextRequest
): Promise<{ user: DecodedIdToken } | NextResponse> {
  // Try session cookie first
  let decodedToken = await verifyAuth(request);
  
  // Fall back to Bearer token
  if (!decodedToken) {
    const bearerToken = getBearerToken(request);
    if (bearerToken) {
      try {
        const { verifyIdToken } = await import('./admin');
        decodedToken = await verifyIdToken(bearerToken);
      } catch (error) {
        console.error('[API Auth] Invalid bearer token:', error);
      }
    }
  }
  
  if (!decodedToken) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }
  
  return { user: decodedToken };
}

/**
 * Check if user has specific claim
 */
export function hasClaim(
  user: DecodedIdToken,
  claimName: string,
  expectedValue?: any
): boolean {
  const claimValue = (user as any)[claimName];
  
  if (expectedValue === undefined) {
    return claimValue !== undefined && claimValue !== null;
  }
  
  return claimValue === expectedValue;
}

export default {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  setSessionCookie,
  clearSessionCookie,
  getSessionCookieFromRequest,
  verifyAuth,
  requireAuth,
  requireRole,
  optionalAuth,
  getBearerToken,
  authenticateApiRoute,
  hasClaim,
};
