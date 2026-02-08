/**
 * Tests for courseService
 */

import {
  getCoursesPaginated,
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../../src/services/courseService';
import { EduTechError } from '../../src/lib/errors';

// Mock Firebase
jest.mock('../../src/config/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn((...args) => args),
  where: jest.fn((field, op, value) => ({ field, op, value })),
  orderBy: jest.fn((field, direction) => ({ field, direction })),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
  limit: jest.fn((n) => ({ limit: n })),
  startAfter: jest.fn((doc) => ({ startAfter: doc })),
}));

jest.mock('../../src/lib/retry', () => ({
  retryWithBackoff: jest.fn((fn) => fn()),
}));

const firestore = require('firebase/firestore');

describe('courseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCoursesPaginated', () => {
    it('should fetch courses with pagination', async () => {
      const mockCourses = [
        {
          id: 'course1',
          data: () => ({
            title: 'Test Course 1',
            description: 'Description 1',
            published: true,
            track: 'coding',
            level: 'beginner',
            createdAt: { seconds: 1234567890 },
            updatedAt: { seconds: 1234567890 },
          }),
        },
        {
          id: 'course2',
          data: () => ({
            title: 'Test Course 2',
            description: 'Description 2',
            published: true,
            track: 'design',
            level: 'intermediate',
            createdAt: { seconds: 1234567890 },
            updatedAt: { seconds: 1234567890 },
          }),
        },
      ];

      firestore.getDocs.mockResolvedValueOnce({
        forEach: (callback: any) => {
          mockCourses.forEach((course, index) => callback(course, index));
        },
      });

      const result = await getCoursesPaginated({}, 12);

      expect(result.courses).toHaveLength(2);
      expect(result.courses[0].title).toBe('Test Course 1');
      expect(result.hasMore).toBe(false);
    });

    it('should indicate hasMore when more courses available', async () => {
      const mockCourses = Array.from({ length: 13 }, (_, i) => ({
        id: `course${i + 1}`,
        data: () => ({
          title: `Course ${i + 1}`,
          description: `Description ${i + 1}`,
          published: true,
          createdAt: { seconds: 1234567890 },
          updatedAt: { seconds: 1234567890 },
        }),
      }));

      firestore.getDocs.mockResolvedValueOnce({
        forEach: (callback: any) => {
          mockCourses.forEach((course, index) => callback(course, index));
        },
      });

      const result = await getCoursesPaginated({}, 12);

      expect(result.courses).toHaveLength(12);
      expect(result.hasMore).toBe(true);
    });

    it('should filter by track', async () => {
      const mockCourses = [
        {
          id: 'course1',
          data: () => ({
            title: 'Coding Course',
            description: 'Learn coding',
            published: true,
            track: 'coding',
            createdAt: { seconds: 1234567890 },
            updatedAt: { seconds: 1234567890 },
          }),
        },
      ];

      firestore.getDocs.mockResolvedValueOnce({
        forEach: (callback: any) => {
          mockCourses.forEach((course, index) => callback(course, index));
        },
      });

      const result = await getCoursesPaginated({ track: 'coding' }, 12);

      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].track).toBe('coding');
    });

    it('should filter by level', async () => {
      const mockCourses = [
        {
          id: 'course1',
          data: () => ({
            title: 'Beginner Course',
            description: 'For beginners',
            published: true,
            level: 'beginner',
            createdAt: { seconds: 1234567890 },
            updatedAt: { seconds: 1234567890 },
          }),
        },
      ];

      firestore.getDocs.mockResolvedValueOnce({
        forEach: (callback: any) => {
          mockCourses.forEach((course, index) => callback(course, index));
        },
      });

      const result = await getCoursesPaginated({ level: 'beginner' }, 12);

      expect(result.courses).toHaveLength(1);
    });

    it('should handle search query', async () => {
      const mockCourses = [
        {
          id: 'course1',
          data: () => ({
            title: 'React Development',
            description: 'Learn React',
            published: true,
            tags: ['react', 'javascript'],
            createdAt: { seconds: 1234567890 },
            updatedAt: { seconds: 1234567890 },
          }),
        },
        {
          id: 'course2',
          data: () => ({
            title: 'Python Basics',
            description: 'Learn Python',
            published: true,
            tags: ['python'],
            createdAt: { seconds: 1234567890 },
            updatedAt: { seconds: 1234567890 },
          }),
        },
      ];

      firestore.getDocs.mockResolvedValueOnce({
        forEach: (callback: any) => {
          mockCourses.forEach((course, index) => callback(course, index));
        },
      });

      const result = await getCoursesPaginated({ searchQuery: 'react' }, 12);

      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].title).toContain('React');
    });

    it('should throw EduTechError on failure', async () => {
      firestore.getDocs.mockRejectedValueOnce(new Error('Database error'));

      await expect(getCoursesPaginated({}, 12)).rejects.toThrow(EduTechError);
    });
  });

  describe('getCourse', () => {
    it('should fetch a single course by ID', async () => {
      const mockCourse = {
        id: 'course123',
        data: () => ({
          title: 'Test Course',
          description: 'Test Description',
          track: 'coding',
          level: 'beginner',
          createdAt: { seconds: 1234567890 },
          updatedAt: { seconds: 1234567890 },
        }),
        exists: () => true,
      };

      firestore.getDoc.mockResolvedValueOnce(mockCourse);

      const course = await getCourse('course123');

      expect(course).toBeDefined();
      expect(course?.title).toBe('Test Course');
      expect(course?.courseId).toBe('course123');
    });

    it('should return null for non-existent course', async () => {
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => false,
      });

      const course = await getCourse('nonexistent');

      expect(course).toBeNull();
    });

    it('should throw EduTechError on failure', async () => {
      firestore.getDoc.mockRejectedValueOnce(new Error('Database error'));

      await expect(getCourse('course123')).rejects.toThrow(EduTechError);
    });
  });

  describe('createCourse', () => {
    it('should create a new course', async () => {
      firestore.addDoc.mockResolvedValueOnce({ id: 'newCourse123' });

      const courseId = await createCourse({
        title: 'New Course',
        instructorId: 'instructor123',
        description: 'Course description',
        track: 'coding',
        level: 'beginner',
      });

      expect(courseId).toBe('newCourse123');
      expect(firestore.addDoc).toHaveBeenCalled();
    });

    it('should throw error when title is missing', async () => {
      await expect(
        createCourse({
          instructorId: 'instructor123',
        })
      ).rejects.toThrow('Title and instructorId are required');
    });

    it('should throw error when instructorId is missing', async () => {
      await expect(
        createCourse({
          title: 'New Course',
        })
      ).rejects.toThrow('Title and instructorId are required');
    });

    it('should set default values', async () => {
      let capturedData: any;
      firestore.addDoc.mockImplementation((ref, data) => {
        capturedData = data;
        return Promise.resolve({ id: 'newCourse123' });
      });

      await createCourse({
        title: 'Minimal Course',
        instructorId: 'instructor123',
      });

      expect(capturedData.description).toBe('');
      expect(capturedData.track).toBe('coding');
      expect(capturedData.level).toBe('beginner');
      expect(capturedData.tier).toBe('PREMIUM');
      expect(capturedData.published).toBe(false);
      expect(capturedData.enrollmentCount).toBe(0);
    });
  });

  describe('updateCourse', () => {
    it('should update course fields', async () => {
      firestore.updateDoc.mockResolvedValueOnce(undefined);

      await updateCourse('course123', {
        title: 'Updated Title',
        description: 'Updated description',
      });

      expect(firestore.updateDoc).toHaveBeenCalled();
    });

    it('should throw error for empty courseId', async () => {
      await expect(
        updateCourse('', { title: 'Updated Title' })
      ).rejects.toThrow('Course ID is required');
    });

    it('should handle update failure', async () => {
      firestore.updateDoc.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        updateCourse('course123', { title: 'Updated Title' })
      ).rejects.toThrow();
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course', async () => {
      firestore.deleteDoc.mockResolvedValueOnce(undefined);

      await deleteCourse('course123');

      expect(firestore.deleteDoc).toHaveBeenCalled();
    });

    it('should throw error for empty courseId', async () => {
      await expect(deleteCourse('')).rejects.toThrow('Course ID is required');
    });

    it('should handle deletion failure', async () => {
      firestore.deleteDoc.mockRejectedValueOnce(new Error('Deletion failed'));

      await expect(deleteCourse('course123')).rejects.toThrow();
    });
  });
});
