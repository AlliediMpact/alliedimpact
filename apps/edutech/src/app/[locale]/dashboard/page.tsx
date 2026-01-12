'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  PlayCircle,
  CheckCircle,
  Target,
  Flame,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

function DashboardContent({ params }: { params: { locale: string } }) {
  const { user, platformUser } = useAuth();
  const { enrollments, stats, loading } = useProgress();
  const router = useRouter();

  const displayName = platformUser?.displayName || user?.displayName || 'Learner';

  // Use real stats from context, with fallbacks
  const currentStats = stats || {
    totalCoursesCompleted: 0,
    totalHoursLearned: 0,
    currentStreak: 0,
    longestStreak: 0,
    certificatesEarned: 0,
  };

  // Use real enrollments instead of mock data
  const enrolledCourses = enrollments || [];

  const handleContinueLearning = (courseId: string) => {
    // Find the enrollment to get current lesson
    const enrollment = enrollments?.find(e => e.courseId === courseId);
    if (enrollment) {
      const lessonId = enrollment.currentLessonId || 'lesson-1';
      router.push(`/${params.locale}/learn/${courseId}/${lessonId}`);
    }
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {platformUser?.displayName || user?.displayName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Continue your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Courses Completed */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-700">
              {currentStats.totalCoursesCompleted}
            </span>
          </div>
          <p className="font-semibold text-green-900">Courses Completed</p>
        </div>

        {/* Hours Learned */}
        <div className="bg-gradient-to-br from-blue-50 to-primary-blue/10 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary-blue" />
            </div>
            <span className="text-3xl font-bold text-primary-blue">
              {currentStats.totalHoursLearned}
            </span>
          </div>
          <p className="font-semibold text-blue-900">Hours Learned</p>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-3xl font-bold text-orange-700">
              {currentStats.currentStreak}
            </span>
          </div>
          <p className="font-semibold text-orange-900">Day Streak</p>
          <p className="text-xs text-orange-700 mt-1">
            Longest: {currentStats.longestStreak} days
          </p>
        </div>

        {/* Certificates */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-3xl font-bold text-yellow-700">
              {currentStats.certificatesEarned}
            </span>
          </div>
          <p className="font-semibold text-yellow-900">Certificates Earned</p>
        </div>
      </div>

      {/* Continue Learning Section */}
      {enrolledCourses.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Continue Learning</h2>
            <button
              onClick={() => router.push(`/${params.locale}/courses`)}
              className="text-primary-blue hover:underline text-sm font-medium"
            >
              Browse all courses
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((enrollment) => (
              <div
                key={enrollment.enrollmentId}
                className="bg-background border rounded-xl overflow-hidden hover:border-primary-blue transition-colors"
              >
                {/* Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary-blue/40" />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Track Badge */}
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground capitalize mb-3 inline-block">
                    {enrollment.courseTier === 'premium' ? 'Coding' : 'Computer Skills'}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-3">{enrollment.courseTitle}</h3>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{Math.round(enrollment.progress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-blue rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {enrollment.completedLessons?.length || 0} lessons completed
                    </p>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={() => handleContinueLearning(enrollment.courseId)}
                    className="w-full py-2 bg-primary-blue text-white rounded-lg font-medium hover:bg-primary-blue/90 transition-colors flex items-center justify-center space-x-2"
                  >
                    <PlayCircle className="h-5 w-5" />
                    <span>Continue</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State - No Enrolled Courses */}
      {enrolledCourses.length === 0 && (
        <section className="mb-12">
          <div className="bg-background border rounded-xl p-12 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              You haven't enrolled in any courses yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start your learning journey today!
            </p>
            <button
              onClick={() => router.push(`/${params.locale}/courses`)}
              className="px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        </section>
      )}

      {/* Learning Goal */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Your Learning Goal</h2>
        <div className="bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 border rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 bg-primary-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="h-6 w-6 text-primary-blue" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Weekly Learning Goal</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set a weekly goal to stay motivated and track your progress
              </p>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-primary-blue text-white rounded-lg text-sm font-medium hover:bg-primary-blue/90 transition-colors">
                  Set Goal
                </button>
                <p className="text-sm text-muted-foreground">
                  Recommended: 5 hours per week
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <div className="bg-background border rounded-xl divide-y">
          {enrolledCourses.slice(0, 3).map((enrollment) => (
            <div key={enrollment.enrollmentId} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 rounded flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-blue/60" />
                </div>
                <div>
                  <p className="font-medium">{enrollment.courseTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    Last accessed:{' '}
                    {new Date(enrollment.lastAccessedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium text-primary-blue">
                {Math.round(enrollment.progress)}%
              </div>
            </div>
          ))}

          {enrolledCourses.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage({ params }: { params: { locale: string } }) {
  return (
    <ProtectedRoute>
      <DashboardContent params={params} />
    </ProtectedRoute>
  );
}
