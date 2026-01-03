import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@allied-impact/shared';

/**
 * Login rate limiting endpoint
 * Checks rate limit before allowing login attempt
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting: 5 login attempts per 15 minutes per email
    const rateLimitResult = await checkRateLimit('login', email.toLowerCase());
    
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Rate limit passed - return success
    return NextResponse.json({
      success: true,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Rate limit check failed' },
      { status: 500 }
    );
  }
}
