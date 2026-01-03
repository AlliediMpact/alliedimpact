import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@allied-impact/auth/admin';
import { checkRateLimit, rateLimitResponse } from '@allied-impact/shared';

/**
 * Create session cookie after Firebase authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 session creations per 5 minutes per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkRateLimit('session', ip);
    
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Create session cookie (expires in 14 days)
    const sessionCookie = await createSessionCookie(idToken, {
      maxAge: 60 * 60 * 24 * 14, // 14 days
    });

    // Set cookie with appropriate options
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', sessionCookie, {
      maxAge: 60 * 60 * 24 * 14,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.alliedimpact.com' : undefined,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * Delete session cookie (logout)
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  return response;
}
