'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Star, MapPin, Briefcase, DollarSign, Clock, Building2, Trash2, Filter, Grid, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

interface SavedJob {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
    location: string;
  };
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  postedDate: string;
  savedDate: string;
  matchScore?: number;
  description: string;
  skills: string[];
}

export default function SavedJobsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const userType = params?.userType as string || 'individual';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock saved jobs - TODO: Replace with actual data from Firebase
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: {
        name: 'TechCorp Solutions',
        location: 'Johannesburg, GP'
      },
      type: 'Full-time',
      location: 'Johannesburg, GP (Remote options)',
      salary: { min: 60000, max: 90000, currency: 'ZAR' },
      postedDate: '2026-01-08',
      savedDate: '2026-01-10',
      matchScore: 95,
      description: 'We are seeking an experienced software engineer to join our growing team...',
      skills: ['React', 'TypeScript', 'Node.js', 'AWS']
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      company: {
        name: 'Innovate Digital',
        location: 'Cape Town, WC'
      },
      type: 'Full-time',
      location: 'Cape Town, WC (Hybrid)',
      salary: { min: 50000, max: 75000, currency: 'ZAR' },
      postedDate: '2026-01-07',
      savedDate: '2026-01-09',
      matchScore: 88,
      description: 'Join our innovative team building cutting-edge web applications...',
      skills: ['JavaScript', 'Python', 'PostgreSQL', 'Docker']
    },
    {
      id: '3',
      title: 'UX/UI Designer',
      company: {
        name: 'Creative Studios',
        location: 'Pretoria, GP'
      },
      type: 'Contract',
      location: 'Pretoria, GP (On-site)',
      salary: { min: 40000, max: 60000, currency: 'ZAR' },
      postedDate: '2026-01-06',
      savedDate: '2026-01-08',
      description: 'Create beautiful, user-friendly interfaces for web and mobile...',
      skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping']
    },
  ]);

  const filteredJobs = filterType === 'all'
    ? savedJobs
    : savedJobs.filter(job => job.type.toLowerCase() === filterType.toLowerCase());

  const removeSavedJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const formatSalary = (job: SavedJob) => {
    const { min, max } = job.salary;
    return `R${(min / 1000).toFixed(0)}k - R${(max / 1000).toFixed(0)}k`;
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const navigateToJob = (jobId: string) => {
    router.push(`/${locale}/dashboard/${userType}/matches/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              Saved Jobs
            </h1>
            <p className="text-gray-600 mt-2">
              {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved for later
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2"
            >
              <Grid className="h-4 w-4" />
              Grid
            </Button>
          </div>
        </div>

        {/* Filters */}
        {savedJobs.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by type:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'full-time', 'part-time', 'contract', 'internship'].map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type)}
                      className="capitalize"
                    >
                      {type === 'all' ? 'All Jobs' : type}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {savedJobs.length === 0 && (
          <EmptyState
            icon={Star}
            title="No saved jobs yet"
            description="Start saving jobs you're interested in to easily find them later"
            action={{
              label: "Browse Jobs",
              onClick: () => router.push(`/${locale}/search`)
            }}
          />
        )}

        {/* Job Grid - Grid View */}
        {viewMode === 'grid' && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="transition-all hover:shadow-md cursor-pointer group relative"
                onClick={() => navigateToJob(job.id)}
              >
                <CardContent className="p-6">
                  {/* Remove Button */}
                  <button
                    onClick={(e) => removeSavedJob(job.id, e)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                    title="Remove from saved"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Company Logo */}
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {job.company.name.charAt(0)}
                  </div>

                  {/* Job Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {job.title}
                  </h3>

                  {/* Company Name */}
                  <p className="text-gray-600 flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{job.company.name}</span>
                  </p>

                  {/* Match Score */}
                  {job.matchScore && (
                    <Badge variant="success" className="mb-3">
                      {job.matchScore}% Match
                    </Badge>
                  )}

                  {/* Job Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 flex-shrink-0" />
                      {formatSalary(job)}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.skills.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Posted Date */}
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Saved {getDaysAgo(job.savedDate)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Job List - List View */}
        {viewMode === 'list' && filteredJobs.length > 0 && (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="transition-all hover:shadow-md cursor-pointer group"
                onClick={() => navigateToJob(job.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {job.company.name.charAt(0)}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {job.company.name}
                          </p>
                        </div>
                        
                        {/* Match Score */}
                        {job.matchScore && (
                          <Badge variant="success" className="flex items-center gap-1">
                            {job.matchScore}% Match
                          </Badge>
                        )}
                      </div>

                      {/* Job Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(job)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Saved {getDaysAgo(job.savedDate)}
                        </span>
                      </div>

                      {/* Description Preview */}
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {job.description}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={(e) => removeSavedJob(job.id, e)}
                      className="flex-shrink-0 p-2 hover:bg-red-50 rounded-lg transition-colors group/remove"
                      title="Remove from saved"
                    >
                      <Trash2 className="h-5 w-5 text-gray-400 group-hover/remove:text-red-600" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results After Filter */}
        {filteredJobs.length === 0 && savedJobs.length > 0 && (
          <EmptyState
            icon={Filter}
            title="No jobs match this filter"
            description="Try selecting a different job type to see more results"
            action={{
              label: "Show All Jobs",
              onClick: () => setFilterType('all')
            }}
          />
        )}
      </div>
    </div>
  );
}
