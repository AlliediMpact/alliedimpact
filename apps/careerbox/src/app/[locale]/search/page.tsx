'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Search, MapPin, Briefcase, DollarSign, Clock, Building2, X, SlidersHorizontal, Star, StarOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface JobSearchResult {
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
  matchScore?: number;
  description: string;
  skills: string[];
  isSaved: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string || 'en';

  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [location, setLocation] = useState(searchParams?.get('location') || '');
  const [jobType, setJobType] = useState<string>(searchParams?.get('type') || 'all');
  const [salaryMin, setSalaryMin] = useState<string>(searchParams?.get('salary') || '');
  const [experience, setExperience] = useState<string>(searchParams?.get('experience') || 'all');
  const [showFilters, setShowFilters] = useState(false);
  
  const [results, setResults] = useState<JobSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (searchQuery || location) {
      performSearch();
    }
  }, [searchQuery, location, jobType, salaryMin, experience]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockResults: JobSearchResult[] = [
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
          matchScore: 95,
          description: 'We are seeking an experienced software engineer to join our growing team...',
          skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
          isSaved: false
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
          matchScore: 88,
          description: 'Join our innovative team building cutting-edge web applications...',
          skills: ['JavaScript', 'Python', 'PostgreSQL', 'Docker'],
          isSaved: true
        },
        {
          id: '3',
          title: 'Frontend Developer',
          company: {
            name: 'Creative Studios',
            location: 'Pretoria, GP'
          },
          type: 'Contract',
          location: 'Pretoria, GP (On-site)',
          salary: { min: 40000, max: 60000, currency: 'ZAR' },
          postedDate: '2026-01-06',
          description: 'Create beautiful, responsive web interfaces for our clients...',
          skills: ['React', 'CSS', 'JavaScript', 'Figma'],
          isSaved: false
        },
      ];

      // Filter results based on search criteria
      let filtered = mockResults;
      
      if (searchQuery) {
        filtered = filtered.filter(job => 
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      if (location) {
        filtered = filtered.filter(job =>
          job.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      if (jobType !== 'all') {
        filtered = filtered.filter(job => job.type.toLowerCase() === jobType.toLowerCase());
      }

      if (salaryMin) {
        filtered = filtered.filter(job => job.salary.min >= parseInt(salaryMin));
      }

      setResults(filtered);
      setTotalResults(filtered.length);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
    
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('location', location);
    if (jobType !== 'all') params.set('type', jobType);
    if (salaryMin) params.set('salary', salaryMin);
    if (experience !== 'all') params.set('experience', experience);
    
    router.push(`/${locale}/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocation('');
    setJobType('all');
    setSalaryMin('');
    setExperience('all');
  };

  const toggleSaveJob = (jobId: string) => {
    setResults(prev =>
      prev.map(job =>
        job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
      )
    );
  };

  const formatSalary = (job: JobSearchResult) => {
    const { min, max, currency } = job.salary;
    return `R${(min / 1000).toFixed(0)}k - R${(max / 1000).toFixed(0)}k per month`;
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Search</h1>
          <p className="text-gray-600">Find your next career opportunity</p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Job Title / Keywords */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="City or province"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle & Search Button */}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>

                <Button type="submit" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Jobs
                </Button>

                {(searchQuery || location || jobType !== 'all' || salaryMin || experience !== 'all') && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  {/* Job Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="all">All Types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  {/* Minimum Salary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Salary (monthly)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="e.g., 25000"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="all">All Levels</option>
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (3-5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                      <option value="lead">Lead/Principal</option>
                    </select>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results Header */}
        {!isLoading && results.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{totalResults}</span> jobs found
              {searchQuery && (
                <span> for "<span className="font-medium">{searchQuery}</span>"</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>Most Relevant</option>
                <option>Most Recent</option>
                <option>Highest Salary</option>
                <option>Best Match</option>
              </select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <LoadingSkeleton variant="card" height="200px" count={5} />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && (searchQuery || location) && (
          <EmptyState
            icon={Search}
            title="No jobs found"
            description="Try adjusting your search criteria or filters to find more results"
            action={{ label: "Clear Filters", onClick: clearFilters }}
          />
        )}

        {/* Initial State */}
        {!isLoading && results.length === 0 && !searchQuery && !location && (
          <EmptyState
            icon={Search}
            title="Start your job search"
            description="Enter keywords or location to find relevant job opportunities"
          />
        )}

        {/* Search Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((job) => (
              <Card
                key={job.id}
                className="transition-all hover:shadow-md cursor-pointer"
                onClick={() => router.push(`/${locale}/dashboard/individual/matches/${job.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
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
                            {getDaysAgo(job.postedDate)}
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
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job.id);
                      }}
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={job.isSaved ? 'Remove from saved' : 'Save for later'}
                    >
                      {job.isSaved ? (
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
