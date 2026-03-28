/**
 * Rate Limiting Service
 * Implements token bucket algorithm for API rate limiting
 */

import {
  getFirestore,
  Timestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { ApiKey } from './api-auth-service';

const db = getFirestore();

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
  const bucketRef = doc(db, 'rateLimitBuckets', bucketId);

  try {
    const bucketDoc = await getDoc(bucketRef);
    const nowTimestamp = Timestamp.fromMillis(now);
    const windowStart = Timestamp.fromMillis(now - windowMs);

    let bucket: RateLimitBucket;

    if (!bucketDoc.exists()) {
      // Create new bucket
      bucket = {
        apiKeyId: apiKey.id,
        window,
        tokens: maxRequests - 1,
        maxTokens: maxRequests,
        lastRefill: nowTimestamp,
        windowStart: nowTimestamp,
      };
      await setDoc(bucketRef, bucket);

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

      await updateDoc(bucketRef, {
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

      await updateDoc(bucketRef, {
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
  // Note: In client-side code, we would need to call a function to log this
  // For now, just log to console
  console.log('API Request logged:', { apiKeyId: apiKey.id, ...request });
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
  const [minuteDoc, hourDoc, dayDoc] = await Promise.all([
    getDoc(doc(db, 'rateLimitBuckets', `${apiKeyId}_minute`)),
    getDoc(doc(db, 'rateLimitBuckets', `${apiKeyId}_hour`)),
    getDoc(doc(db, 'rateLimitBuckets', `${apiKeyId}_day`)),
  ]);

  const getStats = (docSnap: any) => {
    if (!docSnap.exists()) {
      return { used: 0, limit: 0, remaining: 0 };
    }
    const data = docSnap.data() as RateLimitBucket;
    return {
      used: data.maxTokens - data.tokens,
      limit: data.maxTokens,
      remaining: data.tokens,
    };
  };

  return {
    minute: getStats(minuteDoc),
    hour: getStats(hourDoc),
    day: getStats(dayDoc),
  };
}

/**
 * Reset rate limits for an API key (admin function)
 */
export async function resetRateLimit(apiKeyId: string): Promise<void> {
  const batch = writeBatch(db);

  (['minute', 'hour', 'day'] as const).forEach(window => {
    const bucketRef = doc(db, 'rateLimitBuckets', `${apiKeyId}_${window}`);
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
  const q = query(
    collection(db, 'apiRequestLogs'),
    where('apiKeyId', '==', apiKeyId),
    where('timestamp', '>=', Timestamp.fromDate(timeRange.start)),
    where('timestamp', '<=', Timestamp.fromDate(timeRange.end))
  );
  
  const snapshot = await getDocs(q);

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
  const q = query(
    collection(db, 'rateLimitBuckets'),
    where('lastRefill', '<', oneDayAgo)
  );

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  if (snapshot.docs.length > 0) {
    await batch.commit();
  }

  return snapshot.size;
}

/**
 * Cleanup old API request logs (cron job)
 */
export async function cleanupApiRequestLogs(daysToKeep: number = 90): Promise<number> {
  const cutoffDate = Timestamp.fromMillis(
    Date.now() - daysToKeep * 24 * 60 * 60 * 1000
  );

  const q = query(
    collection(db, 'apiRequestLogs'),
    where('timestamp', '<', cutoffDate),
    limit(500)
  );

  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  if (snapshot.docs.length > 0) {
    await batch.commit();
  }

  return snapshot.size;
}
