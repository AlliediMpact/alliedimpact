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
import { PageLoader } from '@allied-impact/ui';
import ProtectedRoute from '@/components/ProtectedRoute';
import { completeOnboardingStep, markOnboardingComplete } from '@/services/onboardingService';
import { getPersonalizedFeed } from '@/services/recommendationService';
import type { Course } from '@/types';

function DashboardContent({ params }: { params: { locale: string } }) {
  const { user, platformUser } = useAuth();
  const { enrollments, stats, loading } = useProgress();
  const router = useRouter();

  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const displayName = platformUser?.displayName || user?.displayName || 'Learner';

  // Use real stats from context, with fallbacks
  const currentStats = stats || {
    totalCoursesCompleted: 0,
    totalHoursLearned: 0,
    currentStreak: 0,
    longestStreak: 0,
    certificatesEarned: 0,
  };

  const totalXP = platformUser?.totalXP || 0;
  const unlockedBadges = (platformUser?.unlockedBadges as string[] | undefined) || [];
  const level = Math.floor(totalXP / 100) + 1;

  // Use real enrollments instead of mock data
  const enrolledCourses = enrollments || [];

  const learnerOnboardingSteps = [
    { id: 'profile', label: 'Complete your profile' },
    { id: 'enroll-course', label: 'Enroll in your first course' },
    { id: 'complete-lesson', label: 'Complete your first lesson' },
    { id: 'join-forum', label: 'Ask a question in the forum' },
  ] as const;

  const completedOnboardingSteps =
    (platformUser?.onboardingStepsCompleted as string[] | undefined) || [];
  const isOnboardingCompleted = Boolean(platformUser?.onboardingCompleted);

  const onboardingProgress = Math.round(
    (completedOnboardingSteps.length / learnerOnboardingSteps.length) * 100
  );

  const handleContinueLearning = (courseId: string) => {
    // Find the enrollment to get current lesson
    const enrollment = enrollments?.find(e => e.courseId === courseId);
    if (enrollment) {
      const lessonId = enrollment.currentLessonId || 'lesson-1';
      router.push(`/${params.locale}/learn/${courseId}/${lessonId}`);
    }
  };

  // Load personalized recommendations
  useEffect(() => {
    async function loadRecommendations() {
      if (!user?.userId) return;

      setLoadingRecommendations(true);
      try {
        const enrolledIds = enrollments?.map(e => e.courseId) || [];
        const feed = await getPersonalizedFeed(
          user.userId,
          enrolledIds,
          platformUser?.primaryTrack,
          currentStats.totalCoursesCompleted
        );
        setRecommendedCourses(feed.recommended);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    }

    loadRecommendations();
  }, [user?.userId, enrollments, platformUser?.primaryTrack, currentStats.totalCoursesCompleted]);

  if (loading) {
    return (
      <div className="container py-12">
        <PageLoader text="Loading your dashboard..." />
      </div>
    );
  };

  return (
    <div className="container py-12">
      {/* Onboarding - simple getting started checklist */}
      {!isOnboardingCompleted && (
        <section className="mb-10 bg-background border border-primary-blue/20 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Getting started with EduTech</h2>
              <p className="text-sm text-muted-foreground">
                Complete these quick steps to make the most of your learning journey.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">Onboarding progress</p>
              <p className="text-lg font-semibold text-primary-blue">{onboardingProgress}%</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {learnerOnboardingSteps.map((step) => {
              const done = completedOnboardingSteps.includes(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={onboardingSubmitting || done || !user}
                  onClick={async () => {
                    if (!user) return;
                    try {
                      setOnboardingSubmitting(true);
                      await completeOnboardingStep(
                        user.userId,
                        step.id,
                        learnerOnboardingSteps.length
                      );
                    } finally {
                      setOnboardingSubmitting(false);
                    }
                  }}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-2 text-left text-sm transition-colors ${
                    done
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-muted/40 border-muted hover:border-primary-blue/60 hover:bg-primary-blue/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                      done ? 'bg-green-600 text-white' : 'bg-background text-muted-foreground border border-muted'
                    }`}>
                      {done ? '✓' : ''}
                    </span>
                    {step.label}
                  </span>
                  {done && (
                    <span className="text-xs font-medium text-green-700">Completed</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="underline-offset-2 hover:underline"
                onClick={() => router.push(`/${params.locale}/profile`)}
              >
                Go to profile
              </button>
              <button
                type="button"
                className="underline-offset-2 hover:underline"
                onClick={() => router.push(`/${params.locale}/courses`)}
              >
                Browse courses
              </button>
              <button
                type="button"
                className="underline-offset-2 hover:underline"
                onClick={() => router.push(`/${params.locale}/forum`)}
              >
                Visit forum
              </button>
            </div>
            <button
              type="button"
              disabled={onboardingSubmitting || !user}
              onClick={async () => {
                if (!user) return;
                try {
                  setOnboardingSubmitting(true);
                  await markOnboardingComplete(user.userId);
                } finally {
                  setOnboardingSubmitting(false);
                }
              }}
              className="text-xs font-medium text-primary-blue hover:underline underline-offset-2"
            >
              Skip for now
            </button>
          </div>
        </section>
      )}

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

      {/* Achievements (XP + Badges) */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-background border border-primary-blue/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary-blue" />
                  Achievements
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep learning to earn XP and unlock badges.
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-primary-blue">Level {level}</p>
                <p className="text-xs text-muted-foreground">{totalXP} XP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg border border-muted bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Badges Unlocked</p>
                <p className="text-2xl font-bold">{unlockedBadges.length}</p>
              </div>
              <div className="rounded-lg border border-muted bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Courses Completed</p>
                <p className="text-2xl font-bold">{currentStats.totalCoursesCompleted}</p>
              </div>
              <div className="rounded-lg border border-muted bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-1">Longest Streak</p>
                <p className="text-2xl font-bold">{currentStats.longestStreak}d</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Complete lessons daily to grow your streak and XP. Finishing courses and spending more time learning will unlock new badges over time.
            </p>
          </div>
        </div>
      </section>

      {/* Recommended For You Section */}
      {recommendedCourses.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Recommended For You</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Courses picked based on your learning journey
              </p>
            </div>
            <button
              onClick={() => router.push(`/${params.locale}/courses`)}
              className="text-primary-blue hover:underline text-sm font-medium"
            >
              Browse All Courses
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedCourses.slice(0, 3).map((course) => (
              <div
                key={course.courseId}
                onClick={() => router.push(`/${params.locale}/courses/${course.courseId}`)}
                className="cursor-pointer bg-background border rounded-xl overflow-hidden hover:border-primary-blue transition-colors"
              >
                <div className="h-32 bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-primary-blue/40" />
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      course.tier === 'FREE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-primary-blue/10 text-primary-blue'
                    }`}>
                      {course.tier}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground capitalize">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {course.shortDescription}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.estimatedHours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrollmentCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
