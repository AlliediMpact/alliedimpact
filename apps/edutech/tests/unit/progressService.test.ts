/**
 * Tests for progressService
 */

import {
  createEnrollment,
  getEnrollment,
  getUserEnrollments,
  completeLesson,
  updateCurrentLesson,
  addTimeSpent,
} from '@/services/progressService';

// Mock Firebase
jest.mock('@/config/firebase', () => ({
  db: {},
}));

// Mock gamification service
const mockAwardXPForLessonCompletion = jest.fn();
const mockCheckAndAwardBadges = jest.fn();

jest.mock('@/services/gamificationService', () => ({
  awardXPForLessonCompletion: (...args: any[]) => mockAwardXPForLessonCompletion(...args),
  checkAndAwardBadges: (...args: any[]) => mockCheckAndAwardBadges(...args),
}));

// Mock Firestore functions
const mockSetDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockQuery = jest.fn();
const mockWhere = jest.fn();
const mockArrayUnion = jest.fn((value) => ({ _arrayUnion: value }));
const mockIncrement = jest.fn((value) => ({ _increment: value }));
const mockServerTimestamp = jest.fn(() => ({ _type: 'timestamp' }));

jest.mock('firebase/firestore', () => ({
  collection: (...args: any[]) => mockCollection(...args),
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  where: (...args: any[]) => mockWhere(...args),
  arrayUnion: (value: any) => mockArrayUnion(value),
  increment: (value: any) => mockIncrement(value),
  serverTimestamp: () => mockServerTimestamp(),
}));

