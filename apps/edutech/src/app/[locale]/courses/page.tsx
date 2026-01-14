'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Clock, Users, Star, BookOpen, Code } from 'lucide-react';
import { Spinner } from '@allied-impact/ui';
import type { CourseTrack, CourseLevel, Course } from '@/types';
import { searchCourses } from '@/services/searchService';
import { getTrendingCourses } from '@/services/recommendationService';

// Mock courses data - will be replaced with Firestore data
const mockCourses = [
  {
    courseId: '1',
    title: 'Introduction to Computers',
    description: 'Learn the basics of using a computer, from turning it on to navigating the operating system.',
    shortDescription: 'Computer fundamentals for beginners',
    track: 'computer-skills' as CourseTrack,
    category: 'Digital Literacy',
    level: 'beginner' as CourseLevel,
    tier: 'FREE',
    estimatedHours: 8,
    thumbnailUrl: '',
    instructorName: 'Sarah Johnson',
    enrollmentCount: 1250,
    rating: 4.8,
    reviewCount: 320,
  },
  {
    courseId: '2',
    title: 'Microsoft Office Essentials',
    description: 'Master Word, Excel, and PowerPoint for everyday tasks and professional work.',
    shortDescription: 'Essential Office skills',
    track: 'computer-skills' as CourseTrack,
    category: 'Productivity',
    level: 'beginner' as CourseLevel,
    tier: 'FREE',
    estimatedHours: 12,
    thumbnailUrl: '',
    instructorName: 'Michael Brown',
    enrollmentCount: 890,
    rating: 4.7,
    reviewCount: 210,
  },
  {
    courseId: '3',
    title: 'HTML & CSS Fundamentals',
    description: 'Build your first website with HTML and CSS. Perfect for aspiring web developers.',
    shortDescription: 'Web development basics',
    track: 'coding' as CourseTrack,
    category: 'Web Development',
    level: 'beginner' as CourseLevel,
    tier: 'PREMIUM',
    estimatedHours: 20,
    thumbnailUrl: '',
    instructorName: 'David Chen',
    enrollmentCount: 2100,
    rating: 4.9,
    reviewCount: 580,
  },
  {
    courseId: '4',
    title: 'JavaScript for Beginners',
    description: 'Learn programming with JavaScript, the language of the web.',
    shortDescription: 'Start coding with JavaScript',
    track: 'coding' as CourseTrack,
    category: 'Programming',
    level: 'beginner' as CourseLevel,
    tier: 'PREMIUM',
    estimatedHours: 25,
    thumbnailUrl: '',
    instructorName: 'Emily Rodriguez',
    enrollmentCount: 1800,
    rating: 4.8,
    reviewCount: 450,
  },
  {
    courseId: '5',
    title: 'Financial Literacy Basics',
    description: 'Understand personal finance, budgeting, saving, and investing for your future.',
    shortDescription: 'Master your money',
    track: 'computer-skills' as CourseTrack,
    category: 'Finance',
    level: 'beginner' as CourseLevel,
    tier: 'FREE',
    estimatedHours: 10,
    thumbnailUrl: '',
    instructorName: 'James Wilson',
    enrollmentCount: 650,
    rating: 4.6,
    reviewCount: 180,
  },
  {
    courseId: '6',
    title: 'React Development',
    description: 'Build modern web applications with React, the most popular JavaScript library.',
    shortDescription: 'Modern web apps with React',
    track: 'coding' as CourseTrack,
    category: 'Web Development',
    level: 'intermediate' as CourseLevel,
    tier: 'PREMIUM',
    estimatedHours: 30,
    thumbnailUrl: '',
    instructorName: 'Lisa Anderson',
    enrollmentCount: 1200,
    rating: 4.9,
    reviewCount: 380,
  },
];

export default function CoursesPage({
  searchParams,
}: {
  searchParams: { track?: string };
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>(searchParams.track || 'all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Load courses based on filters
  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      try {
        const results = await searchCourses({
          filters: {
            track: selectedTrack === 'all' ? undefined : selectedTrack as CourseTrack,
            level: selectedLevel === 'all' ? undefined : selectedLevel as CourseLevel,
            searchTerm: searchTerm || undefined,
          },
          sortBy: 'enrollmentCount',
          sortOrder: 'desc',
          limit: 50,
        });
        setCourses(results);
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timer = setTimeout(() => {
      loadCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedTrack, selectedLevel]);

  // Filter courses based on selections
  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch = !searchTerm || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrack = selectedTrack === 'all' || course.track === selectedTrack;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesTrack && matchesLevel;
  });

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
        <p className="text-lg text-muted-foreground">
          Choose from {mockCourses.length} courses across both learning tracks
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-background border rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>

          {/* Track Filter */}
          <div>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="all">All Tracks</option>
              <option value="computer-skills">Computer Skills</option>
              <option value="coding">Coding Track</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCourses.length} courses
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Course Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link
              key={course.courseId}
              href={`/en/courses/${course.courseId}`}
              className="group"
            >
              <div className="bg-background border rounded-xl overflow-hidden hover:border-primary-blue transition-colors h-full flex flex-col">
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 flex items-center justify-center">
                  {course.track === 'coding' ? (
                    <Code className="h-16 w-16 text-primary-blue/40" />
                  ) : (
                    <BookOpen className="h-16 w-16 text-green-600/40" />
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Badges */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        course.tier === 'FREE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-primary-blue/10 text-primary-blue'
                      }`}
                    >
                      {course.tier}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground capitalize">
                      {course.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-blue transition-colors">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {course.shortDescription}
                  </p>

                  {/* Instructor */}
                  <p className="text-sm font-medium mb-4">{course.instructorName}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.estimatedHours}h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollmentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filters
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTrack('all');
              setSelectedLevel('all');
            }}
            className="text-primary-blue hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
