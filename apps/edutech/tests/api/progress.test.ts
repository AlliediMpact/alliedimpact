/**
 * Tests for /api/progress endpoint
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/progress/route';

// Mock Firebase
jest.mock('@/config/firebase', () => ({
  db: {},
}));

// Mock Firestore functions
const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockDoc = jest.fn();
const mockArrayUnion = jest.fn((value) => ({ _arrayUnion: value }));
const mockServerTimestamp = jest.fn(() => ({ _type: 'timestamp' }));

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  doc: (...args: any[]) => mockDoc(...args),
  arrayUnion: (value: any) => mockArrayUnion(value),
  serverTimestamp: () => mockServerTimestamp(),
}));

describe('POST /api/progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockReturnValue('mock-collection');
    mockQuery.mockReturnValue('mock-query');
    mockWhere.mockReturnValue('mock-where');
    mockDoc.mockReturnValue('mock-doc');
  });

  describe('successful progress save', () => {
    it('should save progress with all fields', async () => {
      mockAddDoc.mockResolvedValue({ id: 'progress123' });
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'enrollment123' }],
      });
      mockUpdateDoc.mockResolvedValue(undefined);

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
      expect(mockAddDoc).toHaveBeenCalledWith('mock-collection', {
        userId: 'user123',
        courseId: 'course456',
        lessonId: 'lesson789',
        progress: 100,
        completedAt: '2024-01-15T10:00:00Z',
        createdAt: { _type: 'timestamp' },
      });
    });

    it('should use default progress value when not provided', async () => {
      mockAddDoc.mockResolvedValue({ id: 'progress456' });
      mockGetDocs.mockResolvedValue({ empty: true });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
        }),
      });

      await POST(request);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          progress: 100,
        })
      );
    });

    it('should use current timestamp when completedAt not provided', async () => {
      mockAddDoc.mockResolvedValue({ id: 'progress789' });
      mockGetDocs.mockResolvedValue({ empty: true });

      const dateSpy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-20T15:30:00Z');

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user456',
          courseId: 'course789',
          lessonId: 'lesson123',
        }),
      });

      await POST(request);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          completedAt: '2024-01-20T15:30:00Z',
        })
      );

      dateSpy.mockRestore();
    });
  });

  describe('enrollment updates', () => {
    it('should update enrollment when it exists', async () => {
      mockAddDoc.mockResolvedValue({ id: 'progress123' });
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'enrollment456' }],
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          courseId: 'course456',
          lessonId: 'lesson789',
        }),
      });

      await POST(request);

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', {
        lastAccessedAt: { _type: 'timestamp' },
        lastAccessedLessonId: 'lesson789',
        completedLessons: { _arrayUnion: 'lesson789' },
        updatedAt: { _type: 'timestamp' },
      });
    });

    it('should not fail when enrollment does not exist', async () => {
      mockAddDoc.mockResolvedValue({ id: 'progress123' });
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] });

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user999',
          courseId: 'course999',
          lessonId: 'lesson999',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should add lesson to completedLessons array', async () => {
      mockAddDoc.mockResolvedValue({ id: 'progress789' });
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'enrollment789' }],
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user111',
          courseId: 'course222',
          lessonId: 'lesson333',
        }),
      });

      await POST(request);

      expect(mockArrayUnion).toHaveBeenCalledWith('lesson333');
    });

    it('should update lastAccessedLessonId', async () => {
      mockAddDoc.mockResolvedValue({ id: 'progress999' });
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'enrollment999' }],
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user222',
          courseId: 'course333',
          lessonId: 'lesson444',
        }),
      });

      await POST(request);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          lastAccessedLessonId: 'lesson444',
        })
      );
    });
  });

  describe('validation errors', () => {
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
      expect(data.error).toBe('Missing required fields: userId, courseId, lessonId');
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
      expect(data.error).toBe('Missing required fields: userId, courseId, lessonId');
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
      expect(data.error).toBe('Missing required fields: userId, courseId, lessonId');
    });

    it('should return 400 when all required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/progress', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('error handling', () => {
    it('should return 500 when progress save fails', async () => {
      mockAddDoc.mockRejectedValue(new Error('Database write failed'));

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
      expect(data.error).toBe('Failed to save progress');
    });

    it('should return 500 when enrollment update fails', async () => {
      mockAddDoc.mockResolvedValue({ id: 'progress123' });
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'enrollment123' }],
      });
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

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
});
