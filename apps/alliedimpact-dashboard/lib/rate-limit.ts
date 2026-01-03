/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter for API endpoints.
 * In production, use Redis or similar distributed cache.
 */

import { NextRequest } from 'next/server';

interface RateLimitStore {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitStore>();

/**
 * Check rate limit for a request
 * 
 * @param request - Next.js request object
 * @param identifier - Unique identifier (e.g., 'subscription', 'login')
 * @param maxAttempts - Maximum attempts allowed
 * @param windowSeconds - Time window in seconds
 * @returns { success: boolean, remaining: number, resetAt: number }
 */
export async function rateLimit(
  request: NextRequest,
  identifier: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  try {
    // Get client identifier (IP address or user ID)
    const clientId = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${identifier}:${clientId}`;

    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    // Get or create rate limit entry
    let entry = store.get(key);

    // Reset if window expired
    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + windowMs
      };
      store.set(key, entry);
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxAttempts) {
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt
      };
    }

    return {
      success: true,
      remaining: maxAttempts - entry.count,
      resetAt: entry.resetAt
    };

  } catch (error) {
    // On error, allow the request
    return {
      success: true,
      remaining: 0,
      resetAt: Date.now()
    };
  }
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

// Clean up every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
