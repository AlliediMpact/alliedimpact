/**
 * Firestore Query Optimizer
 * Best practices and utilities for efficient Firestore queries
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  Query,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { getDbInstance } from './firebase';
import { logger } from './logger';

export interface PaginationOptions {
  pageSize: number;
  lastDocument?: any;
}

export interface QueryOptions {
  filters?: Record<string, any>;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
}

/**
 * Optimized query builder with automatic logging
 */
export class FirestoreQueryBuilder {
  private db = getDbInstance();
  private constraints: QueryConstraint[] = [];
  private collectionPath: string;

  constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  /**
   * Add where clause
   */
  where(field: string, operator: any, value: any): this {
    this.constraints.push(where(field, operator, value));
    return this;
  }

  /**
   * Add order by clause
   */
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.constraints.push(orderBy(field, direction));
    return this;
  }

  /**
   * Add limit
   */
  limit(count: number): this {
    this.constraints.push(limit(count));
    return this;
  }

  /**
   * Add pagination cursor
   */
  startAfter(doc: any): this {
    if (doc) {
      this.constraints.push(startAfter(doc));
    }
    return this;
  }

  /**
   * Build and execute query
   */
  async execute(): Promise<any[]> {
    const startTime = Date.now();

    try {
      const collectionRef = collection(this.db, this.collectionPath);
      const q = query(collectionRef, ...this.constraints);
      const snapshot = await getDocs(q);

      const duration = Date.now() - startTime;

      // Log query performance
      logger.info(`Firestore query completed`, {
        action: 'firestore_query',
        metadata: {
          collection: this.collectionPath,
          resultCount: snapshot.size,
          duration,
          constraints: this.constraints.length,
        },
      });

      // Warn on slow queries
      if (duration > 1000) {
        logger.warn(`Slow Firestore query detected`, {
          action: 'firestore_query',
          metadata: {
            collection: this.collectionPath,
            duration,
            resultCount: snapshot.size,
          },
        });
      }

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      logger.error(`Firestore query failed`, {
        action: 'firestore_query',
        metadata: {
          collection: this.collectionPath,
          error: error.message,
        },
      }, error);
      throw error;
    }
  }
}

/**
 * Optimized pagination helper
 */
export class FirestorePaginator {
  private collectionPath: string;
  private pageSize: number;
  private lastDoc: any = null;

  constructor(collectionPath: string, pageSize: number = 20) {
    this.collectionPath = collectionPath;
    this.pageSize = pageSize;
  }

  /**
   * Get next page of results
   */
  async getNextPage(options: QueryOptions = {}): Promise<{ data: any[]; hasMore: boolean }> {
    const builder = new FirestoreQueryBuilder(this.collectionPath);

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([field, value]) => {
        builder.where(field, '==', value);
      });
    }

    // Apply ordering
    if (options.orderByField) {
      builder.orderBy(options.orderByField, options.orderDirection || 'desc');
    }

    // Apply pagination
    builder.limit(this.pageSize + 1); // Fetch one extra to check for more
    if (this.lastDoc) {
      builder.startAfter(this.lastDoc);
    }

    const results = await builder.execute();
    const hasMore = results.length > this.pageSize;

    // Remove extra item if exists
    if (hasMore) {
      results.pop();
    }

    // Store last document for next page
    if (results.length > 0) {
      this.lastDoc = results[results.length - 1];
    }

    return { data: results, hasMore };
  }

  /**
   * Reset pagination
   */
  reset() {
    this.lastDoc = null;
  }
}

/**
 * Query performance analyzer
 */
export class QueryPerformanceAnalyzer {
  private queryTimes: Map<string, number[]> = new Map();

  /**
   * Record query time
   */
  recordQuery(queryName: string, duration: number) {
    if (!this.queryTimes.has(queryName)) {
      this.queryTimes.set(queryName, []);
    }
    this.queryTimes.get(queryName)!.push(duration);
  }

  /**
   * Get query statistics
   */
  getStats(queryName: string) {
    const times = this.queryTimes.get(queryName);
    if (!times || times.length === 0) {
      return null;
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    const min = Math.min(...times);

    return { avg, max, min, count: times.length };
  }

  /**
   * Get all slow queries
   */
  getSlowQueries(threshold: number = 1000): { query: string; stats: any }[] {
    const slow: { query: string; stats: any }[] = [];

    this.queryTimes.forEach((times, queryName) => {
      const stats = this.getStats(queryName);
      if (stats && stats.avg > threshold) {
        slow.push({ query: queryName, stats });
      }
    });

    return slow;
  }
}

/**
 * Best practice query patterns
 */
export const firestoreQueries = {
  /**
   * Get user by email (indexed)
   */
  async getUserByEmail(email: string) {
    return new FirestoreQueryBuilder('platform_users')
      .where('email', '==', email)
      .limit(1)
      .execute();
  },

  /**
   * Get user notifications (paginated, indexed)
   */
  async getUserNotifications(userId: string, unreadOnly: boolean = false, pageSize: number = 20) {
    const builder = new FirestoreQueryBuilder('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(pageSize);

    if (unreadOnly) {
      builder.where('read', '==', false);
    }

    return builder.execute();
  },

  /**
   * Get contact submissions by status (indexed)
   */
  async getContactSubmissionsByStatus(status: string, pageSize: number = 50) {
    return new FirestoreQueryBuilder('contact_submissions')
      .where('status', '==', status)
      .orderBy('createdAt', 'desc')
      .limit(pageSize)
      .execute();
  },

  /**
   * Get recent user activity (indexed)
   */
  async getRecentUserActivity(userId: string, limitCount: number = 10) {
    return new FirestoreQueryBuilder('audit_logs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .execute();
  },
};

// Export singleton analyzer
export const performanceAnalyzer = new QueryPerformanceAnalyzer();
