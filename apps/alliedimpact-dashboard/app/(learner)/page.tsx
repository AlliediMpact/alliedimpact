'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '../../lib/dashboard-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp, 
  CheckCircle2,
  PlayCircle,
  Calendar,
  Target
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  totalHours: number;
  completedHours: number;
  category: string;
  enrolledAt: Date;
  lastAccessedAt: Date;
  certificateEarned: boolean;
  status: 'in-progress' | 'completed' | 'not-started';
}

interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalHours: number;
  certificatesEarned: number;
  currentStreak: number;
}

export default function LearnerDashboard() {
  const { platformUser, loading } = useDashboard();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<LearningStats>({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHours: 0,
    certificatesEarned: 0,
    currentStreak: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (platformUser) {
      loadLearningData();
    }
  }, [platformUser]);

  const loadLearningData = async () => {
    setLoadingData(true);
    try {
      // TODO: Implement learning management endpoints
      // For now, showing mock data
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Financial Literacy 101',
          description: 'Learn the basics of personal finance, budgeting, and saving',
          instructor: 'Dr. Sarah Johnson',
          progress: 65,
          totalLessons: 20,
          completedLessons: 13,
          totalHours: 12,
          completedHours: 7.8,
          category: 'Finance',
          enrolledAt: new Date('2025-12-01'),
          lastAccessedAt: new Date('2026-01-04'),
          certificateEarned: false,
          status: 'in-progress',
        },
        {
          id: '2',
          title: 'Digital Marketing Fundamentals',
          description: 'Master the essentials of digital marketing and social media',
          instructor: 'Mark Thompson',
          progress: 100,
          totalLessons: 15,
          completedLessons: 15,
          totalHours: 10,
          completedHours: 10,
          category: 'Marketing',
          enrolledAt: new Date('2025-11-15'),
          lastAccessedAt: new Date('2025-12-28'),
          certificateEarned: true,
          status: 'completed',
        },
        {
          id: '3',
          title: 'Web Development Basics',
          description: 'Introduction to HTML, CSS, and JavaScript',
          instructor: 'Emma Wilson',
          progress: 30,
          totalLessons: 25,
          completedLessons: 8,
          totalHours: 20,
          completedHours: 6,
          category: 'Technology',
          enrolledAt: new Date('2025-12-20'),
          lastAccessedAt: new Date('2026-01-03'),
          certificateEarned: false,
          status: 'in-progress',
        },
      ];

      setCourses(mockCourses);
      
      setStats({
        totalCourses: mockCourses.length,
        completedCourses: mockCourses.filter(c => c.status === 'completed').length,
        inProgressCourses: mockCourses.filter(c => c.status === 'in-progress').length,
        totalHours: mockCourses.reduce((sum, c) => sum + c.completedHours, 0),
        certificatesEarned: mockCourses.filter(c => c.certificateEarned).length,
        currentStreak: 7,
      });
    } catch (error) {
      console.error('Error loading learning data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Start Your Learning Journey</h2>
        <p className="text-muted-foreground mb-6">
          You haven't enrolled in any courses yet. Explore our catalog to begin!
        </p>
        <Button>
          <PlayCircle className="h-4 w-4 mr-2" />
          Browse Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learning Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and continue your learning journey
          </p>
        </div>
        <Button>
          <PlayCircle className="h-4 w-4 mr-2" />
          Browse Courses
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.inProgressCourses} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-green-600 mt-1">
              {stats.certificatesEarned} certificates earned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.totalHours)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total time invested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Keep it up! 🔥
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
          <CardDescription>Pick up where you left off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses
              .filter(c => c.status === 'in-progress')
              .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())
              .map(course => (
                <div key={course.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {course.completedLessons}/{course.totalLessons} lessons
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(course.completedHours)}/{course.totalHours} hours
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last accessed {course.lastAccessedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button size="sm">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Completed Courses */}
      {stats.completedCourses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Courses</CardTitle>
            <CardDescription>Your achievements and certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses
                .filter(c => c.status === 'completed')
                .map(course => (
                  <div key={course.id} className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          by {course.instructor}
                        </p>
                      </div>
                      {course.certificateEarned && (
                        <Award className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        Completed on {course.lastAccessedAt.toLocaleDateString()}
                      </span>
                    </div>
                    {course.certificateEarned && (
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        <Award className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Path */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Learning Path</CardTitle>
          <CardDescription>Based on your interests and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { title: 'Advanced Financial Planning', category: 'Finance', duration: '15 hours', level: 'Intermediate' },
              { title: 'Entrepreneurship Essentials', category: 'Business', duration: '20 hours', level: 'Beginner' },
              { title: 'Data Analysis with Excel', category: 'Technology', duration: '18 hours', level: 'Beginner' },
            ].map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.category} • {suggestion.duration} • {suggestion.level}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Enroll
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
