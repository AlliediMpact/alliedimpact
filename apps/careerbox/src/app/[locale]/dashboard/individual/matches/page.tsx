'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, X, TrendingUp, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatchCardSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { getInitials } from '@/lib/utils';

interface Match {
  id: string;
  score: number;
  company: {
    id: string;
    name: string;
    industry: string;
    size: string;
  };
  listing: {
    id: string;
    title: string;
    employmentType: string;
    location: { city: string; province: string; remote: string };
    salary: { min: number; max: number };
    experienceLevel: string;
    requiredSkills: string[];
  };
  matchedDate: Date;
}

export default function IndividualMatchesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    employmentType: [] as string[],
    location: [] as string[],
    experienceLevel: [] as string[],
    remote: [] as string[],
    salaryMin: '',
    salaryMax: '',
    industries: [] as string[],
  });

  const [sortBy, setSortBy] = useState<'score' | 'date' | 'salary'>('score');

  useEffect(() => {
    // TODO: Fetch matches from Firestore
    const fetchMatches = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock matches
        const mockMatches: Match[] = [
          {
            id: 'match-1',
            score: 92,
            company: { id: 'c1', name: 'TechCorp Solutions', industry: 'Technology', size: '51-200' },
            listing: {
              id: 'l1',
              title: 'Senior Software Engineer',
              employmentType: 'full-time',
              location: { city: 'Johannesburg', province: 'GP', remote: 'hybrid' },
              salary: { min: 60000, max: 80000 },
              experienceLevel: 'senior',
              requiredSkills: ['JavaScript', 'React', 'Node.js'],
            },
            matchedDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
          {
            id: 'match-2',
            score: 88,
            company: { id: 'c2', name: 'Digital Innovations', industry: 'Technology', size: '11-50' },
            listing: {
              id: 'l2',
              title: 'Full Stack Developer',
              employmentType: 'full-time',
              location: { city: 'Cape Town', province: 'WC', remote: 'remote' },
              salary: { min: 50000, max: 70000 },
              experienceLevel: 'mid',
              requiredSkills: ['TypeScript', 'React', 'PostgreSQL'],
            },
            matchedDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
          },
          {
            id: 'match-3',
            score: 85,
            company: { id: 'c3', name: 'StartupCo', industry: 'Finance', size: '1-10' },
            listing: {
              id: 'l3',
              title: 'React Developer',
              employmentType: 'contract',
              location: { city: 'Johannesburg', province: 'GP', remote: 'office' },
              salary: { min: 40000, max: 55000 },
              experienceLevel: 'mid',
              requiredSkills: ['React', 'JavaScript', 'CSS'],
            },
            matchedDate: new Date(Date.now() - 1000 * 60 * 60 * 72),
          },
          {
            id: 'match-4',
            score: 78,
            company: { id: 'c4', name: 'Enterprise Corp', industry: 'Healthcare', size: '201-1000' },
            listing: {
              id: 'l4',
              title: 'Frontend Engineer',
              employmentType: 'full-time',
              location: { city: 'Durban', province: 'KZN', remote: 'hybrid' },
              salary: { min: 55000, max: 65000 },
              experienceLevel: 'mid',
              requiredSkills: ['Vue.js', 'JavaScript', 'REST APIs'],
            },
            matchedDate: new Date(Date.now() - 1000 * 60 * 60 * 96),
          },
        ];

        setMatches(mockMatches);
        setFilteredMatches(mockMatches);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...matches];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.listing.title.toLowerCase().includes(query) ||
          m.company.name.toLowerCase().includes(query) ||
          m.company.industry.toLowerCase().includes(query) ||
          m.listing.requiredSkills.some(s => s.toLowerCase().includes(query))
      );
    }

    // Employment type filter
    if (filters.employmentType.length > 0) {
      filtered = filtered.filter(m => filters.employmentType.includes(m.listing.employmentType));
    }

    // Location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(m => filters.location.includes(m.listing.location.province));
    }

    // Experience level filter
    if (filters.experienceLevel.length > 0) {
      filtered = filtered.filter(m => filters.experienceLevel.includes(m.listing.experienceLevel));
    }

    // Remote filter
    if (filters.remote.length > 0) {
      filtered = filtered.filter(m => filters.remote.includes(m.listing.location.remote));
    }

    // Salary filter
    if (filters.salaryMin) {
      const min = parseInt(filters.salaryMin);
      filtered = filtered.filter(m => m.listing.salary.max >= min);
    }
    if (filters.salaryMax) {
      const max = parseInt(filters.salaryMax);
      filtered = filtered.filter(m => m.listing.salary.min <= max);
    }

    // Industry filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter(m => filters.industries.includes(m.company.industry));
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'date') return b.matchedDate.getTime() - a.matchedDate.getTime();
      if (sortBy === 'salary') return b.listing.salary.max - a.listing.salary.max;
      return 0;
    });

    setFilteredMatches(filtered);
  }, [matches, searchQuery, filters, sortBy]);

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const current = prev[category] as string[];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const clearAllFilters = () => {
    setFilters({
      employmentType: [],
      location: [],
      experienceLevel: [],
      remote: [],
      salaryMin: '',
      salaryMax: '',
      industries: [],
    });
    setSearchQuery('');
  };

  const activeFilterCount =
    filters.employmentType.length +
    filters.location.length +
    filters.experienceLevel.length +
    filters.remote.length +
    filters.industries.length +
    (filters.salaryMin ? 1 : 0) +
    (filters.salaryMax ? 1 : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
          <p className="text-gray-600">
            {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'} found
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, company, or skills..."
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="score">Sort by: Match Score</option>
              <option value="date">Sort by: Date</option>
              <option value="salary">Sort by: Salary</option>
            </select>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Employment Type */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Employment Type</h3>
                    <div className="space-y-2">
                      {['full-time', 'part-time', 'contract', 'internship'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.employmentType.includes(type)}
                            onChange={() => toggleFilter('employmentType', type)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                          <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Experience Level</h3>
                    <div className="space-y-2">
                      {['entry', 'mid', 'senior', 'executive'].map(level => (
                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.experienceLevel.includes(level)}
                            onChange={() => toggleFilter('experienceLevel', level)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                          <span className="text-sm capitalize">{level} Level</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Remote Work */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Remote Work</h3>
                    <div className="space-y-2">
                      {['office', 'hybrid', 'remote'].map(remote => (
                        <label key={remote} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.remote.includes(remote)}
                            onChange={() => toggleFilter('remote', remote)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                          <span className="text-sm capitalize">{remote}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Province */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Province</h3>
                    <div className="space-y-2">
                      {['GP', 'WC', 'KZN', 'EC'].map(prov => (
                        <label key={prov} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.location.includes(prov)}
                            onChange={() => toggleFilter('location', prov)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                          <span className="text-sm">{prov}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Industry</h3>
                    <div className="space-y-2">
                      {['Technology', 'Finance', 'Healthcare', 'Education'].map(ind => (
                        <label key={ind} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.industries.includes(ind)}
                            onChange={() => toggleFilter('industries', ind)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                          />
                          <span className="text-sm">{ind}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Salary Range (ZAR/month)</h3>
                    <div className="space-y-3">
                      <Input
                        type="number"
                        placeholder="Min salary"
                        value={filters.salaryMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max salary"
                        value={filters.salaryMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        ) : filteredMatches.length === 0 && matches.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No matches yet"
            description="Complete your profile and set your preferences to start receiving personalized job matches."
            action={{
              label: "Complete Profile",
              onClick: () => router.push(`/${locale}/dashboard/individual/profile`)
            }}
          />
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="No matches found"
            description="Try adjusting your filters or search query to see more results."
            action={{
              label: "Clear Filters",
              onClick: clearFilters
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMatches.map(match => (
              <Card
                key={match.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/${locale}/dashboard/individual/matches/${match.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        {getInitials(match.company.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{match.listing.title}</h3>
                        <p className="text-sm text-gray-600">{match.company.name}</p>
                      </div>
                    </div>
                    <Badge variant="success" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {match.score}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {match.listing.employmentType}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      <MapPin className="h-3 w-3 mr-1" />
                      {match.listing.location.city}, {match.listing.location.province}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {match.listing.location.remote}
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <DollarSign className="h-4 w-4 mr-1" />
                    R{match.listing.salary.min.toLocaleString()} - R
                    {match.listing.salary.max.toLocaleString()}/month
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {match.listing.requiredSkills.slice(0, 4).map(skill => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {match.listing.requiredSkills.length > 4 && (
                      <Badge variant="secondary">+{match.listing.requiredSkills.length - 4}</Badge>
                    )}
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
