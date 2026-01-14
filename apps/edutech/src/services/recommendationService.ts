import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Course, Enrollment } from '@/types';

/**
 * Recommendation Service
 * 
 * Provides personalized course recommendations using rule-based logic and Firestore queries.
 * No external ML/recommendation engines - all Firebase-based for zero extra cost.
 */

// Get courses related to what user is currently enrolled in (same track/level/tags)
export async function getRelatedCourses(
  enrolledCourseIds: string[],
  userTrack?: string,
  maxResults: number = 6
): Promise<Course[]> {
  try {
    if (enrolledCourseIds.length === 0 && !userTrack) {
      return [];
    }

    const coursesRef = collection(db, 'edutech_courses');
    
    // Build query based on available data
    let q;
    if (userTrack) {
      q = query(
        coursesRef,
        where('published', '==', true),
        where('track', '==', userTrack),
        orderBy('enrollmentCount', 'desc'),
        limit(maxResults + enrolledCourseIds.length) // Get extra to filter out enrolled
      );
    } else {
      q = query(
        coursesRef,
        where('published', '==', true),
        orderBy('enrollmentCount', 'desc'),
        limit(maxResults + enrolledCourseIds.length)
      );
    }

    const snapshot = await getDocs(q);
    const courses = snapshot.docs
      .map(doc => ({
        courseId: doc.id,
        ...doc.data(),
      } as Course))
      .filter(course => !enrolledCourseIds.includes(course.courseId))
      .slice(0, maxResults);

    return courses;
  } catch (error) {
    console.error('Error getting related courses:', error);
    return [];
  }
}

// Get trending courses (most enrollments in recent period)
export async function getTrendingCourses(
  track?: string,
  maxResults: number = 6
): Promise<Course[]> {
  try {
    const coursesRef = collection(db, 'edutech_courses');
    
    // Query published courses sorted by enrollment count
    let q;
    if (track) {
      q = query(
        coursesRef,
        where('published', '==', true),
        where('track', '==', track),
        orderBy('enrollmentCount', 'desc'),
        limit(maxResults)
      );
    } else {
      q = query(
        coursesRef,
        where('published', '==', true),
        orderBy('enrollmentCount', 'desc'),
        limit(maxResults)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      courseId: doc.id,
      ...doc.data(),
    } as Course));
  } catch (error) {
    console.error('Error getting trending courses:', error);
    return [];
  }
}

// Get highly rated courses
export async function getTopRatedCourses(
  track?: string,
  maxResults: number = 6
): Promise<Course[]> {
  try {
    const coursesRef = collection(db, 'edutech_courses');
    
    let q;
    if (track) {
      q = query(
        coursesRef,
        where('published', '==', true),
        where('track', '==', track),
        where('reviewCount', '>', 0),
        orderBy('reviewCount', 'desc'),
        orderBy('rating', 'desc'),
        limit(maxResults)
      );
    } else {
      q = query(
        coursesRef,
        where('published', '==', true),
        where('reviewCount', '>', 0),
        orderBy('reviewCount', 'desc'),
        orderBy('rating', 'desc'),
        limit(maxResults)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      courseId: doc.id,
      ...doc.data(),
    } as Course));
  } catch (error) {
    console.error('Error getting top rated courses:', error);
    return [];
  }
}

// Get beginner-friendly courses for new users
export async function getBeginnerCourses(
  track?: string,
  maxResults: number = 6
): Promise<Course[]> {
  try {
    const coursesRef = collection(db, 'edutech_courses');
    
    let q;
    if (track) {
      q = query(
        coursesRef,
        where('published', '==', true),
        where('track', '==', track),
        where('level', '==', 'beginner'),
        orderBy('enrollmentCount', 'desc'),
        limit(maxResults)
      );
    } else {
      q = query(
        coursesRef,
        where('published', '==', true),
        where('level', '==', 'beginner'),
        orderBy('enrollmentCount', 'desc'),
        limit(maxResults)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      courseId: doc.id,
      ...doc.data(),
    } as Course));
  } catch (error) {
    console.error('Error getting beginner courses:', error);
    return [];
  }
}

// Get personalized feed for a user based on their profile and enrollments
export async function getPersonalizedFeed(
  userId: string,
  enrolledCourseIds: string[],
  userTrack?: string,
  totalCoursesCompleted: number = 0
): Promise<{
  recommended: Course[];
  trending: Course[];
  topRated: Course[];
}> {
  try {
    // If user is new (0 courses completed), show beginner courses
    if (totalCoursesCompleted === 0) {
      const [recommended, trending, topRated] = await Promise.all([
        getBeginnerCourses(userTrack, 6),
        getTrendingCourses(userTrack, 6),
        getTopRatedCourses(userTrack, 6),
      ]);

      return { recommended, trending, topRated };
    }

    // For experienced users, show related courses + trending + top rated
    const [recommended, trending, topRated] = await Promise.all([
      getRelatedCourses(enrolledCourseIds, userTrack, 6),
      getTrendingCourses(userTrack, 6),
      getTopRatedCourses(userTrack, 6),
    ]);

    return { recommended, trending, topRated };
  } catch (error) {
    console.error('Error getting personalized feed:', error);
    return {
      recommended: [],
      trending: [],
      topRated: [],
    };
  }
}

// Get "next step" courses for a user (intermediate/advanced after completing beginner)
export async function getNextStepCourses(
  userTrack: string,
  currentLevel: 'beginner' | 'intermediate' | 'advanced',
  maxResults: number = 6
): Promise<Course[]> {
  try {
    const nextLevel = 
      currentLevel === 'beginner' ? 'intermediate' :
      currentLevel === 'intermediate' ? 'advanced' : null;

    if (!nextLevel) {
      return [];
    }

    const coursesRef = collection(db, 'edutech_courses');
    const q = query(
      coursesRef,
      where('published', '==', true),
      where('track', '==', userTrack),
      where('level', '==', nextLevel),
      orderBy('enrollmentCount', 'desc'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      courseId: doc.id,
      ...doc.data(),
    } as Course));
  } catch (error) {
    console.error('Error getting next step courses:', error);
    return [];
  }
}
