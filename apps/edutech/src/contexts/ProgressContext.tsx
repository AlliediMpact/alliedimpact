'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  getEnrollment,
  getUserEnrollments,
  completeLesson,
  updateCurrentLesson,
  addTimeSpent,
  getUserLearningStats,
} from '@/services/progressService';
import type { Enrollment } from '@/types';

interface ProgressContextType {
  enrollments: Enrollment[];
  loading: boolean;
  stats: {
    totalCoursesCompleted: number;
    totalHoursLearned: number;
    currentStreak: number;
    longestStreak: number;
    certificatesEarned: number;
    totalEnrollments: number;
    inProgressCourses: number;
  } | null;
  refreshEnrollments: () => Promise<void>;
  refreshStats: () => Promise<void>;
  markLessonComplete: (
    enrollmentId: string,
    lessonId: string,
    totalLessons: number
  ) => Promise<void>;
  updateLesson: (enrollmentId: string, moduleId: string, lessonId: string) => Promise<void>;
  trackTime: (enrollmentId: string, minutes: number) => Promise<void>;
  getCourseEnrollment: (courseId: string) => Enrollment | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<ProgressContextType['stats']>(null);
  const [loading, setLoading] = useState(true);

  const refreshEnrollments = async () => {
    if (!user) {
      setEnrollments([]);
      return;
    }

    try {
      const userEnrollments = await getUserEnrollments(user.uid);
      setEnrollments(userEnrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const refreshStats = async () => {
    if (!user) {
      setStats(null);
      return;
    }

    try {
      const userStats = await getUserLearningStats(user.uid);
      setStats(userStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const markLessonComplete = async (
    enrollmentId: string,
    lessonId: string,
    totalLessons: number
  ) => {
    if (!user) return;

    try {
      await completeLesson(user.uid, enrollmentId, lessonId, totalLessons);
      await refreshEnrollments();
      await refreshStats();
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const updateLesson = async (enrollmentId: string, moduleId: string, lessonId: string) => {
    if (!user) return;

    try {
      await updateCurrentLesson(user.uid, enrollmentId, moduleId, lessonId);
      await refreshEnrollments();
    } catch (error) {
      console.error('Error updating current lesson:', error);
    }
  };

  const trackTime = async (enrollmentId: string, minutes: number) => {
    if (!user) return;

    try {
      await addTimeSpent(user.uid, enrollmentId, minutes);
      await refreshStats();
    } catch (error) {
      console.error('Error tracking time:', error);
    }
  };

  const getCourseEnrollment = (courseId: string): Enrollment | null => {
    return enrollments.find((e) => e.courseId === courseId) || null;
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshEnrollments(), refreshStats()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return (
    <ProgressContext.Provider
      value={{
        enrollments,
        loading,
        stats,
        refreshEnrollments,
        refreshStats,
        markLessonComplete,
        updateLesson,
        trackTime,
        getCourseEnrollment,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
