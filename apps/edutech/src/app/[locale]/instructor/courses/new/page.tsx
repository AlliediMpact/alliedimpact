'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import CourseForm from '@/components/instructor/CourseForm';
import { createCourse } from '@/services/courseService';
import type { Course, CourseModule } from '@/types';

function CreateCourseContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveDraft = async (courseData: Partial<Course>) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const courseId = await createCourse({
        ...courseData,
        instructorId: user.uid,
        instructorName: user.displayName || user.email || 'Unknown',
        status: 'draft',
        published: false,
      });

      router.push(`/en/instructor/courses/${courseId}/edit`);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save course draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (courseData: Partial<Course>) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Validate before publishing
      if (!courseData.modules || courseData.modules.length === 0) {
        setError('Course must have at least one module before publishing.');
        setLoading(false);
        return;
      }

      const hasLessons = courseData.modules.some(
        (module) => module.lessons && module.lessons.length > 0
      );

      if (!hasLessons) {
        setError('Course must have at least one lesson before publishing.');
        setLoading(false);
        return;
      }

      const courseId = await createCourse({
        ...courseData,
        instructorId: user.uid,
        instructorName: user.displayName || user.email || 'Unknown',
        status: 'published',
        published: true,
      });

      router.push(`/en/instructor/dashboard?published=${courseId}`);
    } catch (err) {
      console.error('Error publishing course:', err);
      setError('Failed to publish course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/en/instructor/dashboard"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Create New Course</h1>
                <p className="text-muted-foreground mt-1">
                  Build your course content and publish when ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <CourseForm
          mode="create"
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default function CreateCoursePage() {
  return (
    <ProtectedRoute>
      <CreateCourseContent />
    </ProtectedRoute>
  );
}
