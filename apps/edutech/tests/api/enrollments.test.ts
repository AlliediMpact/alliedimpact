/**
 * Tests for /api/enrollments endpoint
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/enrollments/route';

// Mock Firebase
jest.mock('@/config/firebase', () => ({
  db: {},
}));

// Mock Firestore functions
const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockServerTimestamp = jest.fn(() => ({ _type: 'timestamp' }));

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
  limit: (...args: any[]) => mockLimit(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

describe('POST /api/enrollments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockReturnValue('mock-collection');
    mockQuery.mockReturnValue('mock-query');
    mockWhere.mockReturnValue('mock-where');
  });

  describe('successful enrollment creation', () => {
    it('should create enrollment with all required fields', async () => {
      mockGetDocs.mockResolvedValue({ empty: true });
      mockAddDoc.mockResolvedValue({ id: 'enrollment123' });

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          tier: 'premium',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        enrollmentId: 'enrollment123',
        message: 'Enrollment created successfully',
      });
      expect(mockAddDoc).toHaveBeenCalledWith('mock-collection', {
        userId: 'user123',
        courseId: 'course456',
        tier: 'premium',
        enrolledAt: { _type: 'timestamp' },
        lastAccessedAt: { _type: 'timestamp' },
        lastAccessedLessonId: null,
        progress: 0,
        completedLessons: [],
        status: 'active',
      });
    });

    it('should use default tier when not provided', async () => {
      mockGetDocs.mockResolvedValue({ empty: true });
      mockAddDoc.mockResolvedValue({ id: 'enrollment456' });

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user789',
          courseId: 'course123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          tier: 'free',
        })
      );
    });

    it('should initialize progress fields correctly', async () => {
      mockGetDocs.mockResolvedValue({ empty: true });
      mockAddDoc.mockResolvedValue({ id: 'enrollment789' });

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user111',
          courseId: 'course222',
        }),
      });

      await POST(request);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          progress: 0,
          completedLessons: [],
          status: 'active',
          lastAccessedLessonId: null,
        })
      );
    });
  });

  describe('duplicate prevention', () => {
    it('should return 409 when enrollment already exists', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'existing-enrollment' }],
      });

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toEqual({
        error: 'Already enrolled in this course',
      });
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('should check for existing enrollment before creating new one', async () => {
      mockGetDocs.mockResolvedValue({ empty: true });
      mockAddDoc.mockResolvedValue({ id: 'new-enrollment' });

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user456',
          courseId: 'course789',
        }),
      });

      await POST(request);

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user456');
      expect(mockWhere).toHaveBeenCalledWith('courseId', '==', 'course789');
      expect(mockGetDocs).toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          courseId: 'course123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: userId, courseId');
    });

    it('should return 400 when courseId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: userId, courseId');
    });

    it('should return 400 when both userId and courseId are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('error handling', () => {
    it('should return 500 when database operation fails', async () => {
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create enrollment');
    });
  });
});

describe('GET /api/enrollments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockReturnValue('mock-collection');
    mockQuery.mockReturnValue('mock-query');
    mockWhere.mockReturnValue('mock-where');
    mockLimit.mockReturnValue('mock-limit');
  });

  describe('successful enrollment retrieval', () => {
    it('should retrieve enrollment with lastAccessedLessonId', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'enrollment123',
            data: () => ({
              userId: 'user123',
              courseId: 'course456',
              tier: 'premium',
              progress: 50,
              lastAccessedLessonId: 'lesson5',
            }),
          },
        ],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?userId=user123&courseId=course456'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        enrollment: {
          id: 'enrollment123',
          userId: 'user123',
          courseId: 'course456',
          tier: 'premium',
          progress: 50,
          lastAccessedLessonId: 'lesson5',
        },
        lastAccessedLessonId: 'lesson5',
      });
    });

    it('should return null for lastAccessedLessonId when not set', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'enrollment456',
            data: () => ({
              userId: 'user789',
              courseId: 'course123',
              tier: 'free',
              progress: 0,
            }),
          },
        ],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?userId=user789&courseId=course123'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lastAccessedLessonId).toBeNull();
    });
  });

  describe('not found errors', () => {
    it('should return 404 when enrollment not found', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?userId=user999&courseId=course999'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Enrollment not found');
    });
  });

  describe('validation errors', () => {
    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?courseId=course123'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters: userId, courseId');
    });

    it('should return 400 when courseId is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?userId=user123'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required parameters: userId, courseId');
    });

    it('should return 400 when both parameters are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrollments');

      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });

  describe('error handling', () => {
    it('should return 500 when database query fails', async () => {
      mockGetDocs.mockRejectedValue(new Error('Database connection lost'));

      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?userId=user123&courseId=course456'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get enrollment');
    });
  });
});
