import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Course, CourseModule } from '@/types';

// Collection name
const COURSES_COLLECTION = 'edutech_courses';

/**
 * Get all courses with optional filtering
 */
export async function getCourses(filters?: {
  track?: string;
  level?: string;
  category?: string;
  tier?: string;
  published?: boolean;
}): Promise<Course[]> {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    let q = query(coursesRef, orderBy('createdAt', 'desc'));

    // Apply filters
    if (filters?.track) {
      q = query(coursesRef, where('track', '==', filters.track));
    }
    if (filters?.level) {
      q = query(coursesRef, where('level', '==', filters.level));
    }
    if (filters?.tier) {
      q = query(coursesRef, where('tier', '==', filters.tier));
    }
    if (filters?.published !== undefined) {
      q = query(coursesRef, where('published', '==', filters.published));
    }

    const querySnapshot = await getDocs(q);
    const courses: Course[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      courses.push({
        courseId: doc.id,
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
      } as Course);
    });

    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

/**
 * Get a single course by ID
 */
export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      return null;
    }

    const data = courseSnap.data();
    return {
      courseId: courseSnap.id,
      ...data,
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt || Timestamp.now(),
    } as Course;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
}

/**
 * Create a new course
 */
export async function createCourse(courseData: Partial<Course>): Promise<string> {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);

    // Validate required fields
    if (!courseData.title || !courseData.instructorId) {
      throw new Error('Title and instructorId are required');
    }

    const now = Timestamp.now();

    const newCourse = {
      title: courseData.title,
      description: courseData.description || '',
      shortDescription: courseData.shortDescription || '',
      track: courseData.track || 'coding',
      category: courseData.category || '',
      level: courseData.level || 'beginner',
      tier: courseData.tier || 'PREMIUM',
      tags: courseData.tags || [],
      modules: courseData.modules || [],
      instructorId: courseData.instructorId,
      instructorName: courseData.instructorName || 'Unknown',
      estimatedHours: courseData.estimatedHours || 0,
      thumbnailUrl: courseData.thumbnailUrl || '',
      published: courseData.published || false,
      status: courseData.status || 'draft',
      enrollmentCount: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: courseData.published ? now : null,
    };

    const docRef = await addDoc(coursesRef, newCourse);
    return docRef.id;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}

/**
 * Update an existing course
 */
export async function updateCourse(
  courseId: string,
  updates: Partial<Course>
): Promise<void> {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);

    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    // Remove fields that shouldn't be updated this way
    delete updateData.courseId;
    delete updateData.createdAt;
    delete updateData.enrollmentCount;
    delete updateData.rating;
    delete updateData.reviewCount;

    // If publishing, set publishedAt
    if (updates.published === true && !updates.publishedAt) {
      updateData.publishedAt = Timestamp.now();
    }

    await updateDoc(courseRef, updateData);
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

/**
 * Delete a course (should only be used by instructors/admins)
 */
export async function deleteCourseById(courseId: string): Promise<void> {
  try {
    const courseRef = doc(db, COURSES_COLLECTION, courseId);
    await deleteDoc(courseRef);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

/**
 * Get featured courses (high ratings, popular)
 */
export async function getFeaturedCourses(maxResults: number = 6): Promise<Course[]> {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    const q = query(
      coursesRef,
      where('published', '==', true),
      orderBy('rating', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const courses: Course[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      courses.push({
        courseId: doc.id,
        ...data,
      } as Course);
    });

    return courses;
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    throw error;
  }
}

/**
 * Search courses by title or description
 */
export async function searchCourses(searchTerm: string): Promise<Course[]> {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that fetches all courses and filters client-side
    // For production, consider using Algolia or similar service

    const courses = await getCourses({ published: true });

    const searchLower = searchTerm.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  } catch (error) {
    console.error('Error searching courses:', error);
    throw error;
  }
}

/**
 * Get courses by instructor
 */
export async function getCoursesByInstructor(instructorId: string): Promise<Course[]> {
  try {
    const coursesRef = collection(db, COURSES_COLLECTION);
    const q = query(
      coursesRef,
      where('instructorId', '==', instructorId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const courses: Course[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      courses.push({
        courseId: doc.id,
        ...data,
      } as Course);
    });

    return courses;
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    throw error;
  }
}
