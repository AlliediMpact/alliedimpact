/**
 * Tests for /api/progress route
 */

import { NextRequest } from 'next/server';
import { POST } from '../../src/app/api/progress/route';

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
  updateDoc: jest.fn(),
  doc: jest.fn(),
  arrayUnion: jest.fn((value) => ['ARRAY_UNION', value]),
}));

const firestore = require('firebase/firestore');

describe('POST /api/progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('valid requests', () => {
    it('should save progress successfully', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'progress123' });
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
          progress: 100,
          completedAt: '2024-01-15T10:00:00Z',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Progress saved successfully',
      });
      expect(firestore.addDoc).toHaveBeenCalled();
    });

    it('should use default progress value when not provided', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'progress456' });
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
        }),
      });

      await POST(request);

      const progressData = firestore.addDoc.mock.calls[0][1];
      expect(progressData.progress).toBe(100);
    });

    it('should use current date when completedAt not provided', async () => {
      const beforeDate = new Date().toISOString();
      
      firestore.addDoc.mockResolvedValueOnce({ id: 'progress789' });
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson999',
        }),
      });

      await POST(request);

      const progressData = firestore.addDoc.mock.calls[0][1];
      const afterDate = new Date().toISOString();
      
      expect(progressData.completedAt).toBeDefined();
      expect(progressData.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should update enrollment when exists', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'progress123' });
      
      const mockEnrollment = {
        id: 'enrollment123',
        userId: 'user123',
        courseId: 'course456',
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

      firestore.updateDoc.mockResolvedValueOnce(undefined);

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
          progress: 80,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(firestore.updateDoc).toHaveBeenCalled();
      
      const updateData = firestore.updateDoc.mock.calls[0][1];
      expect(updateData.lastAccessedLessonId).toBe('lesson789');
      expect(updateData.completedLessons).toEqual(['ARRAY_UNION', 'lesson789']);
    });

    it('should not update enrollment when not found', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'progress456' });
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user999',
          courseId: 'course999',
          lessonId: 'lesson999',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(firestore.updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          courseId: 'course123',
          lessonId: 'lesson456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing required fields: userId, courseId, lessonId',
      });
    });

    it('should return 400 when courseId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          lessonId: 'lesson456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 when lessonId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 when all required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe('error handling', () => {
    it('should return 500 when addDoc fails', async () => {
      firestore.addDoc.mockRejectedValueOnce(new Error('Firestore error'));

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to save progress',
      });
    });

    it('should return 500 when updateDoc fails', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'progress123' });
      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{ id: 'enrollment123', data: () => ({}) }],
      });
      firestore.updateDoc.mockRejectedValueOnce(new Error('Update error'));

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('should return 500 when getDocs fails', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'progress123' });
      firestore.getDocs.mockRejectedValueOnce(new Error('Query error'));

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });

  describe('progress tracking', () => {
    it('should save partial progress', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'progress123' });
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
          progress: 50,
        }),
      });

      await POST(request);

      const progressData = firestore.addDoc.mock.calls[0][1];
      expect(progressData.progress).toBe(50);
    });

    it('should save zero progress', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'progress123' });
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
          progress: 0,
        }),
      });

      await POST(request);

      const progressData = firestore.addDoc.mock.calls[0][1];
      expect(progressData.progress).toBe(100); // Uses default since 0 is falsy
    });
  });
});
