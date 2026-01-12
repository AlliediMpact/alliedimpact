'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  CheckCircle,
  PlayCircle,
  Lock,
} from 'lucide-react';
import type { Course, Enrollment } from '@/types';

// Mock course data - will be replaced with Firestore
const mockCourse: Course = {
  courseId: '1',
  title: 'Introduction to Computers',
  description:
    'This comprehensive course covers everything you need to know to become comfortable with using a computer. From basic hardware components to operating system navigation, file management, and internet safety, you\'ll gain the confidence to use technology effectively in your daily life and work.',
  shortDescription: 'Computer fundamentals for beginners',
  track: 'computer-skills',
  category: 'Digital Literacy',
  level: 'beginner',
  tier: 'FREE',
  thumbnailUrl: '',
  estimatedHours: 8,
  modules: [
    {
      moduleId: '1',
      courseId: '1',
      title: 'Getting Started with Computers',
      description: 'Introduction to computer basics',
      orderIndex: 1,
      lessons: [
        {
          lessonId: '1',
          moduleId: '1',
          courseId: '1',
          title: 'What is a Computer?',
          description: 'Understanding computer components',
          contentType: 'video',
          orderIndex: 1,
          estimatedMinutes: 15,
          isPreview: true,
        },
        {
          lessonId: '2',
          moduleId: '1',
          courseId: '1',
          title: 'Turning Your Computer On and Off',
          description: 'Basic power operations',
          contentType: 'video',
          orderIndex: 2,
          estimatedMinutes: 10,
          isPreview: true,
        },
        {
          lessonId: '3',
          moduleId: '1',
          courseId: '1',
          title: 'Using the Mouse and Keyboard',
          description: 'Input device fundamentals',
          contentType: 'interactive',
          orderIndex: 3,
          estimatedMinutes: 20,
          isPreview: false,
        },
      ],
    },
    {
      moduleId: '2',
      courseId: '1',
      title: 'Operating System Basics',
      description: 'Learn to navigate Windows',
      orderIndex: 2,
      lessons: [
        {
          lessonId: '4',
          moduleId: '2',
          courseId: '1',
          title: 'Understanding the Desktop',
          description: 'Desktop components and icons',
          contentType: 'video',
          orderIndex: 1,
          estimatedMinutes: 15,
          isPreview: false,
        },
        {
          lessonId: '5',
          moduleId: '2',
          courseId: '1',
          title: 'Working with Windows',
          description: 'Opening, closing, and managing windows',
          contentType: 'video',
          orderIndex: 2,
          estimatedMinutes: 20,
          isPreview: false,
        },
      ],
    },
    {
      moduleId: '3',
      courseId: '1',
      title: 'File Management',
      description: 'Organizing your files and folders',
      orderIndex: 3,
      lessons: [
        {
          lessonId: '6',
          moduleId: '3',
          courseId: '1',
          title: 'Creating Files and Folders',
          description: 'File system basics',
          contentType: 'video',
          orderIndex: 1,
          estimatedMinutes: 15,
          isPreview: false,
        },
        {
          lessonId: '7',
          moduleId: '3',
          courseId: '1',
          title: 'Copying, Moving, and Deleting',
          description: 'File operations',
          contentType: 'interactive',
          orderIndex: 2,
          estimatedMinutes: 25,
          isPreview: false,
        },
      ],
    },
  ],
  instructorId: 'instructor-1',
  instructorName: 'Sarah Johnson',
  enrollmentCount: 1250,
  rating: 4.8,
  reviewCount: 320,
  skillsYouWillLearn: [
    'Computer hardware basics',
    'Operating system navigation',
    'File management',
    'Internet safety',
    'Email basics',
  ],
  prerequisites: [],
  language: 'en',
  certificateOffered: true,
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function CourseDetailPage({
  params,
}: {
  params: { locale: string; courseId: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(mockCourse);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const totalLessons = course?.modules.reduce(
    (acc, module) => acc + module.lessons.length,
    0
  );

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/${params.locale}/login?redirect=/courses/${params.courseId}`);
      return;
    }

    // Check if premium course and user has entitlement
    if (course?.tier === 'PREMIUM') {
      // TODO: Check ProductEntitlement for EDUTECH
      // For now, redirect to pricing
      router.push(`/${params.locale}/pricing?course=${params.courseId}`);
      return;
    }

    setIsEnrolling(true);

    try {
      // TODO: Create enrollment in Firestore
      // const enrollment = await createEnrollment(user.uid, course.courseId);

      // Mock enrollment
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to first lesson
      const firstLesson = course?.modules[0]?.lessons[0];
      if (firstLesson) {
        router.push(
          `/${params.locale}/learn/${course.courseId}/${firstLesson.lessonId}`
        );
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinueLearning = () => {
    // TODO: Get last accessed lesson from enrollment
    const firstLesson = course?.modules[0]?.lessons[0];
    if (firstLesson) {
      router.push(
        `/${params.locale}/learn/${course.courseId}/${firstLesson.lessonId}`
      );
    }
  };

  if (!course) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Course not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 border-b">
        <div className="container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Course Info */}
            <div className="lg:col-span-2">
              {/* Badges */}
              <div className="flex items-center space-x-2 mb-4">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    course.tier === 'FREE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-primary-blue/10 text-primary-blue'
                  }`}
                >
                  {course.tier}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-muted text-muted-foreground capitalize">
                  {course.level}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-muted text-muted-foreground capitalize">
                  {course.track === 'coding' ? 'Coding' : 'Computer Skills'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground mb-6">
                {course.shortDescription}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-muted-foreground">
                    ({course.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{course.enrollmentCount.toLocaleString()} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>{course.estimatedHours} hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <span>{totalLessons} lessons</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-1">Created by</p>
                <p className="font-semibold">{course.instructorName}</p>
              </div>
            </div>

            {/* Right Column - Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-background border rounded-xl p-6 sticky top-24">
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-primary-blue/20 to-primary-purple/20 rounded-lg flex items-center justify-center mb-6">
                  <BookOpen className="h-20 w-20 text-primary-blue/40" />
                </div>

                {/* Price */}
                <div className="mb-6">
                  {course.tier === 'FREE' ? (
                    <p className="text-3xl font-bold text-green-600">Free</p>
                  ) : (
                    <div>
                      <p className="text-3xl font-bold">R199/month</p>
                      <p className="text-sm text-muted-foreground">
                        With Coding Track subscription
                      </p>
                    </div>
                  )}
                </div>

                {/* Enroll Button */}
                {enrollment ? (
                  <button
                    onClick={handleContinueLearning}
                    className="w-full py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors flex items-center justify-center space-x-2"
                  >
                    <PlayCircle className="h-5 w-5" />
                    <span>Continue Learning</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors disabled:opacity-50"
                  >
                    {isEnrolling
                      ? 'Enrolling...'
                      : course.tier === 'PREMIUM'
                      ? 'View Pricing'
                      : 'Enroll for Free'}
                  </button>
                )}

                {/* What's Included */}
                <div className="mt-6 space-y-3">
                  <p className="font-semibold mb-3">This course includes:</p>
                  <div className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{course.estimatedHours} hours of content</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{totalLessons} video lessons</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Interactive exercises</span>
                  </div>
                  {course.certificateOffered && (
                    <div className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Certificate of completion</span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <section>
              <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.skillsYouWillLearn.map((skill, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{skill}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* About Course */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About this course</h2>
              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </section>

            {/* Course Content/Modules */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Course content</h2>
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <div key={module.moduleId} className="border rounded-lg">
                    {/* Module Header */}
                    <div className="p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            Module {module.orderIndex}: {module.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {module.description}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {module.lessons.length} lessons
                        </div>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="divide-y">
                      {module.lessons.map((lesson) => (
                        <div key={lesson.lessonId} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="flex items-center space-x-3">
                            {lesson.isPreview ? (
                              <PlayCircle className="h-5 w-5 text-primary-blue" />
                            ) : (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {lesson.contentType === 'video'
                                  ? 'Video'
                                  : lesson.contentType === 'interactive'
                                  ? 'Interactive'
                                  : 'Reading'}{' '}
                                • {lesson.estimatedMinutes} min
                              </p>
                            </div>
                          </div>
                          {lesson.isPreview && (
                            <span className="text-xs text-primary-blue font-medium">
                              Preview
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Additional Info */}
          <div className="lg:col-span-1">
            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="bg-background border rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-3">Prerequisites</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span>•</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Certificate */}
            {course.certificateOffered && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Earn a certificate</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete this course to earn an official certificate that you
                      can share on LinkedIn and add to your CV.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
