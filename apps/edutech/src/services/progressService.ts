import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  increment,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Enrollment, EduTechUser, CourseLesson } from '@/types';

/**
 * Progress Tracking Service
 * Manages lesson completion, enrollment progress, and user stats
 */

// Create new enrollment
export async function createEnrollment(
  userId: string,
  courseId: string,
  firstModuleId: string,
  firstLessonId: string
): Promise<string> {
  try {
    const enrollmentRef = doc(
      collection(db, `edutech_users/${userId}/edutech_enrollments`)
    );

    const enrollment: Omit<Enrollment, 'enrollmentId'> = {
      userId,
      courseId,
      enrolledAt: serverTimestamp() as any,
      progress: 0,
      completedLessons: [],
      currentModuleId: firstModuleId,
      currentLessonId: firstLessonId,
      status: 'in-progress',
      lastAccessedAt: serverTimestamp() as any,
      totalTimeSpent: 0,
    };

    await setDoc(enrollmentRef, enrollment);
    return enrollmentRef.id;
  } catch (error) {
    console.error('Error creating enrollment:', error);
    throw error;
  }
}

// Get user's enrollment for a course
export async function getEnrollment(
  userId: string,
  courseId: string
): Promise<Enrollment | null> {
  try {
    const enrollmentsRef = collection(db, `edutech_users/${userId}/edutech_enrollments`);
    const q = query(enrollmentsRef, where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const enrollmentDoc = querySnapshot.docs[0];
    return {
      enrollmentId: enrollmentDoc.id,
      ...enrollmentDoc.data(),
    } as Enrollment;
  } catch (error) {
    console.error('Error getting enrollment:', error);
    throw error;
  }
}

// Get all enrollments for a user
export async function getUserEnrollments(userId: string): Promise<Enrollment[]> {
  try {
    const enrollmentsRef = collection(db, `edutech_users/${userId}/edutech_enrollments`);
    const querySnapshot = await getDocs(enrollmentsRef);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          enrollmentId: doc.id,
          ...doc.data(),
        } as Enrollment)
    );
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    throw error;
  }
}

// Mark lesson as complete
export async function completeLesson(
  userId: string,
  enrollmentId: string,
  lessonId: string,
  totalLessons: number
): Promise<void> {
  try {
    const enrollmentRef = doc(
      db,
      `edutech_users/${userId}/edutech_enrollments`,
      enrollmentId
    );

    // Get current enrollment to check if lesson already completed
    const enrollmentDoc = await getDoc(enrollmentRef);
    if (!enrollmentDoc.exists()) {
      throw new Error('Enrollment not found');
    }

    const enrollment = enrollmentDoc.data() as Enrollment;
    if (enrollment.completedLessons.includes(lessonId)) {
      // Lesson already completed
      return;
    }

    // Calculate new progress
    const newCompletedCount = enrollment.completedLessons.length + 1;
    const newProgress = Math.round((newCompletedCount / totalLessons) * 100);

    // Update enrollment
    await updateDoc(enrollmentRef, {
      completedLessons: arrayUnion(lessonId),
      progress: newProgress,
      lastAccessedAt: serverTimestamp(),
      ...(newProgress === 100 && {
        status: 'completed',
        completedAt: serverTimestamp(),
      }),
    });

    // Update user stats
    await updateUserStats(userId, newProgress === 100);
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
}

// Update current lesson (for resume functionality)
export async function updateCurrentLesson(
  userId: string,
  enrollmentId: string,
  moduleId: string,
  lessonId: string
): Promise<void> {
  try {
    const enrollmentRef = doc(
      db,
      `edutech_users/${userId}/edutech_enrollments`,
      enrollmentId
    );

    await updateDoc(enrollmentRef, {
      currentModuleId: moduleId,
      currentLessonId: lessonId,
      lastAccessedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating current lesson:', error);
    throw error;
  }
}

// Update user stats (completed courses, hours, streak)
async function updateUserStats(userId: string, courseCompleted: boolean): Promise<void> {
  try {
    const userRef = doc(db, 'edutech_users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as EduTechUser;
    const lastAccessDate = userData.updatedAt
      ? new Date(userData.updatedAt).toDateString()
      : null;
    const today = new Date().toDateString();

    // Calculate streak
    let newStreak = userData.currentStreak || 0;
    let newLongestStreak = userData.longestStreak || 0;

    if (lastAccessDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastAccessDate === yesterdayStr) {
        // Consecutive day
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }

      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
    }

    // Update user document
    await updateDoc(userRef, {
      ...(courseCompleted && { totalCoursesCompleted: increment(1) }),
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}

// Add time spent on a lesson
export async function addTimeSpent(
  userId: string,
  enrollmentId: string,
  minutesSpent: number
): Promise<void> {
  try {
    const enrollmentRef = doc(
      db,
      `edutech_users/${userId}/edutech_enrollments`,
      enrollmentId
    );

    await updateDoc(enrollmentRef, {
      totalTimeSpent: increment(minutesSpent),
    });

    // Update user's total hours learned
    const userRef = doc(db, 'edutech_users', userId);
    await updateDoc(userRef, {
      totalHoursLearned: increment(minutesSpent / 60),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding time spent:', error);
    throw error;
  }
}

// Check if user has access to a lesson (entitlement check)
export async function hasLessonAccess(
  userId: string,
  courseId: string,
  courseTier: 'FREE' | 'PREMIUM' | 'ENTERPRISE'
): Promise<boolean> {
  try {
    // FREE courses are always accessible
    if (courseTier === 'FREE') {
      return true;
    }

    // Check user's subscription tier
    // TODO: Integrate with @allied-impact/entitlements
    const userRef = doc(db, 'edutech_users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    // For now, return false for premium (will integrate billing later)
    return false;
  } catch (error) {
    console.error('Error checking lesson access:', error);
    return false;
  }
}

// Get user learning stats
export async function getUserLearningStats(userId: string) {
  try {
    const userRef = doc(db, 'edutech_users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as EduTechUser;

    // Get enrollments
    const enrollments = await getUserEnrollments(userId);

    // Get certificates count
    const certificatesRef = collection(db, 'edutech_certificates');
    const certQuery = query(certificatesRef, where('userId', '==', userId));
    const certSnapshot = await getDocs(certQuery);

    return {
      totalCoursesCompleted: userData.totalCoursesCompleted || 0,
      totalHoursLearned: Math.round(userData.totalHoursLearned || 0),
      currentStreak: userData.currentStreak || 0,
      longestStreak: userData.longestStreak || 0,
      certificatesEarned: certSnapshot.size,
      totalEnrollments: enrollments.length,
      inProgressCourses: enrollments.filter((e) => e.status === 'in-progress').length,
    };
  } catch (error) {
    console.error('Error getting learning stats:', error);
    throw error;
  }
}
