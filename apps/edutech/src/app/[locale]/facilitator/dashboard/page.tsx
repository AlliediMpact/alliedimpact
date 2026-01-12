'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  getAssignedClasses,
  getFacilitatorStats,
} from '@/services/facilitatorService';
import { Class } from '@/types';
import Link from 'next/link';
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

/**
 * Facilitator Dashboard
 * 
 * Allied iMpact staff members use this to:
 * - View assigned classes
 * - Monitor learner progress
 * - Mark attendance
 * - Add performance notes
 * 
 * Facilitators CANNOT create courses - that's done by Content Admins
 */

export default function FacilitatorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('facilitator');

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalLearners: 0,
    activeLearnersThisWeek: 0,
    averageAttendanceRate: 0,
    averageProgress: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.userType !== 'facilitator') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [assignedClasses, facilitatorStats] = await Promise.all([
        getAssignedClasses(user.userId),
        getFacilitatorStats(user.userId),
      ]);

      setClasses(assignedClasses);
      setStats(facilitatorStats);
    } catch (error) {
      console.error('Error loading facilitator data:', error);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('welcome')}, {user?.displayName || 'Facilitator'}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('subtitle')} - Allied iMpact EduTech
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title={t('stats.totalClasses')}
            value={stats.totalClasses.toString()}
            icon={AcademicCapIcon}
            color="blue"
          />
          <StatsCard
            title={t('stats.totalLearners')}
            value={stats.totalLearners.toString()}
            icon={UsersIcon}
            color="green"
          />
          <StatsCard
            title={t('stats.activeThisWeek')}
            value={stats.activeLearnersThisWeek.toString()}
            icon={ChartBarIcon}
            color="purple"
          />
          <StatsCard
            title={t('stats.attendanceRate')}
            value={`${stats.averageAttendanceRate}%`}
            icon={CalendarIcon}
            color="orange"
          />
        </div>

        {/* Assigned Classes */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('assignedClasses.title')}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {t('assignedClasses.subtitle')}
            </p>
          </div>

          <div className="p-6">
            {classes.length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('noClasses.title')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('noClasses.description')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((classData) => (
                  <ClassCard key={classData.classId} classData={classData} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-allied-primary/5 border border-allied-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-allied-primary mb-4">
            {t('quickActions.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/facilitator/attendance"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <CalendarIcon className="h-8 w-8 text-allied-primary mr-3" />
              <span className="font-medium">{t('quickActions.markAttendance')}</span>
            </Link>
            <Link
              href="/courses"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <AcademicCapIcon className="h-8 w-8 text-allied-primary mr-3" />
              <span className="font-medium">{t('quickActions.viewCourses')}</span>
            </Link>
            <Link
              href="/forum"
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <UsersIcon className="h-8 w-8 text-allied-primary mr-3" />
              <span className="font-medium">{t('quickActions.supportForum')}</span>
            </Link>
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
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
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

// Class Card Component
function ClassCard({ classData }: { classData: Class }) {
  return (
    <Link
      href={`/facilitator/classes/${classData.classId}`}
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-allied-primary hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {classData.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{classData.schoolName}</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-allied-primary/10 text-allied-primary">
          {classData.track === 'computer-skills' ? 'Computer Skills' : 'Coding'}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {classData.grade && (
          <div className="flex items-center text-sm text-gray-600">
            <AcademicCapIcon className="h-4 w-4 mr-2" />
            {classData.grade}
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <UsersIcon className="h-4 w-4 mr-2" />
          {classData.totalLearners} learners
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ChartBarIcon className="h-4 w-4 mr-2" />
          {Math.round(classData.averageProgress)}% average progress
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className="text-allied-primary text-sm font-medium hover:underline">
          View Details →
        </span>
      </div>
    </Link>
  );
}
