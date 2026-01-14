/**
 * Monitoring & Performance Utilities
 * Centralized error tracking and performance monitoring
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Capture exception with context
 */
export function captureException(
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
    user?: {
      id?: string;
      email?: string;
      username?: string;
    };
  }
) {
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      scope.setContext('extra', context.extra);
    }

    if (context?.level) {
      scope.setLevel(context.level);
    }

    if (context?.user) {
      scope.setUser(context.user);
    }

    Sentry.captureException(error);
  });
}

/**
 * Capture message (non-error events)
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, any>
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 ${level.toUpperCase()}:`, message, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    contexts: context ? { extra: context } : undefined,
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
  userType?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    userType: user.userType,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>,
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: level || 'info',
    timestamp: Date.now() / 1000,
  });
}

/**
 * Performance monitoring - measure operation duration
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    op: 'function',
    name: operation,
    tags,
  });

  try {
    const result = await fn();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}

/**
 * Track slow operations (for performance optimization)
 */
export function trackSlowOperation(
  operation: string,
  duration: number,
  threshold: number = 1000
) {
  if (duration > threshold) {
    captureMessage(
      `Slow operation detected: ${operation}`,
      'warning',
      {
        operation,
        duration_ms: duration,
        threshold_ms: threshold,
      }
    );
  }
}
