'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Clock, Users, Star, BookOpen, Code, AlertCircle } from 'lucide-react';
import type { Course, CourseTrack, CourseLevel } from '@/types';
import { getCoursesPaginated, PaginatedCourses } from '@/services/courseService';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { CourseCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/contexts/ToastContext';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export default function CoursesPage({
  searchParams,
}: {
  searchParams: { track?: string };
}) {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>(searchParams.track || 'all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  // Load initial courses
  const loadCourses = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCourses([]);
        setLastDoc(null);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const filters: any = {
        published: true,
      };

      if (selectedTrack !== 'all') {
        filters.track = selectedTrack;
      }
      if (selectedLevel !== 'all') {
        filters.level = selectedLevel;
      }
      if (selectedTier !== 'all') {
        filters.tier = selectedTier;
      }
      if (searchTerm) {
        filters.searchQuery = searchTerm;
      }

      const result: PaginatedCourses = await getCoursesPaginated(
        filters,
        12,
        reset ? null : lastDoc
      );

      if (reset) {
        setCourses(result.courses);
      } else {
        setCourses((prev) => [...prev, ...result.courses]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      const errorMessage = err.userMessage || 'Failed to load courses. Please try again.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedTrack, selectedLevel, selectedTier, searchTerm, lastDoc, showToast]);

  // Load more courses when scrolling
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !error) {
      loadCourses(false);
    }
  }, [loadingMore, hasMore, error, loadCourses]);

  // Infinite scroll setup
  const { targetRef } = useInfiniteScroll(handleLoadMore, {
    enabled: hasMore && !loading && !loadingMore,
  });

  // Load courses on mount and filter changes
  useEffect(() => {
    loadCourses(true);
  }, [selectedTrack, selectedLevel, selectedTier]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        loadCourses(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTrack('all');
    setSelectedLevel('all');
    setSelectedTier('all');
  };

  const handleRetry = () => {
    setError(null);
    loadCourses(true);
  };

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Courses</h1>
        <p className="text-lg text-muted-foreground">
          Discover courses created by Allied iMpact experts
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-background border rounded-xl p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="sr-only">
              Search courses
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <input
                id="search"
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                aria-label="Search courses"
              />
            </div>
          </div>

          {/* Track Filter */}
          <div>
            <label htmlFor="track-filter" className="sr-only">
              Filter by track
            </label>
            <select
              id="track-filter"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              aria-label="Filter courses by track"
            >
              <option value="all">All Tracks</option>
              <option value="computer-skills">Computer Skills</option>
              <option value="coding">Coding</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label htmlFor="level-filter" className="sr-only">
              Filter by level
            </label>
            <select
              id="level-filter"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              aria-label="Filter courses by level"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label htmlFor="tier-filter" className="sr-only">
              Filter by pricing tier
            </label>
            <select
              id="tier-filter"
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              aria-label="Filter courses by pricing tier"
            >
              <option value="all">All Tiers</option>
              <option value="FREE">Free</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedTrack !== 'all' ||
          selectedLevel !== 'all' ||
          selectedTier !== 'all' ||
          searchTerm) && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            <button
              onClick={handleClearFilters}
              className="text-sm text-primary-blue hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
            {hasMore && ' (scroll for more)'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Unable to load courses"
          description={error}
          action={
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          }
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Course Grid */}
      {!loading && !error && courses.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.courseId} course={course} />
            ))}
          </div>

          {/* Load More Trigger */}
          {hasMore && (
            <div ref={targetRef} className="flex justify-center py-8">
              {loadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin h-5 w-5 border-2 border-primary-blue border-t-transparent rounded-full" />
                  <span>Loading more courses...</span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && courses.length === 0 && (
        <EmptyState
          icon={<BookOpen />}
          title="No courses found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          }
        />
      )}
    </div>
  );
}

// Course Card Component
function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/en/courses/${course.courseId}`}
      className="group focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 rounded-xl"
    >
      <article className="bg-background border rounded-xl overflow-hidden hover:border-primary-blue hover:shadow-lg transition-all h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 overflow-hidden">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              {course.track === 'coding' ? (
                <Code className="h-16 w-16 text-primary-blue/40" aria-hidden="true" />
              ) : (
                <BookOpen className="h-16 w-16 text-green-600/40" aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
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
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground capitalize">
              {course.track === 'computer-skills' ? 'Computer Skills' : 'Coding'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-blue transition-colors line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
            {course.shortDescription || course.description}
          </p>

          {/* Created By */}
          <p className="text-xs text-muted-foreground mb-4">
            Created by Allied iMpact
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-1" title={`${course.estimatedHours} hours`}>
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{course.estimatedHours}h</span>
            </div>
            <div className="flex items-center gap-1" title={`${course.enrollmentCount} enrolled`}>
              <Users className="h-4 w-4" aria-hidden="true" />
              <span>{course.enrollmentCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1" title={`${course.rating} rating`}>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span>{course.rating}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
