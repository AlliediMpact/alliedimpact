'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getAllCourses, getContentAdminStats } from '@/services/contentAdminService';
import { Course } from '@/types';
import Link from 'next/link';
import {
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

/**
 * Content Admin Dashboard
 * 
 * Allied iMpact Content Admins use this to:
 * - Create ALL courses (centralized curriculum management)
 * - Manage modules and lessons
 * - Publish/unpublish courses
 * - Monitor course analytics
 * 
 * ALL COURSES ARE PLATFORM-OWNED, not owned by individuals
 */

export default function ContentAdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('contentAdmin');

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalModules: 0,
    totalLessons: 0,
    totalEnrollments: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.userType !== 'content_admin') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [user, router]);

  useEffect(() => {
    // Filter courses based on selected filter
    if (filter === 'all') {
      setFilteredCourses(courses);
    } else if (filter === 'published') {
      setFilteredCourses(courses.filter((c) => c.published));
    } else {
      setFilteredCourses(courses.filter((c) => !c.published));
    }
  }, [filter, courses]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [allCourses, adminStats] = await Promise.all([
        getAllCourses(),
        getContentAdminStats(user.userId),
      ]);

      setCourses(allCourses);
      setFilteredCourses(allCourses);
      setStats(adminStats);
    } catch (error) {
      console.error('Error loading content admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-allied-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('welcome')}, {user?.displayName || 'Content Admin'}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('subtitle')} - Centralized Curriculum Management
            </p>
          </div>
          <Link
            href="/content-admin/courses/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-allied-primary hover:bg-allied-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-allied-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('createCourse')}
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title={t('stats.totalCourses')}
            value={stats.totalCourses.toString()}
            icon={AcademicCapIcon}
            color="blue"
          />
          <StatsCard
            title={t('stats.publishedCourses')}
            value={stats.publishedCourses.toString()}
            icon={CheckCircleIcon}
            color="green"
          />
          <StatsCard
            title={t('stats.draftCourses')}
            value={stats.draftCourses.toString()}
            icon={ClockIcon}
            color="orange"
          />
          <StatsCard
            title={t('stats.totalModules')}
            value={stats.totalModules.toString()}
            icon={BookOpenIcon}
            color="purple"
          />
          <StatsCard
            title={t('stats.totalLessons')}
            value={stats.totalLessons.toString()}
            icon={DocumentTextIcon}
            color="indigo"
          />
          <StatsCard
            title={t('stats.totalEnrollments')}
            value={stats.totalEnrollments.toString()}
            icon={AcademicCapIcon}
            color="pink"
          />
        </div>

        {/* Platform Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Platform-Owned Courses:</strong> All courses created here are owned by
                Allied iMpact EduTech platform and managed centrally for the benefit of all
                learners.
              </p>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('coursesSection.title')}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t('coursesSection.subtitle')}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 text-sm font-medium border ${
                      filter === 'all'
                        ? 'bg-allied-primary text-white border-allied-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } rounded-l-lg`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('published')}
                    className={`px-4 py-2 text-sm font-medium border-t border-b ${
                      filter === 'published'
                        ? 'bg-allied-primary text-white border-allied-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Published
                  </button>
                  <button
                    onClick={() => setFilter('draft')}
                    className={`px-4 py-2 text-sm font-medium border ${
                      filter === 'draft'
                        ? 'bg-allied-primary text-white border-allied-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } rounded-r-lg`}
                  >
                    Drafts
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {filter === 'all' ? t('noCourses.title') : `No ${filter} courses`}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'all'
                    ? t('noCourses.description')
                    : `Create your first ${filter} course`}
                </p>
                {filter === 'all' && (
                  <div className="mt-6">
                    <Link
                      href="/content-admin/courses/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-allied-primary hover:bg-allied-primary-dark"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      {t('createFirstCourse')}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.courseId} course={course} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'pink';
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`${colors[color]} rounded-full p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course }: { course: Course }) {
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-allied-primary hover:shadow-lg transition-all">
      <div className="flex flex-col sm:flex-row">
        {/* Course Image */}
        <div className="sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-allied-primary to-allied-primary-dark flex-shrink-0">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <AcademicCapIcon className="h-16 w-16 text-white/50" />
            </div>
          )}
        </div>

        {/* Course Details */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    course.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {course.published ? 'Published' : 'Draft'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {course.track === 'computer-skills' ? 'Computer Skills' : 'Coding'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {course.level}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.shortDescription}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-1" />
                  {course.modules.length} modules
                </div>
                <div className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  {totalLessons} lessons
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {course.estimatedHours}h
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-3 pt-4 border-t border-gray-200">
            <Link
              href={`/courses/${course.courseId}`}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-allied-primary"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Preview
            </Link>
            <Link
              href={`/content-admin/courses/${course.courseId}/edit`}
              className="inline-flex items-center text-sm font-medium text-allied-primary hover:text-allied-primary-dark"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit Course
            </Link>
            <div className="flex-1"></div>
            <span className="text-xs text-gray-400">
              Created by Allied iMpact
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
