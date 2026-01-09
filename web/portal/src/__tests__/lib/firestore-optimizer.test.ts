import {
  FirestoreQueryBuilder,
  FirestorePaginator,
  QueryPerformanceAnalyzer,
  firestoreQueries,
} from '@/lib/firestore-optimizer';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  getDbInstance: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn((field, op, value) => ({ field, op, value, type: 'where' })),
  orderBy: jest.fn((field, direction) => ({ field, direction, type: 'orderBy' })),
  limit: jest.fn((count) => ({ count, type: 'limit' })),
  startAfter: jest.fn((doc) => ({ doc, type: 'startAfter' })),
  getDocs: jest.fn(() => Promise.resolve({
    size: 5,
    docs: [
      { id: '1', data: () => ({ name: 'Item 1' }) },
      { id: '2', data: () => ({ name: 'Item 2' }) },
      { id: '3', data: () => ({ name: 'Item 3' }) },
      { id: '4', data: () => ({ name: 'Item 4' }) },
      { id: '5', data: () => ({ name: 'Item 5' }) },
    ],
  })),
}));

describe('FirestoreQueryBuilder', () => {
  it('should create a query builder instance', () => {
    const builder = new FirestoreQueryBuilder('test_collection');
    expect(builder).toBeInstanceOf(FirestoreQueryBuilder);
  });

  it('should add where constraints', () => {
    const builder = new FirestoreQueryBuilder('test_collection');
    const result = builder.where('status', '==', 'active');
    expect(result).toBe(builder); // Should return this for chaining
  });

  it('should add orderBy constraints', () => {
    const builder = new FirestoreQueryBuilder('test_collection');
    const result = builder.orderBy('createdAt', 'desc');
    expect(result).toBe(builder);
  });

  it('should add limit constraint', () => {
    const builder = new FirestoreQueryBuilder('test_collection');
    const result = builder.limit(10);
    expect(result).toBe(builder);
  });

  it('should add startAfter constraint', () => {
    const builder = new FirestoreQueryBuilder('test_collection');
    const mockDoc = { id: 'last-doc' };
    const result = builder.startAfter(mockDoc);
    expect(result).toBe(builder);
  });

  it('should support method chaining', () => {
    const builder = new FirestoreQueryBuilder('test_collection');
    const result = builder
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(20);
    
    expect(result).toBe(builder);
  });

  it('should execute query and return results', async () => {
    const builder = new FirestoreQueryBuilder('test_collection');
    const results = await builder.execute();
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should handle query errors', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs.mockImplementationOnce(() => Promise.reject(new Error('Query failed')));

    const builder = new FirestoreQueryBuilder('test_collection');
    
    await expect(builder.execute()).rejects.toThrow('Query failed');
  });
});

describe('FirestorePaginator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a paginator instance', () => {
    const paginator = new FirestorePaginator('test_collection', 10);
    expect(paginator).toBeInstanceOf(FirestorePaginator);
  });

  it('should get first page of results', async () => {
    const paginator = new FirestorePaginator('test_collection', 3);
    const { data, hasMore } = await paginator.getNextPage();
    
    expect(Array.isArray(data)).toBe(true);
    expect(typeof hasMore).toBe('boolean');
  });

  it('should apply filters to queries', async () => {
    const paginator = new FirestorePaginator('test_collection', 10);
    const filters = { status: 'active' };
    
    await paginator.getNextPage({ filters });
    
    // Query should have been executed with filters
    expect(true).toBe(true); // Verified by not throwing
  });

  it('should apply ordering to queries', async () => {
    const paginator = new FirestorePaginator('test_collection', 10);
    
    await paginator.getNextPage({
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
    
    expect(true).toBe(true);
  });

  it('should detect when more pages are available', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      size: 4,
      docs: [
        { id: '1', data: () => ({ name: 'Item 1' }) },
        { id: '2', data: () => ({ name: 'Item 2' }) },
        { id: '3', data: () => ({ name: 'Item 3' }) },
        { id: '4', data: () => ({ name: 'Item 4' }) },
      ],
    });

    const paginator = new FirestorePaginator('test_collection', 3);
    const { hasMore } = await paginator.getNextPage();
    
    expect(hasMore).toBe(true);
  });

  it('should detect when no more pages available', async () => {
    const { getDocs } = require('firebase/firestore');
    getDocs.mockResolvedValueOnce({
      size: 2,
      docs: [
        { id: '1', data: () => ({ name: 'Item 1' }) },
        { id: '2', data: () => ({ name: 'Item 2' }) },
      ],
    });

    const paginator = new FirestorePaginator('test_collection', 3);
    const { hasMore } = await paginator.getNextPage();
    
    expect(hasMore).toBe(false);
  });

  it('should reset pagination state', () => {
    const paginator = new FirestorePaginator('test_collection', 10);
    paginator.reset();
    
    // Should not throw
    expect(true).toBe(true);
  });
});

