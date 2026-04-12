/**
 * Instructor Service
 * 
 * Manages instructor operations in the EduTech platform.
 * Instructors can create and manage courses.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course } from '../types';

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

const instructorsRef = collection(db, 'edutech_instructors');
const coursesRef = collection(db, 'edutech_courses');

// ============================================================================
// TYPES
// ============================================================================

export interface InstructorProfile {
  instructorId: string;
  userId: string;
  displayName: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string;
  expertise: string[];
  coursesCreated: number;
  totalStudents: number;
  rating: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CourseWithStats extends Course {
  enrollments: number;
  revenue: number;
  completionRate: number;
  lastUpdated: Timestamp | string;
}

export interface InstructorStats {
  instructorId: string;
  activeCourses: number;
  totalCourses?: number;
  completionRate: number;
  totalRevenue: number;
  avgRating: number;
  totalStudents?: number;
  totalReviews?: number;
}

// ============================================================================
// INSTRUCTOR PROFILE
// ============================================================================

/**
 * Get instructor profile
 */
export async function getInstructorProfile(
  instructorId: string
): Promise<InstructorProfile | null> {
  try {
    const docRef = doc(instructorsRef, instructorId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      instructorId: docSnap.id,
      ...docSnap.data(),
    } as InstructorProfile;
  } catch (error) {
    console.error('Error getting instructor profile:', error);
    throw error;
  }
}

// ============================================================================
// INSTRUCTOR COURSES
// ============================================================================

/**
 * Get all courses created by an instructor
 */
export async function getInstructorCourses(
  instructorId: string
): Promise<CourseWithStats[]> {
  try {
    const q = query(
      coursesRef,
      where('contentAdminId', '==', instructorId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const courses: CourseWithStats[] = [];
    
    querySnapshot.forEach((doc) => {
      courses.push({
        courseId: doc.id,
        ...doc.data(),
        enrollments: doc.data().enrollmentCount || 0,
        revenue: 0, // Would need payment data
        completionRate: 0, // Would need completion data
        lastUpdated: doc.data().updatedAt || new Date(),
      } as CourseWithStats);
    });
    
    return courses;
  } catch (error) {
    console.error('Error getting instructor courses:', error);
    throw error;
  }
}

// ============================================================================
// INSTRUCTOR STATISTICS
// ============================================================================

/**
 * Get instructor statistics and analytics
 */
export async function getInstructorStats(
  instructorId: string
): Promise<InstructorStats> {
  try {
    const courses = await getInstructorCourses(instructorId);
    
    const totalEnrollments = courses.reduce((sum, course) => sum + (course.enrollments || 0), 0);
    
    const stats: InstructorStats = {
      instructorId,
      activeCourses: courses.length,
      totalCourses: courses.length,
      completionRate: courses.length > 0
        ? courses.reduce((sum, course) => sum + (course.completionRate || 0), 0) / courses.length
        : 0,
      totalRevenue: courses.reduce((sum, course) => sum + (course.revenue || 0), 0),
      avgRating: courses.length > 0
        ? courses.reduce((sum, course) => sum + ((course as any).rating || 0), 0) / courses.length
        : 0,
      totalStudents: totalEnrollments,
      totalReviews: courses.reduce((sum, course) => sum + ((course as any).reviewCount || 0), 0),
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting instructor stats:', error);
    throw error;
  }
}
