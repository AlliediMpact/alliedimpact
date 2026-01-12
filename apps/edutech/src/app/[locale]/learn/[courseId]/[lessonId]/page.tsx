'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Play,
  Code,
  FileText,
  HelpCircle,
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import VideoPlayer from '@/components/learn/VideoPlayer';
import QuizComponent from '@/components/learn/QuizComponent';
import CodeEditor from '@/components/learn/CodeEditor';
import type { Course, CourseLesson } from '@/types';

// Mock course data (same as course detail)
const mockCourse: Course = {
  courseId: '1',
  title: 'Introduction to Computers',
  description: 'Computer fundamentals for beginners',
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
          description: 'Understanding computer components and how they work together',
          contentType: 'video',
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          orderIndex: 1,
          estimatedMinutes: 15,
          isPreview: true,
        },
        {
          lessonId: '2',
          moduleId: '1',
          courseId: '1',
          title: 'Computer Hardware Basics',
          description: 'Learn about CPU, RAM, storage, and peripherals',
          contentType: 'reading',
          contentUrl: '',
          orderIndex: 2,
          estimatedMinutes: 10,
          isPreview: true,
        },
        {
          lessonId: '3',
          moduleId: '1',
          courseId: '1',
          title: 'Hardware Knowledge Check',
          description: 'Test your understanding of computer hardware',
          contentType: 'quiz',
          contentUrl: '',
          orderIndex: 3,
          estimatedMinutes: 10,
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
          contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          orderIndex: 1,
          estimatedMinutes: 15,
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
  skillsYouWillLearn: [],
  prerequisites: [],
  language: 'en',
  certificateOffered: true,
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock reading content
const mockReadingContent = `
# Computer Hardware Basics

## Introduction
Computer hardware refers to the physical components that make up a computer system. Understanding these components is essential for anyone learning about computers.

## Key Components

### 1. Central Processing Unit (CPU)
The CPU is often called the "brain" of the computer. It processes instructions and performs calculations. Modern CPUs have multiple cores, allowing them to handle multiple tasks simultaneously.

**Key Points:**
- Processes instructions from programs
- Measured in GHz (GigaHertz)
- More cores = better multitasking

### 2. Random Access Memory (RAM)
RAM is the computer's short-term memory. It stores data that programs are currently using, allowing for quick access.

**Key Points:**
- Temporary storage (data lost when powered off)
- More RAM = smoother multitasking
- Measured in GB (Gigabytes)

### 3. Storage Devices
Storage devices hold data permanently, even when the computer is turned off.

**Types:**
- **Hard Disk Drive (HDD):** Traditional spinning disks
- **Solid State Drive (SSD):** Faster, no moving parts
- **External Storage:** USB drives, external HDDs

### 4. Motherboard
The motherboard is the main circuit board that connects all components together.

### 5. Graphics Processing Unit (GPU)
Handles graphics and video processing. Essential for gaming and video editing.

### 6. Power Supply Unit (PSU)
Converts electrical power from the wall outlet to usable power for computer components.

## Peripherals

### Input Devices
- **Keyboard:** For typing text
- **Mouse:** For pointing and clicking
- **Webcam:** For video capture
- **Microphone:** For audio input

### Output Devices
- **Monitor:** Displays visual information
- **Speakers:** Produce audio
- **Printer:** Produces physical documents

## Summary
Understanding computer hardware helps you make informed decisions when buying or upgrading a computer. Each component plays a specific role in the overall system.
`;

function LessonContent({
  params,
}: {
  params: { locale: string; courseId: string; lessonId: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(mockCourse);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>(['1', '2']);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Find current lesson
  useEffect(() => {
    if (course) {
      for (const module of course.modules) {
        const lesson = module.lessons.find((l) => l.lessonId === params.lessonId);
        if (lesson) {
          setCurrentLesson(lesson);
          setLessonCompleted(completedLessons.includes(lesson.lessonId));
          break;
        }
      }
    }
  }, [course, params.lessonId, completedLessons]);

  // Get all lessons (flattened)
  const allLessons = course?.modules.flatMap((m) => m.lessons) || [];
  const currentLessonIndex = allLessons.findIndex((l) => l.lessonId === params.lessonId);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleLessonComplete = () => {
    if (currentLesson && !completedLessons.includes(currentLesson.lessonId)) {
      setCompletedLessons([...completedLessons, currentLesson.lessonId]);
      setLessonCompleted(true);
      // TODO: Save to Firestore
    }
  };

  const navigateToLesson = (lessonId: string) => {
    router.push(`/${params.locale}/learn/${params.courseId}/${lessonId}`);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'reading':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      case 'coding-exercise':
        return <Code className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => router.push(`/${params.locale}/courses/${params.courseId}`)}
            className="flex items-center space-x-2 text-sm font-medium hover:text-primary-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course</span>
          </button>

          <div className="flex-1 mx-8">
            <h1 className="text-lg font-semibold truncate">{course.title}</h1>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg"
          >
            <BookOpen className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Course Navigation */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-80 border-r bg-background overflow-y-auto transition-transform z-30`}
        >
          <div className="p-4">
            <h2 className="font-semibold mb-4">Course Content</h2>

            <div className="space-y-4">
              {course.modules.map((module) => (
                <div key={module.moduleId}>
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                    Module {module.orderIndex}: {module.title}
                  </h3>

                  <div className="space-y-1">
                    {module.lessons.map((lesson) => {
                      const isCompleted = completedLessons.includes(lesson.lessonId);
                      const isCurrent = lesson.lessonId === currentLesson.lessonId;

                      return (
                        <button
                          key={lesson.lessonId}
                          onClick={() => navigateToLesson(lesson.lessonId)}
                          className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                            isCurrent
                              ? 'bg-primary-blue/10 border border-primary-blue'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <div className="text-muted-foreground">
                                  {getLessonIcon(lesson.contentType)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium truncate ${
                                  isCurrent ? 'text-primary-blue' : ''
                                }`}
                              >
                                {lesson.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {lesson.estimatedMinutes} min
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto p-6">
            {/* Lesson Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <span>Lesson {currentLessonIndex + 1}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="capitalize">{currentLesson.contentType}</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
              <p className="text-muted-foreground">{currentLesson.description}</p>
            </div>

            {/* Lesson Content Based on Type */}
            <div className="mb-8">
              {currentLesson.contentType === 'video' && (
                <VideoPlayer
                  videoUrl={currentLesson.contentUrl || ''}
                  onComplete={handleLessonComplete}
                />
              )}

              {currentLesson.contentType === 'reading' && (
                <div className="prose prose-lg max-w-none">
                  <div
                    className="bg-background border rounded-xl p-8"
                    dangerouslySetInnerHTML={{
                      __html: mockReadingContent.replace(/\n/g, '<br />'),
                    }}
                  />
                  {!lessonCompleted && (
                    <button
                      onClick={handleLessonComplete}
                      className="mt-6 px-6 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue/90"
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>
              )}

              {currentLesson.contentType === 'quiz' && (
                <QuizComponent
                  lessonId={currentLesson.lessonId}
                  onComplete={handleLessonComplete}
                />
              )}

              {currentLesson.contentType === 'coding-exercise' && (
                <CodeEditor
                  lessonId={currentLesson.lessonId}
                  onComplete={handleLessonComplete}
                />
              )}
            </div>

            {/* Completion Status */}
            {lessonCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Lesson Completed!</span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div>
                {prevLesson ? (
                  <button
                    onClick={() => navigateToLesson(prevLesson.lessonId)}
                    className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div />
                )}
              </div>

              <div>
                {nextLesson ? (
                  <button
                    onClick={() => navigateToLesson(nextLesson.lessonId)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
                  >
                    <span>Next Lesson</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      router.push(`/${params.locale}/courses/${params.courseId}`)
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Complete Course
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LessonPage({
  params,
}: {
  params: { locale: string; courseId: string; lessonId: string };
}) {
  return (
    <ProtectedRoute>
      <LessonContent params={params} />
    </ProtectedRoute>
  );
}
