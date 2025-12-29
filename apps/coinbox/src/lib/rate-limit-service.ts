/**
 * Rate Limiting Service
 * Implements token bucket algorithm for API rate limiting
 */

import { db } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { ApiKey } from './api-auth-service';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Seconds
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitBucket {
  apiKeyId: string;
  window: 'minute' | 'hour' | 'day';
  tokens: number;
  maxTokens: number;
  lastRefill: Timestamp;
  windowStart: Timestamp;
}

/**
 * Check rate limit for an API key
 */
export async function checkRateLimit(
  apiKey: ApiKey,
  endpoint?: string
): Promise<RateLimitResult> {
  const now = Date.now();

  // Check minute limit
  const minuteResult = await checkWindow(
    apiKey,
    'minute',
    apiKey.rateLimit.requestsPerMinute,
    60 * 1000,
    now
  );

  if (!minuteResult.allowed) {
    return minuteResult;
  }

  // Check hour limit
  const hourResult = await checkWindow(
    apiKey,
    'hour',
    apiKey.rateLimit.requestsPerHour,
    60 * 60 * 1000,
    now
  );

  if (!hourResult.allowed) {
    return hourResult;
  }

  // Check day limit
  const dayResult = await checkWindow(
    apiKey,
    'day',
    apiKey.rateLimit.requestsPerDay,
    24 * 60 * 60 * 1000,
    now
  );

  return dayResult;
}

/**
 * Check rate limit for a specific time window
 */
async function checkWindow(
  apiKey: ApiKey,
  window: 'minute' | 'hour' | 'day',
  maxRequests: number,
  windowMs: number,
  now: number
): Promise<RateLimitResult> {
  const bucketId = `${apiKey.id}_${window}`;
  const bucketRef = db.collection('rateLimitBuckets').doc(bucketId);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const bucketDoc = await transaction.get(bucketRef);
      const nowTimestamp = Timestamp.fromMillis(now);
      const windowStart = Timestamp.fromMillis(now - windowMs);

      let bucket: RateLimitBucket;

      if (!bucketDoc.exists) {
        // Create new bucket
        bucket = {
          apiKeyId: apiKey.id,
          window,
          tokens: maxRequests - 1,
          maxTokens: maxRequests,
          lastRefill: nowTimestamp,
          windowStart: nowTimestamp,
        };
        transaction.set(bucketRef, bucket);

        return {
          allowed: true,
          limit: maxRequests,
          remaining: bucket.tokens,
          reset: now + windowMs,
        };
      }

      bucket = bucketDoc.data() as RateLimitBucket;

      // Check if window has expired
      if (bucket.windowStart.toMillis() < windowStart.toMillis()) {
        // Reset bucket for new window
        bucket.tokens = maxRequests - 1;
        bucket.windowStart = nowTimestamp;
        bucket.lastRefill = nowTimestamp;

        transaction.update(bucketRef, {
          tokens: bucket.tokens,
          windowStart: bucket.windowStart,
          lastRefill: bucket.lastRefill,
        });

        return {
          allowed: true,
          limit: maxRequests,
          remaining: bucket.tokens,
          reset: now + windowMs,
        };
      }

      // Check if tokens available
      if (bucket.tokens > 0) {
        bucket.tokens -= 1;
        bucket.lastRefill = nowTimestamp;

        transaction.update(bucketRef, {
          tokens: bucket.tokens,
          lastRefill: bucket.lastRefill,
        });

        return {
          allowed: true,
          limit: maxRequests,
          remaining: bucket.tokens,
          reset: bucket.windowStart.toMillis() + windowMs,
        };
      }

      // Rate limit exceeded
      const reset = bucket.windowStart.toMillis() + windowMs;
      const retryAfter = Math.ceil((reset - now) / 1000);

      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        reset,
        retryAfter,
      };
    });

    return result;
  } catch (error: any) {
    console.error('Rate limit check error:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests,
      reset: now + windowMs,
    };
  }
}

/**
 * Record API request for analytics
 */
