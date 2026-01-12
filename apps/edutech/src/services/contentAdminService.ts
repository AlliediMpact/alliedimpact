/**
 * Content Admin Service
 * 
 * Manages centralized course creation and management for EduTech platform.
 * Content Admins are Allied iMpact staff who create ALL courses.
 * All courses are owned by the platform, not by individuals.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Course,
  CourseModule,
  CourseLesson,
  ContentAdminProfile,
  CourseTrack,
  CourseLevel,
  SubscriptionTier,
} from '../types';

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

const coursesRef = collection(db, 'edutech_courses');
const adminsRef = collection(db, 'edutech_content_admins');

// ============================================================================
// CONTENT ADMIN PROFILE
// ============================================================================

/**
 * Get content admin profile
 */
export async function getContentAdminProfile(
  userId: string
): Promise<ContentAdminProfile | null> {
  try {
    const docRef = doc(adminsRef, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), adminId: docSnap.id } as ContentAdminProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching content admin profile:', error);
    throw error;
  }
}

/**
 * Update content admin stats
 */
export async function updateContentAdminStats(
  adminId: string,
  stats: Partial<ContentAdminProfile>
): Promise<void> {
  try {
    const docRef = doc(adminsRef, adminId);
    await updateDoc(docRef, {
      ...stats,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating content admin stats:', error);
    throw error;
  }
}

// ============================================================================
// COURSE CREATION & MANAGEMENT
// ============================================================================

/**
 * Create a new course (platform-owned, created by Content Admin)
 */
export async function createCourse(
  contentAdminId: string,
  courseData: {
    title: string;
    description: string;
    shortDescription: string;
    track: CourseTrack;
    category: string;
    level: CourseLevel;
    tier: SubscriptionTier;
    tags: string[];
    estimatedHours: number;
    thumbnailUrl: string;
  }
): Promise<string> {
  try {
    const newCourse: Omit<Course, 'courseId'> = {
      ...courseData,
      modules: [],
      
      // ALL COURSES ARE PLATFORM-OWNED
      createdBy: 'platform',
      contentAdminId,
      
      // Initial stats
      enrollmentCount: 0,
      rating: 0,
      reviewCount: 0,
      
      // Status
      published: false,
      status: 'draft',
      
      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(coursesRef, newCourse);
    
    // Update content admin stats
    const profile = await getContentAdminProfile(contentAdminId);
    if (profile) {
      await updateContentAdminStats(contentAdminId, {
        coursesCreated: (profile.coursesCreated || 0) + 1,
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
}

/**
 * Update course details
 */
export async function updateCourse(
  courseId: string,
  updates: Partial<Course>
): Promise<void> {
  try {
    const docRef = doc(coursesRef, courseId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<void> {
  try {
    const docRef = doc(coursesRef, courseId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
}

/**
 * Publish a course (make it available to learners)
 */
export async function publishCourse(courseId: string): Promise<void> {
  try {
    const docRef = doc(coursesRef, courseId);
    await updateDoc(docRef, {
      published: true,
      status: 'published',
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error publishing course:', error);
    throw error;
  }
}

/**
 * Unpublish a course (hide from learners)
 */
export async function unpublishCourse(courseId: string): Promise<void> {
  try {
    const docRef = doc(coursesRef, courseId);
    await updateDoc(docRef, {
      published: false,
      status: 'draft',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error unpublishing course:', error);
    throw error;
  }
}

/**
 * Archive a course (keep for historical purposes but not editable)
 */
export async function archiveCourse(courseId: string): Promise<void> {
  try {
    const docRef = doc(coursesRef, courseId);
    await updateDoc(docRef, {
      published: false,
      status: 'archived',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error archiving course:', error);
    throw error;
  }
}

// ============================================================================
// MODULE MANAGEMENT
// ============================================================================

/**
 * Add a module to a course
 */
export async function addModule(
  courseId: string,
  contentAdminId: string,
  moduleData: {
    title: string;
    description: string;
    order: number;
  }
): Promise<void> {
  try {
    const courseRef = doc(coursesRef, courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error('Course not found');
    }

    const course = { ...courseSnap.data(), courseId: courseSnap.id } as Course;
    const moduleId = `module_${Date.now()}`;

    const newModule: CourseModule = {
      moduleId,
      ...moduleData,
      lessons: [],
      durationMinutes: 0,
    };

    course.modules.push(newModule);

    await updateDoc(courseRef, {
      modules: course.modules,
      updatedAt: Timestamp.now(),
    });

    // Update content admin stats
    const profile = await getContentAdminProfile(contentAdminId);
    if (profile) {
      await updateContentAdminStats(contentAdminId, {
        modulesCreated: (profile.modulesCreated || 0) + 1,
      });
    }
  } catch (error) {
    console.error('Error adding module:', error);
    throw error;
  }
}

/**
 * Update a module
 */
export async function updateModule(
  courseId: string,
  moduleId: string,
  updates: Partial<CourseModule>
): Promise<void> {
  try {
    const courseRef = doc(coursesRef, courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error('Course not found');
    }

    const course = { ...courseSnap.data(), courseId: courseSnap.id } as Course;
    const moduleIndex = course.modules.findIndex((m) => m.moduleId === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    course.modules[moduleIndex] = {
      ...course.modules[moduleIndex],
      ...updates,
    };

    await updateDoc(courseRef, {
      modules: course.modules,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
}

/**
 * Delete a module
 */
export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
  try {
    const courseRef = doc(coursesRef, courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error('Course not found');
    }

    const course = { ...courseSnap.data(), courseId: courseSnap.id } as Course;
    course.modules = course.modules.filter((m) => m.moduleId !== moduleId);

    await updateDoc(courseRef, {
      modules: course.modules,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    throw error;
  }
}

// ============================================================================
// LESSON MANAGEMENT
// ============================================================================

/**
 * Add a lesson to a module
 */
export async function addLesson(
  courseId: string,
  moduleId: string,
  contentAdminId: string,
  lessonData: {
    title: string;
    type: 'video' | 'reading' | 'quiz' | 'coding-exercise';
    content: string;
    durationMinutes: number;
    order: number;
  }
): Promise<void> {
  try {
    const courseRef = doc(coursesRef, courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error('Course not found');
    }

    const course = { ...courseSnap.data(), courseId: courseSnap.id } as Course;
    const moduleIndex = course.modules.findIndex((m) => m.moduleId === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    const lessonId = `lesson_${Date.now()}`;
    const newLesson: CourseLesson = {
      lessonId,
      ...lessonData,
    };

    course.modules[moduleIndex].lessons.push(newLesson);

    // Update module duration
    course.modules[moduleIndex].durationMinutes += lessonData.durationMinutes;

    await updateDoc(courseRef, {
      modules: course.modules,
      updatedAt: Timestamp.now(),
    });

    // Update content admin stats
    const profile = await getContentAdminProfile(contentAdminId);
    if (profile) {
      await updateContentAdminStats(contentAdminId, {
        lessonsCreated: (profile.lessonsCreated || 0) + 1,
      });
    }
  } catch (error) {
    console.error('Error adding lesson:', error);
    throw error;
  }
}

/**
 * Update a lesson
 */
export async function updateLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  updates: Partial<CourseLesson>
): Promise<void> {
  try {
    const courseRef = doc(coursesRef, courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error('Course not found');
    }

    const course = { ...courseSnap.data(), courseId: courseSnap.id } as Course;
    const moduleIndex = course.modules.findIndex((m) => m.moduleId === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    const lessonIndex = course.modules[moduleIndex].lessons.findIndex(
      (l) => l.lessonId === lessonId
    );

    if (lessonIndex === -1) {
      throw new Error('Lesson not found');
    }

    const oldDuration = course.modules[moduleIndex].lessons[lessonIndex].durationMinutes;

    course.modules[moduleIndex].lessons[lessonIndex] = {
      ...course.modules[moduleIndex].lessons[lessonIndex],
      ...updates,
    };

    // Update module duration if lesson duration changed
    if (updates.durationMinutes) {
      course.modules[moduleIndex].durationMinutes += updates.durationMinutes - oldDuration;
    }

    await updateDoc(courseRef, {
      modules: course.modules,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
}

/**
 * Delete a lesson
 */
export async function deleteLesson(
  courseId: string,
  moduleId: string,
  lessonId: string
): Promise<void> {
  try {
    const courseRef = doc(coursesRef, courseId);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
      throw new Error('Course not found');
    }

    const course = { ...courseSnap.data(), courseId: courseSnap.id } as Course;
    const moduleIndex = course.modules.findIndex((m) => m.moduleId === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    const lessonIndex = course.modules[moduleIndex].lessons.findIndex(
      (l) => l.lessonId === lessonId
    );

    if (lessonIndex !== -1) {
      const lessonDuration = course.modules[moduleIndex].lessons[lessonIndex].durationMinutes;
      course.modules[moduleIndex].lessons.splice(lessonIndex, 1);
      course.modules[moduleIndex].durationMinutes -= lessonDuration;
    }

    await updateDoc(courseRef, {
      modules: course.modules,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
}

// ============================================================================
// COURSE RETRIEVAL & SEARCH
// ============================================================================

/**
 * Get all courses (for content admin management)
 */
export async function getAllCourses(status?: 'draft' | 'published' | 'archived'): Promise<Course[]> {
  try {
    let q = query(coursesRef, orderBy('createdAt', 'desc'));

    if (status) {
      q = query(coursesRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const courses: Course[] = [];

    querySnapshot.forEach((doc) => {
      courses.push({ ...doc.data(), courseId: doc.id } as Course);
    });

    return courses;
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw error;
  }
}

/**
 * Get courses by track
 */
export async function getCoursesByTrack(track: CourseTrack): Promise<Course[]> {
  try {
    const q = query(
      coursesRef,
      where('track', '==', track),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const courses: Course[] = [];

    querySnapshot.forEach((doc) => {
      courses.push({ ...doc.data(), courseId: doc.id } as Course);
    });

    return courses;
  } catch (error) {
    console.error('Error fetching courses by track:', error);
    throw error;
  }
}

/**
 * Get course by ID
 */
export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const docRef = doc(coursesRef, courseId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), courseId: docSnap.id } as Course;
    }
    return null;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get content admin dashboard stats
 */
export async function getContentAdminStats(adminId: string): Promise<{
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalModules: number;
  totalLessons: number;
  totalEnrollments: number;
}> {
  try {
    const courses = await getAllCourses();
    const adminCourses = courses.filter((c) => c.contentAdminId === adminId);

    let totalModules = 0;
    let totalLessons = 0;
    let totalEnrollments = 0;

    adminCourses.forEach((course) => {
      totalModules += course.modules.length;
      course.modules.forEach((module) => {
        totalLessons += module.lessons.length;
      });
      totalEnrollments += course.enrollmentCount || 0;
    });

    return {
      totalCourses: adminCourses.length,
      publishedCourses: adminCourses.filter((c) => c.published).length,
      draftCourses: adminCourses.filter((c) => !c.published).length,
      totalModules,
      totalLessons,
      totalEnrollments,
    };
  } catch (error) {
    console.error('Error calculating content admin stats:', error);
    throw error;
  }
}
