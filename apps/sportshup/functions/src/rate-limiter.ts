/**
 * Rate Limiting System for SportsHub
 * Prevents abuse and spam on critical operations
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  action: string;
}

// Rate limit configurations
export const RATE_LIMITS = {
  // Voting operations
  VOTE_SUBMISSION: {
    maxAttempts: 10,
    windowMs: 60000, // 10 votes per minute
    action: 'vote_submission',
  },
  
  // Wallet operations
  WALLET_TOPUP: {
    maxAttempts: 5,
    windowMs: 3600000, // 5 top-ups per hour
    action: 'wallet_topup',
  },
  
  // Admin operations
  ADMIN_ACTION: {
    maxAttempts: 20,
    windowMs: 60000, // 20 admin actions per minute
    action: 'admin_action',
  },
  
  // Tournament creation
  CREATE_TOURNAMENT: {
    maxAttempts: 5,
    windowMs: 3600000, // 5 tournaments per hour
    action: 'create_tournament',
  },
  
  // Authentication
  AUTH_ATTEMPT: {
    maxAttempts: 5,
    windowMs: 900000, // 5 attempts per 15 minutes
    action: 'auth_attempt',
  },
};

/**
 * Check if user has exceeded rate limit
 * Returns true if allowed, false if rate limit exceeded
 */
export async function checkRateLimit(
  userId: string,
  config: RateLimitConfig
): Promise<boolean> {
  try {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    const limitRef = admin.firestore()
      .collection('rate_limits')
      .doc(`${userId}_${config.action}`);
    
    const doc = await limitRef.get();
    const attempts: number[] = doc.exists ? doc.data()?.attempts || [] : [];
    
    // Filter attempts within the time window
    const recentAttempts = attempts.filter((timestamp: number) => timestamp > windowStart);
    
    // Check if limit exceeded
    if (recentAttempts.length >= config.maxAttempts) {
      functions.logger.warn('Rate limit exceeded', {
        userId,
        action: config.action,
        attempts: recentAttempts.length,
        limit: config.maxAttempts,
      });
      return false;
    }
    
    // Add current attempt
    const updatedAttempts = [...recentAttempts, now];
    
    await limitRef.set({
      attempts: updatedAttempts,
      userId,
      action: config.action,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    functions.logger.error('Error checking rate limit', { error, userId, action: config.action });
    // On error, allow the operation (fail open for better UX)
    return true;
  }
}

/**
 * Middleware-style rate limit checker for Cloud Functions
 * Throws HttpsError if rate limit exceeded
 */
export async function enforceRateLimit(
  context: functions.https.CallableContext,
  config: RateLimitConfig
): Promise<void> {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  
  const allowed = await checkRateLimit(context.auth.uid, config);
  
  if (!allowed) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      `Rate limit exceeded. Please try again later. (Max ${config.maxAttempts} per ${config.windowMs / 1000}s)`
    );
  }
}

/**
 * Get remaining attempts for a user
 */
export async function getRemainingAttempts(
  userId: string,
  config: RateLimitConfig
): Promise<{ remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  const limitRef = admin.firestore()
    .collection('rate_limits')
    .doc(`${userId}_${config.action}`);
  
  const doc = await limitRef.get();
  const attempts: number[] = doc.exists ? doc.data()?.attempts || [] : [];
  
  const recentAttempts = attempts.filter((timestamp: number) => timestamp > windowStart);
  const remaining = Math.max(0, config.maxAttempts - recentAttempts.length);
  
  // Calculate when the oldest attempt will expire
  const oldestAttempt = recentAttempts[0] || now;
  const resetAt = oldestAttempt + config.windowMs;
  
  return { remaining, resetAt };
}

/**
 * Clear rate limits for a user (admin function)
 */
export async function clearRateLimits(userId: string, action?: string): Promise<void> {
  const limitsRef = admin.firestore().collection('rate_limits');
  
  let query;
  if (action) {
    // Clear specific action
    const limitRef = limitsRef.doc(`${userId}_${action}`);
    await limitRef.delete();
  } else {
    // Clear all limits for user
    const snapshot = await limitsRef.where('userId', '==', userId).get();
    const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);
  }
  
  functions.logger.info('Rate limits cleared', { userId, action: action || 'all' });
}

/**
 * Scheduled cleanup of old rate limit records
 */
export const cleanupRateLimits = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const limitsRef = admin.firestore().collection('rate_limits');
    const snapshot = await limitsRef.get();
    
    let deletedCount = 0;
    const deletePromises: Promise<any>[] = [];
    
    snapshot.docs.forEach((doc) => {
      const attempts: number[] = doc.data().attempts || [];
      const hasRecentAttempts = attempts.some((t: number) => t > sevenDaysAgo);
      
      if (!hasRecentAttempts) {
        deletePromises.push(doc.ref.delete());
        deletedCount++;
      }
    });
    
    await Promise.all(deletePromises);
    
    functions.logger.info('Rate limit cleanup completed', { deletedCount });
  });
