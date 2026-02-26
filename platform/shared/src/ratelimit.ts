/**
 * @allied-impact/shared - Rate Limiting
 * 
 * Serverless-friendly rate limiting using Upstash Redis
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createLogger } from './logger';

const logger = createLogger('ratelimit');

// Initialize Redis client (will be configured with env vars)
let redis: Redis | null = null;

export interface RateLimitConfig {
  upstashUrl: string;
  upstashToken: string;
}

export function initializeRateLimit(config?: RateLimitConfig): void {
  // Auto-initialize from environment variables if config not provided
  const upstashUrl = config?.upstashUrl || process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = config?.upstashToken || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!upstashUrl || !upstashToken) {
    logger.warn('Rate limit not configured - running without rate limiting');
    return;
  }

  redis = new Redis({
    url: upstashUrl,
    token: upstashToken,
  });
  logger.info('Rate limit initialized');
}

/**
 * Rate limiters for different endpoints
 */
export const rateLimiters = {
  /**
   * Login attempts: 5 attempts per 15 minutes
   */
  login: () => {
    if (!redis) throw new Error('Rate limit not initialized');
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      analytics: true,
      prefix: 'ratelimit:login',
    });
  },

  /**
   * Signup attempts: 3 accounts per hour per IP
   */
  signup: () => {
    if (!redis) throw new Error('Rate limit not initialized');
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'ratelimit:signup',
    });
  },

  /**
   * Session creation: 10 per 5 minutes (prevents session flooding)
   */
  session: () => {
    if (!redis) throw new Error('Rate limit not initialized');
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '5 m'),
      analytics: true,
      prefix: 'ratelimit:session',
    });
  },

  /**
   * API routes: 100 requests per minute
   */
  api: () => {
    if (!redis) throw new Error('Rate limit not initialized');
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    });
  },

  /**
   * Payment webhooks: 1000 per hour (high volume expected)
   */
  webhook: () => {
    if (!redis) throw new Error('Rate limit not initialized');
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1000, '1 h'),
      analytics: true,
      prefix: 'ratelimit:webhook',
    });
  },

  /**
   * Password reset: 3 attempts per hour
   */
  passwordReset: () => {
    if (!redis) throw new Error('Rate limit not initialized');
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: 'ratelimit:password-reset',
    });
  },
};

/**
 * Check rate limit for a given identifier
 * Returns { success: boolean, limit: number, remaining: number, reset: Date }
 */
export async function checkRateLimit(
  identifier: string,
  limiterType: keyof typeof rateLimiters
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  try {
    // Initialize if not already done
    if (!redis) {
      initializeRateLimit();
    }

    // If still no redis, fail open (allow request)
    if (!redis) {
      return {
        success: true,
        limit: 0,
        remaining: 0,
        reset: new Date(),
      };
    }

    const limiter = rateLimiters[limiterType]();
    const result = await limiter.limit(identifier);

    if (!result.success) {
      logger.warn('Rate limit exceeded', {
        limiterType,
        identifier,
        limit: result.limit,
        remaining: result.remaining,
      });
    }

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset),
    };
  } catch (error) {
    logger.error('Rate limit check failed', error as Error, {
      limiterType,
      identifier,
    });
    // Fail open - allow request if rate limit service is down
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
    };
  }
}

/**
 * Helper for Next.js API routes - returns appropriate error response
 */
export function rateLimitResponse(result: { success: boolean; limit: number; remaining: number; reset: Date }) {
  return Response.json(
    {
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again after ${result.reset.toISOString()}`,
      limit: result.limit,
      remaining: result.remaining,
      resetAt: result.reset.toISOString(),
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.getTime().toString(),
        'Retry-After': Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString(),
      },
    }
  );
}