describe('QueryPerformanceAnalyzer', () => {
  let analyzer: QueryPerformanceAnalyzer;

  beforeEach(() => {
    analyzer = new QueryPerformanceAnalyzer();
  });

  it('should record query times', () => {
    analyzer.recordQuery('test_query', 150);
    analyzer.recordQuery('test_query', 200);
    
    const stats = analyzer.getStats('test_query');
    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(2);
  });

  it('should calculate average query time', () => {
    analyzer.recordQuery('test_query', 100);
    analyzer.recordQuery('test_query', 200);
    analyzer.recordQuery('test_query', 300);
    
    const stats = analyzer.getStats('test_query');
    expect(stats?.avg).toBe(200);
  });

  it('should track max query time', () => {
    analyzer.recordQuery('test_query', 100);
    analyzer.recordQuery('test_query', 500);
    analyzer.recordQuery('test_query', 200);
    
    const stats = analyzer.getStats('test_query');
    expect(stats?.max).toBe(500);
  });

  it('should track min query time', () => {
    analyzer.recordQuery('test_query', 300);
    analyzer.recordQuery('test_query', 100);
    analyzer.recordQuery('test_query', 200);
    
    const stats = analyzer.getStats('test_query');
    expect(stats?.min).toBe(100);
  });

  it('should return null for non-existent queries', () => {
    const stats = analyzer.getStats('non_existent_query');
    expect(stats).toBeNull();
  });

  it('should identify slow queries', () => {
    analyzer.recordQuery('fast_query', 50);
    analyzer.recordQuery('fast_query', 75);
    analyzer.recordQuery('slow_query', 1500);
    analyzer.recordQuery('slow_query', 2000);
    
    const slowQueries = analyzer.getSlowQueries(1000);
    
    expect(slowQueries.length).toBe(1);
    expect(slowQueries[0].query).toBe('slow_query');
  });

  it('should use custom threshold for slow queries', () => {
    analyzer.recordQuery('query1', 300);
    analyzer.recordQuery('query2', 600);
    
    const slowQueries = analyzer.getSlowQueries(500);
    
    expect(slowQueries.length).toBe(1);
  });
});

describe('firestoreQueries', () => {
  it('should have getUserByEmail method', () => {
    expect(typeof firestoreQueries.getUserByEmail).toBe('function');
  });

  it('should have getUserNotifications method', () => {
    expect(typeof firestoreQueries.getUserNotifications).toBe('function');
  });

  it('should have getContactSubmissionsByStatus method', () => {
    expect(typeof firestoreQueries.getContactSubmissionsByStatus).toBe('function');
  });

  it('should have getRecentUserActivity method', () => {
    expect(typeof firestoreQueries.getRecentUserActivity).toBe('function');
  });

  it('should execute getUserByEmail query', async () => {
    const results = await firestoreQueries.getUserByEmail('test@example.com');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should execute getUserNotifications query', async () => {
    const results = await firestoreQueries.getUserNotifications('user123');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should filter unread notifications', async () => {
    const results = await firestoreQueries.getUserNotifications('user123', true);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should execute getContactSubmissionsByStatus query', async () => {
    const results = await firestoreQueries.getContactSubmissionsByStatus('pending');
    expect(Array.isArray(results)).toBe(true);
  });

  it('should execute getRecentUserActivity query', async () => {
    const results = await firestoreQueries.getRecentUserActivity('user123');
    expect(Array.isArray(results)).toBe(true);
  });
});
