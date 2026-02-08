/**
 * Tests for progressService
 */

import {
  createEnrollment,
  getEnrollment,
  getUserEnrollments,
  markLessonComplete,
  updateLessonProgress,
  calculateCourseProgress,
} from '../../src/services/progressService';

// Mock Firebase
jest.mock('../../src/config/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(() => ({ id: 'enrollment123' })),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'TIMESTAMP'),
  arrayUnion: jest.fn((value) => ['ARRAY_UNION', value]),
  increment: jest.fn((value) => ({ increment: value })),
  query: jest.fn((...args) => args),
  where: jest.fn((field, op, value) => ({ field, op, value })),
  getDocs: jest.fn(),
}));

// Mock gamification service
jest.mock('../../src/services/gamificationService', () => ({
  awardXPForLessonCompletion: jest.fn(),
  checkAndAwardBadges: jest.fn(),
}));

const firestore = require('firebase/firestore');
const gamification = require('../../src/services/gamificationService');

describe('progressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEnrollment', () => {
    it('should create a new enrollment', async () => {
      firestore.setDoc.mockResolvedValueOnce(undefined);

      const enrollmentId = await createEnrollment(
        'user123',
        'course456',
        'module1',
        'lesson1'
      );

      expect(enrollmentId).toBe('enrollment123');
      expect(firestore.setDoc).toHaveBeenCalled();
    });

    it('should set initial enrollment data', async () => {
      let capturedData: any;
      firestore.setDoc.mockImplementation((ref, data) => {
        capturedData = data;
        return Promise.resolve();
      });

      await createEnrollment('user123', 'course456', 'module1', 'lesson1');

      expect(capturedData.userId).toBe('user123');
      expect(capturedData.courseId).toBe('course456');
      expect(capturedData.progress).toBe(0);
      expect(capturedData.completedLessons).toEqual([]);
      expect(capturedData.currentModuleId).toBe('module1');
      expect(capturedData.currentLessonId).toBe('lesson1');
      expect(capturedData.status).toBe('in-progress');
      expect(capturedData.totalTimeSpent).toBe(0);
    });

    it('should handle creation errors', async () => {
      firestore.setDoc.mockRejectedValueOnce(new Error('Firestore error'));

      await expect(
        createEnrollment('user123', 'course456', 'module1', 'lesson1')
      ).rejects.toThrow('Firestore error');
    });
  });

  describe('getEnrollment', () => {
    it('should fetch user enrollment for a course', async () => {
      const mockEnrollment = {
        id: 'enrollment123',
        data: () => ({
          userId: 'user123',
          courseId: 'course456',
          progress: 50,
          completedLessons: ['lesson1', 'lesson2'],
          status: 'in-progress',
        }),
      };

      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [mockEnrollment],
      });

      const enrollment = await getEnrollment('user123', 'course456');

      expect(enrollment).toBeDefined();
      expect(enrollment?.userId).toBe('user123');
      expect(enrollment?.courseId).toBe('course456');
      expect(enrollment?.progress).toBe(50);
    });

    it('should return null when enrollment not found', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const enrollment = await getEnrollment('user999', 'course999');

      expect(enrollment).toBeNull();
    });

    it('should handle fetch errors', async () => {
      firestore.getDocs.mockRejectedValueOnce(new Error('Database error'));

      await expect(getEnrollment('user123', 'course456')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getUserEnrollments', () => {
    it('should fetch all enrollments for a user', async () => {
      const mockEnrollments = [
        {
          id: 'enrollment1',
          data: () => ({
            userId: 'user123',
            courseId: 'course1',
            progress: 30,
          }),
        },
        {
          id: 'enrollment2',
          data: () => ({
            userId: 'user123',
            courseId: 'course2',
            progress: 60,
          }),
        },
      ];

      firestore.getDocs.mockResolvedValueOnce({
        docs: mockEnrollments,
      });

      const enrollments = await getUserEnrollments('user123');

      expect(enrollments).toHaveLength(2);
      expect(enrollments[0].courseId).toBe('course1');
      expect(enrollments[1].courseId).toBe('course2');
    });

    it('should return empty array when no enrollments', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        docs: [],
      });

      const enrollments = await getUserEnrollments('user999');

      expect(enrollments).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      firestore.getDocs.mockRejectedValueOnce(new Error('Database error'));

      await expect(getUserEnrollments('user123')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('markLessonComplete', () => {
    it('should mark lesson as complete and award XP', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'enrollment123',
            data: () => ({
              completedLessons: ['lesson1'],
              progress: 25,
            }),
          },
        ],
      });

      firestore.updateDoc.mockResolvedValueOnce(undefined);
      gamification.awardXPForLessonCompletion.mockResolvedValueOnce(undefined);
      gamification.checkAndAwardBadges.mockResolvedValueOnce(undefined);

      await markLessonComplete('user123', 'course456', 'lesson2', {
        title: 'Test Lesson',
        estimatedMinutes: 15,
      });

      expect(firestore.updateDoc).toHaveBeenCalled();
      expect(gamification.awardXPForLessonCompletion).toHaveBeenCalledWith(
        'user123',
        { title: 'Test Lesson', estimatedMinutes: 15 }
      );
      expect(gamification.checkAndAwardBadges).toHaveBeenCalledWith('user123');
    });

    it('should not award XP if lesson already completed', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'enrollment123',
            data: () => ({
              completedLessons: ['lesson1', 'lesson2'],
              progress: 50,
            }),
          },
        ],
      });

      await markLessonComplete('user123', 'course456', 'lesson2', {
        title: 'Test Lesson',
        estimatedMinutes: 15,
      });

      expect(firestore.updateDoc).not.toHaveBeenCalled();
      expect(gamification.awardXPForLessonCompletion).not.toHaveBeenCalled();
    });

    it('should handle completion errors', async () => {
      firestore.getDocs.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        markLessonComplete('user123', 'course456', 'lesson2', {
          title: 'Test Lesson',
          estimatedMinutes: 15,
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateLessonProgress', () => {
    it('should update lesson progress', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'enrollment123',
            data: () => ({
              progress: 25,
            }),
          },
        ],
      });

      firestore.updateDoc.mockResolvedValueOnce(undefined);

      await updateLessonProgress(
        'user123',
        'course456',
        'lesson2',
        'module1',
        75
      );

      expect(firestore.updateDoc).toHaveBeenCalled();
    });

    it('should update current module and lesson', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'enrollment123',
            data: () => ({}),
          },
        ],
      });

      let capturedData: any;
      firestore.updateDoc.mockImplementation((ref, data) => {
        capturedData = data;
        return Promise.resolve();
      });

      await updateLessonProgress(
        'user123',
        'course456',
        'lesson2',
        'module1',
        75
      );

      expect(capturedData.currentModuleId).toBe('module1');
      expect(capturedData.currentLessonId).toBe('lesson2');
    });

    it('should handle update errors', async () => {
      firestore.getDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{ id: 'enrollment123', data: () => ({}) }],
      });

      firestore.updateDoc.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        updateLessonProgress('user123', 'course456', 'lesson2', 'module1', 75)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('calculateCourseProgress', () => {
    it('should calculate progress from completed lessons', async () => {
      const totalLessons = 10;
      const completedLessons = ['lesson1', 'lesson2', 'lesson3'];

      const progress = calculateCourseProgress(completedLessons, totalLessons);

      expect(progress).toBe(30);
    });

    it('should return 0 when no lessons completed', async () => {
      const progress = calculateCourseProgress([], 10);

      expect(progress).toBe(0);
    });

    it('should return 100 when all lessons completed', async () => {
      const completedLessons = Array.from({ length: 10 }, (_, i) => `lesson${i + 1}`);

      const progress = calculateCourseProgress(completedLessons, 10);

      expect(progress).toBe(100);
    });

    it('should handle edge case of 0 total lessons', async () => {
      const progress = calculateCourseProgress([], 0);

      expect(progress).toBe(0);
    });

    it('should round progress to nearest integer', async () => {
      const completedLessons = ['lesson1'];

      const progress = calculateCourseProgress(completedLessons, 3);

      expect(progress).toBe(33); // 33.33... rounded
    });
  });
});
