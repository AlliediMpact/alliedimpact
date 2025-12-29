import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SavingsJarCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (this.isValid(entry)) {
      return entry.data as T;
    }

    // Remove expired entry
    this.cache.delete(key);
    return null;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Get current cache size
  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      const entry = this.cache.get(key);
      if (entry && !this.isValid(entry)) {
        this.cache.delete(key);
      }
    });
  }
}

// Singleton instance
const cache = new SavingsJarCache();

// Cache key builders
const KEYS = {
  balance: (userId: string) => `balance:${userId}`,
  jar: (userId: string) => `jar:${userId}`,
  transactions: (userId: string, limit: number) => `transactions:${userId}:${limit}`,
  analytics: (userId: string, days: number) => `analytics:${userId}:${days}`,
};

// Cached operations
export async function getCachedBalance(userId: string): Promise<number> {
  const cacheKey = KEYS.balance(userId);
  
  // Check cache
  const cached = cache.get<number>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch from Firestore
  const jarRef = doc(db, 'savingsJar', userId);
  const jarSnap = await getDoc(jarRef);
  const balance = jarSnap.exists() ? jarSnap.data().balance || 0 : 0;

  // Cache for 1 minute (balance changes frequently)
  cache.set(cacheKey, balance, 60 * 1000);
  
  return balance;
}

export async function getCachedJar(userId: string): Promise<any> {
  const cacheKey = KEYS.jar(userId);
  
  // Check cache
  const cached = cache.get<any>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch from Firestore
  const jarRef = doc(db, 'savingsJar', userId);
  const jarSnap = await getDoc(jarRef);
  const jar = jarSnap.exists() ? jarSnap.data() : null;

  // Cache for 2 minutes
  cache.set(cacheKey, jar, 2 * 60 * 1000);
  
  return jar;
}

export async function getCachedTransactions(userId: string, limit: number = 10): Promise<any[]> {
  const cacheKey = KEYS.transactions(userId, limit);
  
  // Check cache
  const cached = cache.get<any[]>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch from Firestore
  const q = query(
    collection(db, 'savingsJarTransactions'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  
  const transactions = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, limit);

  // Cache for 5 minutes
  cache.set(cacheKey, transactions, 5 * 60 * 1000);
  
  return transactions;
}

// Invalidation helpers
export function invalidateUserCache(userId: string): void {
  cache.invalidate(KEYS.balance(userId));
  cache.invalidate(KEYS.jar(userId));
  cache.invalidatePattern(`transactions:${userId}`);
  cache.invalidatePattern(`analytics:${userId}`);
}

export function invalidateBalanceCache(userId: string): void {
  cache.invalidate(KEYS.balance(userId));
}

// Manual cache management
export function clearAllCache(): void {
  cache.clear();
}

export function getCacheSize(): number {
  return cache.size();
}

export function cleanupCache(): void {
  cache.cleanup();
}

// Automatic cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 10 * 60 * 1000);
}

export default cache;
