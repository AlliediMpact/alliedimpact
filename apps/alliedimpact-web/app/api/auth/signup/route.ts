import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitResponse } from '@allied-impact/shared';

/**
 * Signup rate limiting endpoint
 * Checks rate limit before allowing account creation
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Rate limiting: 3 signups per hour per IP
    const rateLimitResult = await checkRateLimit('signup', ip);
    
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult);
    }

    // Rate limit passed
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