export async function logApiRequest(
  apiKey: ApiKey,
  request: {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    ip?: string;
    userAgent?: string;
  }
): Promise<void> {
  await db.collection('apiRequestLogs').add({
    apiKeyId: apiKey.id,
    userId: apiKey.userId,
    tier: apiKey.tier,
    endpoint: request.endpoint,
    method: request.method,
    statusCode: request.statusCode,
    responseTime: request.responseTime,
    ip: request.ip,
    userAgent: request.userAgent,
    timestamp: Timestamp.now(),
  });
}

/**
 * Get rate limit stats for an API key
 */
export async function getRateLimitStats(
  apiKeyId: string
): Promise<{
  minute: { used: number; limit: number; remaining: number };
  hour: { used: number; limit: number; remaining: number };
  day: { used: number; limit: number; remaining: number };
}> {
  const [minuteBucket, hourBucket, dayBucket] = await Promise.all([
    db.collection('rateLimitBuckets').doc(`${apiKeyId}_minute`).get(),
    db.collection('rateLimitBuckets').doc(`${apiKeyId}_hour`).get(),
    db.collection('rateLimitBuckets').doc(`${apiKeyId}_day`).get(),
  ]);

  const getStats = (doc: any) => {
    if (!doc.exists) {
      return { used: 0, limit: 0, remaining: 0 };
    }
    const data = doc.data() as RateLimitBucket;
    return {
      used: data.maxTokens - data.tokens,
      limit: data.maxTokens,
      remaining: data.tokens,
    };
  };

  return {
    minute: getStats(minuteBucket),
    hour: getStats(hourBucket),
    day: getStats(dayBucket),
  };
}

/**
 * Reset rate limits for an API key (admin function)
 */
export async function resetRateLimit(apiKeyId: string): Promise<void> {
  const batch = db.batch();

  ['minute', 'hour', 'day'].forEach(window => {
    const bucketRef = db.collection('rateLimitBuckets').doc(`${apiKeyId}_${window}`);
    batch.delete(bucketRef);
  });

  await batch.commit();
}

/**
 * Get API usage analytics
 */
export async function getApiUsageAnalytics(
  apiKeyId: string,
  timeRange: { start: Date; end: Date }
): Promise<{
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByEndpoint: Record<string, number>;
  requestsByStatus: Record<number, number>;
}> {
  const snapshot = await db
    .collection('apiRequestLogs')
    .where('apiKeyId', '==', apiKeyId)
    .where('timestamp', '>=', Timestamp.fromDate(timeRange.start))
    .where('timestamp', '<=', Timestamp.fromDate(timeRange.end))
    .get();

  let totalRequests = 0;
  let successfulRequests = 0;
  let failedRequests = 0;
  let totalResponseTime = 0;
  const requestsByEndpoint: Record<string, number> = {};
  const requestsByStatus: Record<number, number> = {};

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    totalRequests++;

    if (data.statusCode >= 200 && data.statusCode < 300) {
      successfulRequests++;
    } else {
      failedRequests++;
    }

    totalResponseTime += data.responseTime;

    requestsByEndpoint[data.endpoint] = (requestsByEndpoint[data.endpoint] || 0) + 1;
    requestsByStatus[data.statusCode] = (requestsByStatus[data.statusCode] || 0) + 1;
  });

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
    requestsByEndpoint,
    requestsByStatus,
  };
}

/**
 * Cleanup old rate limit buckets (cron job)
 */
export async function cleanupRateLimitBuckets(): Promise<number> {
  const oneDayAgo = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);

  const snapshot = await db
    .collection('rateLimitBuckets')
    .where('lastRefill', '<', oneDayAgo)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return snapshot.size;
}

/**
 * Cleanup old API request logs (cron job)
 */
export async function cleanupApiRequestLogs(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = Timestamp.fromMillis(
    Date.now() - daysToKeep * 24 * 60 * 60 * 1000
  );

  const snapshot = await db
    .collection('apiRequestLogs')
    .where('timestamp', '<', cutoffDate)
    .limit(500) // Process in batches
    .get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return snapshot.size;
}
