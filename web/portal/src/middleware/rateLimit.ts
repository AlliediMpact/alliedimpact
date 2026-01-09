/**
 * Rate Limiting Middleware
 * Protects API routes from abuse with request throttling
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request should be rate limited
   */
  async check(identifier: string): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const record = requestCounts.get(identifier);

    // No record or window expired
    if (!record || now > record.resetTime) {
      const resetTime = now + this.config.windowMs;
      requestCounts.set(identifier, { count: 1, resetTime });
      return { limited: false, remaining: this.config.maxRequests - 1, resetTime };
    }

    // Increment count
    record.count++;

    // Check if limit exceeded
    if (record.count > this.config.maxRequests) {
      return { limited: true, remaining: 0, resetTime: record.resetTime };
    }

    return {
      limited: false,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Clean up expired records (call periodically)
   */
  cleanup() {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
  }
}

/**
 * Create rate limit middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  // Cleanup every 5 minutes
  if (typeof setInterval !== 'undefined') {
    setInterval(() => limiter.cleanup(), 5 * 60 * 1000);
  }

  return async function rateLimitMiddleware(
    request: NextRequest,
    identifier?: string
  ): Promise<NextResponse | null> {
    // Get identifier (IP address or custom identifier)
    const id = identifier || request.ip || request.headers.get('x-forwarded-for') || 'anonymous';

    const result = await limiter.check(id);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (result.limited) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      headers.set('Retry-After', retryAfter.toString());

      return NextResponse.json(
        {
          error: config.message || 'Too many requests. Please try again later.',
          retryAfter,
        },
        { status: 429, headers }
      );
    }

    return null; // Allow request to proceed
  };
}

// Preset configurations
export const rateLimitPresets = {
  // Strict: 10 requests per minute
  strict: { windowMs: 60 * 1000, maxRequests: 10 },

  // Standard: 30 requests per minute
  standard: { windowMs: 60 * 1000, maxRequests: 30 },

  // Relaxed: 100 requests per minute
  relaxed: { windowMs: 60 * 1000, maxRequests: 100 },

  // Auth endpoints: 5 attempts per 15 minutes
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },

  // API endpoints: 60 requests per minute
  api: { windowMs: 60 * 1000, maxRequests: 60 },
};

/**
 * Redis-based rate limiter (for production)
 * Requires Redis client connection
 */
export class RedisRateLimiter {
  private config: RateLimitConfig;
  // private redis: RedisClient; // Add Redis client

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Initialize Redis connection
  }

  async check(identifier: string): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
    // TODO: Implement Redis-based rate limiting
    // Use INCR and EXPIRE commands
    // More scalable for production with multiple instances
    throw new Error('Redis rate limiter not implemented');
  }
}

// Export default rate limiters
export const authRateLimiter = createRateLimitMiddleware(rateLimitPresets.auth);
export const apiRateLimiter = createRateLimitMiddleware(rateLimitPresets.api);
export const strictRateLimiter = createRateLimitMiddleware(rateLimitPresets.strict);
