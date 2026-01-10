'use client';

import { useState } from 'react';
import { Eye, TrendingUp, Calendar, Building2, MapPin, Users, Clock, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

interface ProfileViewer {
  id: string;
  name: string;
  company: string;
  position: string;
  location: string;
  viewedAt: string;
  profileImage?: string;
  viewCount: number;
}

interface ViewStats {
  totalViews: number;
  uniqueViewers: number;
  viewsThisWeek: number;
  weeklyChange: number; // percentage
  viewsThisMonth: number;
  monthlyChange: number; // percentage
}

export default function ProfileViewsPage() {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
  const [viewerTypeFilter, setViewerTypeFilter] = useState<'all' | 'recruiters' | 'companies'>('all');

  // Mock data - TODO: Replace with Firebase data
  const stats: ViewStats = {
    totalViews: 847,
    uniqueViewers: 234,
    viewsThisWeek: 42,
    weeklyChange: 15.3,
    viewsThisMonth: 156,
    monthlyChange: -8.2
  };

  const [viewers] = useState<ProfileViewer[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'TechCorp Solutions',
      position: 'Senior Recruiter',
      location: 'Johannesburg, GP',
      viewedAt: '2026-01-10T14:30:00',
      viewCount: 3
    },
    {
      id: '2',
      name: 'Michael Chen',
      company: 'Innovate Digital',
      position: 'Hiring Manager',
      location: 'Cape Town, WC',
      viewedAt: '2026-01-10T10:15:00',
      viewCount: 1
    },
    {
      id: '3',
      name: 'Emma Williams',
      company: 'Creative Studios',
      position: 'Talent Acquisition',
      location: 'Pretoria, GP',
      viewedAt: '2026-01-09T16:45:00',
      viewCount: 2
    },
    {
      id: '4',
      name: 'David Brown',
      company: 'StartupHub',
      position: 'Co-Founder & CTO',
      location: 'Durban, KZN',
      viewedAt: '2026-01-09T09:20:00',
      viewCount: 1
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      company: 'Enterprise Corp',
      position: 'HR Director',
      location: 'Johannesburg, GP',
      viewedAt: '2026-01-08T13:30:00',
      viewCount: 4
    }
  ]);

  const weeklyViewData = [
    { day: 'Mon', views: 8 },
    { day: 'Tue', views: 12 },
    { day: 'Wed', views: 6 },
    { day: 'Thu', views: 9 },
    { day: 'Fri', views: 5 },
    { day: 'Sat', views: 1 },
    { day: 'Sun', views: 1 }
  ];

  const maxViews = Math.max(...weeklyViewData.map(d => d.views));

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return '1 week ago';
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Eye className="h-8 w-8 text-blue-600" />
            Profile Views
          </h1>
          <p className="text-gray-600 mt-2">
            See who's been viewing your profile and track engagement over time
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Views */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Profile Views</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.totalViews}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                All time views
              </p>
            </CardContent>
          </Card>

          {/* Unique Viewers */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Unique Viewers</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.uniqueViewers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Individual people
              </p>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>This Week</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.viewsThisWeek}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-1 text-sm ${stats.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.weeklyChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {Math.abs(stats.weeklyChange).toFixed(1)}% vs last week
              </div>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.viewsThisMonth}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-1 text-sm ${stats.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.monthlyChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {Math.abs(stats.monthlyChange).toFixed(1)}% vs last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trend Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Weekly Views Trend
            </CardTitle>
            <CardDescription>Daily profile views for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyViewData.map((data) => (
                <div key={data.day} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-12">
                    {data.day}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${(data.views / maxViews) * 100}%` }}
                        >
                          {data.views > 0 && (
                            <span className="text-xs font-medium text-white">
                              {data.views}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8">
                        {data.views}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter viewers:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={timeFilter === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeFilter('week')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  This Week
                </Button>
                <Button
                  variant={timeFilter === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeFilter('month')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  This Month
                </Button>
                <Button
                  variant={timeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeFilter('all')}
                >
                  All Time
                </Button>
              </div>
              <div className="border-l pl-4 flex gap-2">
                <Button
                  variant={viewerTypeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewerTypeFilter('all')}
                >
                  All Viewers
                </Button>
                <Button
                  variant={viewerTypeFilter === 'recruiters' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewerTypeFilter('recruiters')}
                >
                  Recruiters
                </Button>
                <Button
                  variant={viewerTypeFilter === 'companies' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewerTypeFilter('companies')}
                >
                  Companies
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Viewers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Recent Viewers
            </CardTitle>
            <CardDescription>
              People who have viewed your profile recently
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewers.length === 0 ? (
              <EmptyState
                icon={Eye}
                title="No profile views yet"
                description="Keep your profile updated and active to attract more viewers"
              />
            ) : (
              <div className="space-y-4">
                {viewers.map((viewer) => (
                  <div
                    key={viewer.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getInitials(viewer.name)}
                    </div>

                    {/* Viewer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {viewer.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-1">
                            {viewer.position}
                          </p>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {viewer.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {viewer.location}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {viewer.viewCount > 1 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {viewer.viewCount} views
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(viewer.viewedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Eye className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Privacy Controls</h4>
                <p className="text-sm text-blue-800">
                  You can control who can see your profile view history in your{' '}
                  <button className="underline font-medium hover:text-blue-900">
                    privacy settings
                  </button>
                  . Some viewers may appear as anonymous if they've enabled private browsing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
