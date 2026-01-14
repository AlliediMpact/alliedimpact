'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  MessageSquare,
  Award,
  BarChart3,
  Loader2,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import {
  getInstructorProfile,
  getInstructorCourses,
  getInstructorStats,
  type InstructorStats,
  type CourseWithStats,
} from '@/services/instructorService';

function InstructorDashboardContent() {
  const { user, platformUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [isInstructor, setIsInstructor] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInstructorData() {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Check if user is instructor
        const instructorProfile = await getInstructorProfile(user.uid);
        
        if (!instructorProfile) {
          setIsInstructor(false);
          setLoading(false);
          return;
        }

        setIsInstructor(true);

        // Load stats and courses
        const [instructorStats, instructorCourses] = await Promise.all([
          getInstructorStats(user.uid),
          getInstructorCourses(user.uid),
        ]);

        setStats(instructorStats);
        setCourses(instructorCourses);
      } catch (err) {
        console.error('Error loading instructor data:', err);
        setError('Failed to load instructor dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadInstructorData();
  }, [user]);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary-blue mx-auto mb-4" />
            <p className="text-muted-foreground">Loading instructor dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Error Loading Dashboard</h1>
          <p className="text-lg text-muted-foreground mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isInstructor === false) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Become an Instructor</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Share your knowledge and earn revenue by teaching on EduTech. Apply to become
            an instructor and start creating courses today.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/en/apply-instructor"
              className="px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors"
            >
              Apply to Teach
            </Link>
            <Link
              href="/en/about"
              className="px-6 py-3 border border-muted rounded-lg font-medium hover:bg-muted/30 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {platformUser?.displayName || user?.displayName}!
              </p>
            </div>
            <Link
              href="/en/instructor/courses/new"
              className="flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>New Course</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Courses */}
          <div className="bg-background border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-blue" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.totalCourses}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.activeCourses} active
                </p>
              </div>
            </div>
            <p className="font-semibold">Total Courses</p>
          </div>

          {/* Total Students */}
          <div className="bg-background border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.completionRate}% completion
                </p>
              </div>
            </div>
            <p className="font-semibold">Total Students</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-background border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">R{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </div>
            </div>
            <p className="font-semibold">Total Revenue</p>
          </div>

          {/* Average Rating */}
          <div className="bg-background border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{stats.avgRating}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.totalReviews} reviews
                </p>
              </div>
            </div>
            <p className="font-semibold">Average Rating</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/en/instructor/courses/new"
            className="bg-background border rounded-xl p-6 hover:border-primary-blue transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary-blue/10 rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary-blue" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create New Course</h3>
                <p className="text-sm text-muted-foreground">
                  Start building your next course
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/en/instructor/analytics"
            className="bg-background border rounded-xl p-6 hover:border-primary-blue transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">View Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track your performance
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/en/forum"
            className="bg-background border rounded-xl p-6 hover:border-primary-blue transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Engage with Students</h3>
                <p className="text-sm text-muted-foreground">
                  Answer questions in forum
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* My Courses */}
        <div className="bg-background border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Courses</h2>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted/30 transition-colors">
                All
              </button>
              <button className="px-4 py-2 border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors">
                Published
              </button>
              <button className="px-4 py-2 border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors">
                Draft
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.courseId}
                className="border rounded-lg p-6 hover:border-primary-blue transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          course.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {course.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground capitalize">
                        {course.track === 'coding' ? 'Coding' : 'Computer Skills'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Students</p>
                        <p className="font-semibold">{course.enrollments}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Rating</p>
                        <p className="font-semibold">
                          {course.rating > 0 ? `⭐ ${course.rating}` : 'No ratings'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                        <p className="font-semibold">
                          {course.revenue > 0 ? `R${course.revenue.toLocaleString()}` : 'FREE'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Completion</p>
                        <p className="font-semibold">
                          {course.completionRate > 0 ? `${course.completionRate}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Updated</p>
                        <p className="font-semibold text-sm">
                          {course.lastUpdated.toLocaleDateString('en-ZA', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-6">
                    <Link
                      href={`/en/courses/${course.courseId}`}
                      className="p-2 border rounded-lg hover:bg-muted/30 transition-colors"
                      title="View Course"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/en/instructor/courses/${course.courseId}/edit`}
                      className="p-2 border rounded-lg hover:bg-muted/30 transition-colors"
                      title="Edit Course"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/en/instructor/courses/${course.courseId}/analytics`}
                      className="p-2 border rounded-lg hover:bg-muted/30 transition-colors"
                      title="View Analytics"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstructorDashboardPage() {
  return (
    <ProtectedRoute>
      <InstructorDashboardContent />
    </ProtectedRoute>
  );
}
