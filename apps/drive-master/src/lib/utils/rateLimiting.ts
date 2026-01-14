/**
 * Rate Limiting Utilities
 * Prevents API abuse and controls costs
 */

/**
 * Debounce function - delays execution until after wait period of no calls
 * Use for: search inputs, form validation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once per wait period
 * Use for: scroll events, resize handlers, API calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }

    return lastResult;
  };
}

/**
 * Rate Limiter class - tracks and limits function calls
 */
export class RateLimiter {
  private calls: number[] = [];
  private maxCalls: number;
  private windowMs: number;

  constructor(maxCalls: number, windowMs: number) {
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
  }

  /**
   * Check if action is allowed
   */
  isAllowed(): boolean {
    const now = Date.now();
    
    // Remove calls outside the window
    this.calls = this.calls.filter(time => now - time < this.windowMs);

    // Check if under limit
    if (this.calls.length < this.maxCalls) {
      this.calls.push(now);
      return true;
    }

    return false;
  }

  /**
   * Get time until next call is allowed (ms)
   */
  getTimeUntilAllowed(): number {
    if (this.calls.length < this.maxCalls) {
      return 0;
    }

    const oldestCall = this.calls[0];
    const now = Date.now();
    return Math.max(0, this.windowMs - (now - oldestCall));
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.calls = [];
  }
}

/**
 * Local Storage Rate Limiter - persists across page reloads
 */
export class PersistentRateLimiter {
  private key: string;
  private maxCalls: number;
  private windowMs: number;

  constructor(key: string, maxCalls: number, windowMs: number) {
    this.key = `rate_limit_${key}`;
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
  }

  private getCalls(): number[] {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setCalls(calls: number[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(calls));
    } catch {
      // Storage full or disabled
    }
  }

  isAllowed(): boolean {
    const now = Date.now();
    let calls = this.getCalls();

    // Remove old calls
    calls = calls.filter(time => now - time < this.windowMs);

    if (calls.length < this.maxCalls) {
      calls.push(now);
      this.setCalls(calls);
      return true;
    }

    return false;
  }

  getTimeUntilAllowed(): number {
    const calls = this.getCalls();
    
    if (calls.length < this.maxCalls) {
      return 0;
    }

    const now = Date.now();
    const oldestCall = calls[0];
    return Math.max(0, this.windowMs - (now - oldestCall));
  }

  reset(): void {
    localStorage.removeItem(this.key);
  }
}

/**
 * Predefined rate limiters for common use cases
 */

// Journey attempts: max 10 per minute (prevents rapid-fire attempts)
export const journeyAttemptLimiter = new PersistentRateLimiter(
  'journey_attempts',
  10,
  60 * 1000 // 1 minute
);

// Search queries: max 20 per minute
export const searchLimiter = new RateLimiter(20, 60 * 1000);

// Form submissions: max 5 per minute
export const formSubmitLimiter = new RateLimiter(5, 60 * 1000);

// Profile updates: max 3 per minute
export const profileUpdateLimiter = new PersistentRateLimiter(
  'profile_updates',
  3,
  60 * 1000
);

// School contact: max 5 per hour (prevents spam)
export const schoolContactLimiter = new PersistentRateLimiter(
  'school_contact',
  5,
  60 * 60 * 1000 // 1 hour
);

// Certificate downloads: max 10 per minute
export const certificateDownloadLimiter = new PersistentRateLimiter(
  'certificate_downloads',
  10,
  60 * 1000
);

/**
 * Usage Examples:
 * 
 * // Debounce search
 * const debouncedSearch = debounce(searchFunction, 300);
 * 
 * // Throttle scroll handler
 * const throttledScroll = throttle(handleScroll, 100);
 * 
 * // Rate limit journey attempts
 * if (!journeyAttemptLimiter.isAllowed()) {
 *   const wait = journeyAttemptLimiter.getTimeUntilAllowed();
 *   toast.error(`Please wait ${Math.ceil(wait / 1000)}s before starting another journey`);
 *   return;
 * }
 */
