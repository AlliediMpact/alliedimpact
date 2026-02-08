/**
 * Tests for /api/enrollments route
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../../src/app/api/enrollments/route';

// Mock Firebase
jest.mock('../../src/config/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'TIMESTAMP'),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

const firestore = require('firebase/firestore');

describe('POST /api/enrollments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('valid requests', () => {
    it('should create enrollment successfully', async () => {
      // Mock empty existing enrollment check
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      // Mock successful document creation
      firestore.addDoc.mockResolvedValueOnce({ id: 'enrollment123' });

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
      expect(firestore.addDoc).toHaveBeenCalled();
    });

    it('should create enrollment with default tier', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      firestore.addDoc.mockResolvedValueOnce({ id: 'enrollment456' });

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course789',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollmentId).toBe('enrollment456');
      
      const addDocCall = firestore.addDoc.mock.calls[0][1];
      expect(addDocCall.tier).toBe('free');
    });

    it('should include required enrollment fields', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      firestore.addDoc.mockResolvedValueOnce({ id: 'enrollment789' });

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course999',
          tier: 'premium',
        }),
      });

      await POST(request);

      const enrollmentData = firestore.addDoc.mock.calls[0][1];
      expect(enrollmentData).toMatchObject({
        userId: 'user123',
        courseId: 'course999',
        tier: 'premium',
        progress: 0,
        completedLessons: [],
        status: 'active',
        lastAccessedLessonId: null,
      });
    });
  });

  describe('validation', () => {
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
      expect(data).toEqual({
        error: 'Missing required fields: userId, courseId',
      });
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

    it('should return 400 when both fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe('duplicate enrollment', () => {
    it('should return 409 when enrollment already exists', async () => {
      // Mock existing enrollment
      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{ id: 'existing123' }],
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
      expect(firestore.addDoc).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return 500 when database operation fails', async () => {
      firestore.getDocs.mockRejectedValueOnce(new Error('Database error'));

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
      expect(data).toEqual({
        error: 'Failed to create enrollment',
      });
    });

    it('should return 500 when addDoc fails', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });
      firestore.addDoc.mockRejectedValueOnce(new Error('Firestore error'));

      const request = new NextRequest('http://localhost:3000/api/enrollments', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});

describe('GET /api/enrollments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('valid requests', () => {
    it('should return enrollment when found', async () => {
      const mockEnrollment = {
        userId: 'user123',
        courseId: 'course456',
        tier: 'premium',
        progress: 45,
        lastAccessedLessonId: 'lesson789',
      };

      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'enrollment123',
            data: () => mockEnrollment,
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
          ...mockEnrollment,
        },
        lastAccessedLessonId: 'lesson789',
      });
    });

    it('should return null lastAccessedLessonId when not set', async () => {
      const mockEnrollment = {
        userId: 'user123',
        courseId: 'course456',
        tier: 'free',
      };

      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'enrollment456',
            data: () => mockEnrollment,
          },
        ],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?userId=user123&courseId=course456'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.lastAccessedLessonId).toBeNull();
    });
  });

  describe('validation', () => {
    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?courseId=course123'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required parameters: userId, courseId',
      });
    });

    it('should return 400 when courseId is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?userId=user123'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 when both parameters are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/enrollments');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe('not found', () => {
    it('should return 404 when enrollment not found', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?userId=user999&courseId=course999'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'Enrollment not found',
      });
    });
  });

  describe('error handling', () => {
    it('should return 500 when database query fails', async () => {
      firestore.getDocs.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest(
        'http://localhost:3000/api/enrollments?userId=user123&courseId=course456'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to get enrollment',
      });
    });
  });
});
