import {
  collection,
  query,
  where,
  orderBy,
  limit as limitQuery,
  getDocs,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Course, CourseTrack, CourseLevel, SubscriptionTier } from '@/types';

/**
 * Enhanced Search Service
 * 
 * Provides course search functionality using Firestore queries and indexes.
 * No external search service (Algolia) - all Firebase-based for zero cost.
 * 
 * IMPORTANT: Firestore indexes must be created for these queries.
 * Run: firebase deploy --only firestore:indexes
 */

export interface SearchFilters {
  track?: CourseTrack | 'all';
  level?: CourseLevel | 'all';
  tier?: SubscriptionTier | 'all';
  searchTerm?: string;
}

export interface SearchOptions {
  filters?: SearchFilters;
  sortBy?: 'enrollmentCount' | 'rating' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// Search courses with filters and sorting
export async function searchCourses(options: SearchOptions = {}): Promise<Course[]> {
  try {
    const {
      filters = {},
      sortBy = 'enrollmentCount',
      sortOrder = 'desc',
      limit = 50,
    } = options;

    const coursesRef = collection(db, 'edutech_courses');
    const constraints: QueryConstraint[] = [];

    // Always filter published courses
    constraints.push(where('published', '==', true));

    // Apply filters
    if (filters.track && filters.track !== 'all') {
      constraints.push(where('track', '==', filters.track));
    }

    if (filters.level && filters.level !== 'all') {
      constraints.push(where('level', '==', filters.level));
    }

    if (filters.tier && filters.tier !== 'all') {
      constraints.push(where('tier', '==', filters.tier));
    }

    // Add sorting
    constraints.push(orderBy(sortBy, sortOrder));
    constraints.push(limitQuery(limit));

    const q = query(coursesRef, ...constraints);
    const snapshot = await getDocs(q);

    let courses = snapshot.docs.map(doc => ({
      courseId: doc.id,
      ...doc.data(),
    } as Course));

    // Client-side search filter if searchTerm provided
    // (Firestore doesn't support full-text search without external service)
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.shortDescription.toLowerCase().includes(searchLower) ||
        course.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return courses;
  } catch (error) {
    console.error('Error searching courses:', error);
    return [];
  }
}

// Get courses by specific category
export async function getCoursesByCategory(
  category: string,
  limit: number = 12
): Promise<Course[]> {
  try {
    const coursesRef = collection(db, 'edutech_courses');
    const q = query(
      coursesRef,
      where('published', '==', true),
      where('category', '==', category),
      orderBy('enrollmentCount', 'desc'),
      limitQuery(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      courseId: doc.id,
      ...doc.data(),
    } as Course));
  } catch (error) {
    console.error('Error getting courses by category:', error);
    return [];
  }
}

// Get courses by tag
export async function getCoursesByTag(
  tag: string,
  limit: number = 12
): Promise<Course[]> {
  try {
    const coursesRef = collection(db, 'edutech_courses');
    const q = query(
      coursesRef,
      where('published', '==', true),
      where('tags', 'array-contains', tag),
      orderBy('enrollmentCount', 'desc'),
      limitQuery(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      courseId: doc.id,
      ...doc.data(),
    } as Course));
  } catch (error) {
    console.error('Error getting courses by tag:', error);
    return [];
  }
}

// Get all unique categories
export async function getAllCategories(): Promise<string[]> {
  try {
    const coursesRef = collection(db, 'edutech_courses');
    const q = query(
      coursesRef,
      where('published', '==', true)
    );

    const snapshot = await getDocs(q);
    const categories = new Set<string>();
    
    snapshot.docs.forEach(doc => {
      const course = doc.data() as Course;
      if (course.category) {
        categories.add(course.category);
      }
    });

    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  try {
    const coursesRef = collection(db, 'edutech_courses');
    const q = query(
      coursesRef,
      where('published', '==', true)
    );

    const snapshot = await getDocs(q);
    const tags = new Set<string>();
    
    snapshot.docs.forEach(doc => {
      const course = doc.data() as Course;
      if (course.tags && Array.isArray(course.tags)) {
        course.tags.forEach(tag => tags.add(tag));
      }
    });

    return Array.from(tags).sort();
  } catch (error) {
    console.error('Error getting tags:', error);
    return [];
  }
}

// Quick search suggestion (for autocomplete)
export async function getSearchSuggestions(
  searchTerm: string,
  limit: number = 5
): Promise<string[]> {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const coursesRef = collection(db, 'edutech_courses');
    const q = query(
      coursesRef,
      where('published', '==', true),
      orderBy('title'),
      limitQuery(50) // Get more to filter client-side
    );

    const snapshot = await getDocs(q);
    const searchLower = searchTerm.toLowerCase();
    const suggestions = new Set<string>();

    snapshot.docs.forEach(doc => {
      const course = doc.data() as Course;
      if (course.title.toLowerCase().includes(searchLower)) {
        suggestions.add(course.title);
      }
      // Also add matching tags
      course.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(searchLower)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}
