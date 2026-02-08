/**
 * Tests for courseService
 */

import {
  getCoursesPaginated,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourseById,
} from '@/services/courseService';
import { EduTechError } from '@/lib/errors';

// Mock Firebase
jest.mock('@/config/firebase', () => ({
  db: {},
}));

// Mock retry utility
jest.mock('@/lib/retry', () => ({
  retryWithBackoff: jest.fn((fn) => fn()),
}));

// Mock Firestore functions
const mockGetDocs = jest.fn();
const mockGetDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockStartAfter = jest.fn();

const mockTimestamp = {
  now: jest.fn(() => ({ _timestamp: 'now' })),
};

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
  limit: (...args: any[]) => mockLimit(...args),
  startAfter: (...args: any[]) => mockStartAfter(...args),
  Timestamp: mockTimestamp,
}));

describe('courseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockReturnValue('mock-collection');
    mockQuery.mockReturnValue('mock-query');
    mockWhere.mockReturnValue('mock-where');
    mockOrderBy.mockReturnValue('mock-order');
    mockLimit.mockReturnValue('mock-limit');
  });

  describe('getCoursesPaginated', () => {
    it('should return courses with pagination', async () => {
      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => {
          callback({ id: 'course1', data: () => ({ title: 'Course 1', published: true }) }, 0);
          callback({ id: 'course2', data: () => ({ title: 'Course 2', published: true }) }, 1);
        },
      });

      const result = await getCoursesPaginated({}, 12);

      expect(result.courses).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should filter by track', async () => {
      mockGetDocs.mockResolvedValue({
        forEach: () => {},
      });

      await getCoursesPaginated({ track: 'coding' }, 12);

      expect(mockWhere).toHaveBeenCalledWith('track', '==', 'coding');
    });

    it('should filter by level', async () => {
      mockGetDocs.mockResolvedValue({
        forEach: () => {},
      });

      await getCoursesPaginated({ level: 'beginner' }, 12);

      expect(mockWhere).toHaveBeenCalledWith('level', '==', 'beginner');
    });

    it('should filter by tier', async () => {
      mockGetDocs.mockResolvedValue({
        forEach: () => {},
      });

      await getCoursesPaginated({ tier: 'FREE' }, 12);

      expect(mockWhere).toHaveBeenCalledWith('tier', '==', 'FREE');
    });

    it('should support search query', async () => {
      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => {
          callback(
            {
              id: 'course1',
              data: () => ({ title: 'Learn Python', description: 'Python course', tags: ['python'] }),
            },
            0
          );
          callback(
            {
              id: 'course2',
              data: () => ({ title: 'Learn Java', description: 'Java course', tags: ['java'] }),
            },
            1
          );
        },
      });

      const result = await getCoursesPaginated({ searchQuery: 'python' }, 12);

      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].courseId).toBe('course1');
    });

    it('should detect when there are more results', async () => {
      mockGetDocs.mockResolvedValue({
        forEach: (callback: any) => {
          for (let i = 0; i < 13; i++) {
            callback({ id: `course${i}`, data: () => ({ title: `Course ${i}` }) }, i);
          }
        },
      });

      const result = await getCoursesPaginated({}, 12);

      expect(result.courses).toHaveLength(12);
      expect(result.hasMore).toBe(true);
    });

    it('should support pagination cursor', async () => {
      const mockLastDoc = { id: 'lastCourse' };
      mockGetDocs.mockResolvedValue({
        forEach: () => {},
      });

      await getCoursesPaginated({}, 12, mockLastDoc as any);

      expect(mockStartAfter).toHaveBeenCalledWith(mockLastDoc);
    });

    it('should throw EduTechError on failure', async () => {
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      await expect(getCoursesPaginated({}, 12)).rejects.toThrow(EduTechError);
    });
  });

  describe('getCourse', () => {
    it('should return course when found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        id: 'course123',
        data: () => ({
          title: 'Test Course',
          description: 'Description',
          published: true,
        }),
      });

      const result = await getCourse('course123');

      expect(result).toBeDefined();
      expect(result?.courseId).toBe('course123');
      expect(result?.title).toBe('Test Course');
    });

    it('should return null when course not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await getCourse('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw EduTechError on failure', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(getCourse('course123')).rejects.toThrow(EduTechError);
    });
  });

  describe('createCourse', () => {
    it('should create course with required fields', async () => {
      mockAddDoc.mockResolvedValue({ id: 'newCourse123' });

      const courseData = {
        title: 'New Course',
        instructorId: 'instructor123',
      };

      const courseId = await createCourse(courseData);

      expect(courseId).toBe('newCourse123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          title: 'New Course',
          instructorId: 'instructor123',
        })
      );
    });

    it('should set default values', async () => {
      mockAddDoc.mockResolvedValue({ id: 'newCourse456' });

      const courseData = {
        title: 'Test Course',
        instructorId: 'instructor456',
      };

      await createCourse(courseData);

      expect(mockAddDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          description: '',
          track: 'coding',
          level: 'beginner',
          tier: 'PREMIUM',
          published: false,
          enrollmentCount: 0,
          rating: 0,
        })
      );
    });

    it('should throw error when title is missing', async () => {
      const courseData = {
        instructorId: 'instructor123',
      };

      await expect(createCourse(courseData)).rejects.toThrow('Title and instructorId are required');
    });

    it('should throw error when instructorId is missing', async () => {
      const courseData = {
        title: 'Test Course',
      };

      await expect(createCourse(courseData)).rejects.toThrow('Title and instructorId are required');
    });
  });

  describe('updateCourse', () => {
    it('should update course fields', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateCourse('course123', {
        title: 'Updated Title',
        description: 'Updated description',
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          title: 'Updated Title',
          description: 'Updated description',
        })
      );
    });

    it('should not update protected fields', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateCourse('course123', {
        title: 'Updated Title',
        courseId: 'hacked' as any,
        enrollmentCount: 9999 as any,
        rating: 5 as any,
      });

      const updateCall = mockUpdateDoc.mock.calls[0][1];
      expect(updateCall.courseId).toBeUndefined();
      expect(updateCall.enrollmentCount).toBeUndefined();
      expect(updateCall.rating).toBeUndefined();
    });

    it('should set publishedAt when publishing', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateCourse('course123', {
        published: true,
      });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          published: true,
          publishedAt: expect.anything(),
        })
      );
    });
  });

  describe('deleteCourseById', () => {
    it('should delete course by id', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      await deleteCourseById('course123');

      expect(mockDeleteDoc).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      mockDeleteDoc.mockRejectedValue(new Error('Delete failed'));

      await expect(deleteCourseById('course123')).rejects.toThrow();
    });
  });
});
