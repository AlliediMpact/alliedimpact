import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

// Rate limit config
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute

export function cleanupExpiredEntries() {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}

export async function checkRateLimit(
  request: NextRequest,
  identifier: string
): Promise<{ allowed: boolean; limit: number; remaining: number; resetTime: number }> {
  const now = Date.now();
  const key = `crypto_${identifier}`;

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  // Get or initialize rate limit data
  let rateLimitData = rateLimitStore[key];

  if (!rateLimitData || rateLimitData.resetTime < now) {
    // Create new window
    rateLimitData = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore[key] = rateLimitData;
  }

  // Increment request count
  rateLimitData.count++;

  const allowed = rateLimitData.count <= MAX_REQUESTS_PER_WINDOW;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - rateLimitData.count);

  return {
    allowed,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining,
    resetTime: rateLimitData.resetTime,
  };
}

export function rateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return NextResponse.json(
    { 
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetTime.toString(),
      },
    }
  );
}