describe('progressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockReturnValue('mock-collection');
    mockDoc.mockReturnValue('mock-doc');
    mockQuery.mockReturnValue('mock-query');
    mockWhere.mockReturnValue('mock-where');
  });

  describe('createEnrollment', () => {
    it('should create new enrollment with correct fields', async () => {
      mockSetDoc.mockResolvedValue(undefined);
      mockDoc.mockReturnValue({ id: 'enrollment123' });

      const enrollmentId = await createEnrollment('user123', 'course456', 'module1', 'lesson1');

      expect(enrollmentId).toBe('enrollment123');
      expect(mockSetDoc).toHaveBeenCalledWith('mock-doc', {
        userId: 'user123',
        courseId: 'course456',
        enrolledAt: { _type: 'timestamp' },
        progress: 0,
        completedLessons: [],
        currentModuleId: 'module1',
        currentLessonId: 'lesson1',
        status: 'in-progress',
        lastAccessedAt: { _type: 'timestamp' },
        totalTimeSpent: 0,
      });
    });

    it('should initialize progress to zero', async () => {
      mockSetDoc.mockResolvedValue(undefined);
      mockDoc.mockReturnValue({ id: 'enrollment456' });

      await createEnrollment('user456', 'course789', 'module2', 'lesson2');

      expect(mockSetDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          progress: 0,
          completedLessons: [],
          totalTimeSpent: 0,
        })
      );
    });

    it('should throw error on failure', async () => {
      mockSetDoc.mockRejectedValue(new Error('Database error'));

      await expect(createEnrollment('user123', 'course456', 'module1', 'lesson1')).rejects.toThrow();
    });
  });

  describe('getEnrollment', () => {
    it('should return enrollment when found', async () => {
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'enrollment123',
            data: () => ({
              userId: 'user123',
              courseId: 'course456',
              progress: 50,
              completedLessons: ['lesson1', 'lesson2'],
            }),
          },
        ],
      });

      const result = await getEnrollment('user123', 'course456');

      expect(result).toBeDefined();
      expect(result?.enrollmentId).toBe('enrollment123');
      expect(result?.progress).toBe(50);
    });

    it('should return null when not found', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await getEnrollment('user999', 'course999');

      expect(result).toBeNull();
    });

    it('should query by userId and courseId', async () => {
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] });

      await getEnrollment('user123', 'course456');

      expect(mockWhere).toHaveBeenCalledWith('courseId', '==', 'course456');
    });

    it('should throw error on failure', async () => {
      mockGetDocs.mockRejectedValue(new Error('Query failed'));

      await expect(getEnrollment('user123', 'course456')).rejects.toThrow();
    });
  });

  describe('getUserEnrollments', () => {
    it('should return all user enrollments', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          {
            id: 'enroll1',
            data: () => ({ courseId: 'course1', progress: 30 }),
          },
          {
            id: 'enroll2',
            data: () => ({ courseId: 'course2', progress: 70 }),
          },
        ],
      });

      const result = await getUserEnrollments('user123');

      expect(result).toHaveLength(2);
      expect(result[0].enrollmentId).toBe('enroll1');
      expect(result[1].enrollmentId).toBe('enroll2');
    });

    it('should return empty array when no enrollments', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [],
      });

      const result = await getUserEnrollments('user999');

      expect(result).toEqual([]);
    });

    it('should throw error on failure', async () => {
      mockGetDocs.mockRejectedValue(new Error('Database error'));

      await expect(getUserEnrollments('user123')).rejects.toThrow();
    });
  });

  describe('completeLesson', () => {
    it('should mark lesson as complete and update progress', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          completedLessons: [],
        }),
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      mockAwardXPForLessonCompletion.mockResolvedValue(undefined);

      await completeLesson('user123', 'enrollment123', 'lesson1', 10);

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', {
        completedLessons: { _arrayUnion: 'lesson1' },
        progress: 10,
        lastAccessedAt: { _type: 'timestamp' },
      });
    });

    it('should calculate correct progress percentage', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          completedLessons: ['lesson1', 'lesson2'],
        }),
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      mockAwardXPForLessonCompletion.mockResolvedValue(undefined);

      await completeLesson('user456', 'enrollment456', 'lesson3', 10);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          progress: 30, // 3 out of 10 = 30%
        })
      );
    });

    it('should mark course as completed when progress reaches 100%', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          completedLessons: ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5', 'lesson6', 'lesson7', 'lesson8', 'lesson9'],
        }),
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      mockAwardXPForLessonCompletion.mockResolvedValue(undefined);

      await completeLesson('user789', 'enrollment789', 'lesson10', 10);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          progress: 100,
          status: 'completed',
          completedAt: { _type: 'timestamp' },
        })
      );
    });

    it('should not mark lesson as complete if already completed', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          completedLessons: ['lesson1'],
        }),
      });

      await completeLesson('user123', 'enrollment123', 'lesson1', 10);

      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('should award XP for lesson completion', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          completedLessons: [],
        }),
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      mockAwardXPForLessonCompletion.mockResolvedValue(undefined);

      await completeLesson('user123', 'enrollment123', 'lesson1', 10);

      expect(mockAwardXPForLessonCompletion).toHaveBeenCalledWith('user123');
    });

    it('should throw error when enrollment not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      await expect(completeLesson('user123', 'enrollment999', 'lesson1', 10)).rejects.toThrow(
        'Enrollment not found'
      );
    });
  });

  describe('updateCurrentLesson', () => {
    it('should update current module and lesson', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateCurrentLesson('user123', 'enrollment123', 'module2', 'lesson5');

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-doc', {
        currentModuleId: 'module2',
        currentLessonId: 'lesson5',
        lastAccessedAt: { _type: 'timestamp' },
      });
    });

    it('should update lastAccessedAt timestamp', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await updateCurrentLesson('user456', 'enrollment456', 'module3', 'lesson9');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          lastAccessedAt: { _type: 'timestamp' },
        })
      );
    });

    it('should throw error on failure', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      await expect(updateCurrentLesson('user123', 'enrollment123', 'module1', 'lesson1')).rejects.toThrow();
    });
  });

  describe('addTimeSpent', () => {
    it('should increment time spent on enrollment and user stats', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await addTimeSpent('user123', 'enrollment123', 60);

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          totalTimeSpent: { _increment: 60 },
        })
      );
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          totalHoursLearned: { _increment: 1 },
        })
      );
    });

    it('should convert minutes to hours for user stats', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await addTimeSpent('user456', 'enrollment456', 120);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          totalHoursLearned: { _increment: 2 },
        })
      );
    });

    it('should throw error on failure', async () => {
      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      await expect(addTimeSpent('user123', 'enrollment123', 30)).rejects.toThrow();
    });
  });
});
