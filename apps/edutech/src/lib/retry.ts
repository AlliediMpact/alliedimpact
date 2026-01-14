/**
 * Retry Logic with Exponential Backoff
 * 
 * Provides utilities for retrying failed operations with
 * exponential backoff and jitter to prevent thundering herd.
 */

import { isRetryableError, logError, normalizeError } from './errors';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitter: true,
  onRetry: () => {},
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  backoffMultiplier: number,
  maxDelay: number,
  jitter: boolean
): number {
  // Exponential backoff: baseDelay * (backoffMultiplier ^ attempt)
  let delay = baseDelay * Math.pow(backoffMultiplier, attempt);

  // Cap at maxDelay
  delay = Math.min(delay, maxDelay);

  // Add jitter (random value between 0 and delay)
  if (jitter) {
    delay = Math.random() * delay;
  }

  return Math.floor(delay);
}

/**
 * Retry a promise-returning function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const normalizedError = normalizeError(error);

      // Don't retry if error is not retryable
      if (!isRetryableError(normalizedError)) {
        logError(normalizedError, { attempt, retryable: false });
        throw normalizedError;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        logError(normalizedError, { attempt, maxRetriesExceeded: true });
        throw normalizedError;
      }

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        opts.baseDelay,
        opts.backoffMultiplier,
        opts.maxDelay,
        opts.jitter
      );

      opts.onRetry(attempt + 1, lastError);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Retry with exponential backoff for specific conditions
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check custom retry condition
      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        throw lastError;
      }

      const delay = calculateDelay(
        attempt,
        opts.baseDelay,
        opts.backoffMultiplier,
        opts.maxDelay,
        opts.jitter
      );

      opts.onRetry(attempt + 1, lastError);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Create an AbortController that times out after a specified duration
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  
  setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return controller;
}

/**
 * Wrap a fetch request with timeout and retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retryWithBackoff(async () => {
    const controller = createTimeoutController(10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }, retryOptions);
}

/**
 * Batch retry - retry multiple operations in parallel
 */
export async function retryBatch<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<T | Error>> {
  const promises = operations.map((op) =>
    retryWithBackoff(op, options).catch((error) => error)
  );

  return Promise.all(promises);
}
