/**
 * @allied-impact/entitlements - Cache Module
 * 
 * In-memory caching for entitlements with LRU eviction
 */

import { LRUCache } from 'lru-cache';
import type { ProductEntitlement, ProductId } from '@allied-impact/types';

interface CacheOptions {
  max?: number;
  ttl?: number;
}

export class EntitlementCache {
  private cache: LRUCache<string, ProductEntitlement[]>;

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.max || 10000, // Maximum 10,000 users in cache
      ttl: options.ttl || 1000 * 60 * 5, // 5 minutes TTL
      updateAgeOnGet: true, // Reset TTL on access
    });
  }

  /**
   * Get user entitlements from cache
   */
  get(userId: string): ProductEntitlement[] | undefined {
    return this.cache.get(userId);
  }

  /**
   * Set user entitlements in cache
   */
  set(userId: string, entitlements: ProductEntitlement[]): void {
    this.cache.set(userId, entitlements);
  }

  /**
   * Invalidate (delete) user's cached entitlements
   */
  invalidate(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      itemCount: this.cache.size,
    };
  }
}

// Singleton cache instance
let cacheInstance: EntitlementCache | null = null;

/**
 * Initialize cache (optional - will auto-initialize with defaults)
 */
export function initializeCache(options?: CacheOptions): EntitlementCache {
  if (!cacheInstance) {
    cacheInstance = new EntitlementCache(options);
  }
  return cacheInstance;
}

/**
 * Get cache instance
 */
export function getCache(): EntitlementCache {
  if (!cacheInstance) {
    cacheInstance = new EntitlementCache();
  }
  return cacheInstance;
}

/**
 * Invalidate user cache (called after entitlement changes)
 */
export function invalidateUserCache(userId: string): void {
  const cache = getCache();
  cache.invalidate(userId);
}

export default {
  EntitlementCache,
  initializeCache,
  getCache,
  invalidateUserCache,
};
