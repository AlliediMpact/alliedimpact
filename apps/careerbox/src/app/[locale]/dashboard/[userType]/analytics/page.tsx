'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Eye, FileText, MessageSquare, Calendar, ArrowUpRight, ArrowDownRight, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [userType] = useState<'individual' | 'company'>('individual');

  // Individual Analytics Data
  const individualStats = {
    profileViews: {
      total: 847,
      change: 15.3,
      trend: 'up' as const,
      weeklyData: [45, 52, 48, 63, 58, 71, 67, 84, 79, 92, 88, 102]
    },
    applications: {
      total: 24,
      pending: 8,
      interviewing: 4,
      rejected: 10,
      offered: 2,
      conversionRate: 33.3,
      change: -5.2,
      trend: 'down' as const
    },
    engagement: {
      profileCompleteness: 95,
      responseRate: 87,
      avgResponseTime: '2.5 hours',
      savedJobs: 12,
      alertsActive: 3
    },
    topCompanies: [
      { name: 'TechCorp Solutions', views: 15, applications: 2 },
      { name: 'Innovate Digital', views: 12, applications: 1 },
      { name: 'Creative Studios', views: 8, applications: 1 },
      { name: 'StartupHub', views: 7, applications: 0 },
      { name: 'Enterprise Corp', views: 6, applications: 3 }
    ]
  };

  // Company Analytics Data
  const companyStats = {
    jobListings: {
      active: 12,
      filled: 5,
      totalApplications: 156,
      avgApplicationsPerJob: 13
    },
    candidates: {
      viewed: 234,
      contacted: 45,
      interviewing: 18,
      hired: 3
    },
    engagement: {
      profileViews: 1543,
      viewsChange: 22.7,
      avgTimeToHire: '18 days',
      responseRate: 92
    }
  };

  const stats = userType === 'individual' ? individualStats : companyStats;

  const applicationFunnelData = [
    { stage: 'Applied', count: 24, percentage: 100 },
    { stage: 'Reviewed', count: 20, percentage: 83.3 },
    { stage: 'Shortlisted', count: 14, percentage: 58.3 },
    { stage: 'Interviewed', count: 6, percentage: 25.0 },
    { stage: 'Offered', count: 2, percentage: 8.3 }
  ];

  const maxCount = Math.max(...applicationFunnelData.map(d => d.count));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Track your job search performance and engagement metrics
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Period:</span>
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {userType === 'individual' ? (
          <>
            {/* Key Metrics - Individual */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Profile Views */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Profile Views
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">
                    {individualStats.profileViews.total}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center gap-1 text-sm ${
                    individualStats.profileViews.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {individualStats.profileViews.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(individualStats.profileViews.change).toFixed(1)}% vs last {dateRange}
                  </div>
                </CardContent>
              </Card>

              {/* Applications */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Applications
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">
                    {individualStats.applications.total}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">{individualStats.applications.pending} Pending</Badge>
                    <Badge variant="success">{individualStats.applications.interviewing} Interviewing</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Rate */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Conversion Rate
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">
                    {individualStats.applications.conversionRate}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Applications to interviews
                  </p>
                </CardContent>
              </Card>

              {/* Profile Completeness */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Profile Score
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold">
                    {individualStats.engagement.profileCompleteness}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="success">Excellent</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Profile Views Trend */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Profile Views Trend
                </CardTitle>
                <CardDescription>
                  Your profile view activity over the past {dateRange}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {individualStats.profileViews.weeklyData.map((views, idx) => {
                    const maxViews = Math.max(...individualStats.profileViews.weeklyData);
                    const percentage = (views / maxViews) * 100;
                    
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600 w-16">
                          Week {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-10 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              >
                                <span className="text-sm font-medium text-white">
                                  {views}
                                </span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 w-12">
                              {views} views
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Application Funnel */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Application Funnel
                </CardTitle>
                <CardDescription>
                  Track your application progress through each stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicationFunnelData.map((stage, idx) => (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {stage.stage}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {stage.percentage.toFixed(1)}%
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {stage.count} applications
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 flex items-center justify-start pl-3 ${
                              idx === 0 ? 'bg-blue-600' :
                              idx === 1 ? 'bg-blue-500' :
                              idx === 2 ? 'bg-blue-400' :
                              idx === 3 ? 'bg-indigo-500' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${stage.percentage}%` }}
                          >
                            {stage.percentage > 15 && (
                              <span className="text-xs font-medium text-white">
                                {stage.count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Funnel Insights */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Insights</h4>
                      <p className="text-sm text-blue-800">
                        You're performing well! Your interview rate ({individualStats.applications.conversionRate}%) 
                        is above the platform average of 25%. Keep applying to quality positions that match your skills.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Engagement Metrics
                </CardTitle>
                <CardDescription>
                  Your activity and responsiveness on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Response Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {individualStats.engagement.responseRate}%
                    </p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${individualStats.engagement.responseRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {individualStats.engagement.avgResponseTime}
                    </p>
                    <Badge variant="success" className="mt-2">Fast</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Saved Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {individualStats.engagement.savedJobs}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Active bookmarks</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {individualStats.engagement.alertsActive}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Job notifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Top Companies Viewing Your Profile
                </CardTitle>
                <CardDescription>
                  Companies showing the most interest in your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {individualStats.topCompanies.map((company, idx) => (
                    <div key={company.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-gray-400">
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{company.name}</h4>
                          <p className="text-sm text-gray-600">
                            {company.views} profile {company.views === 1 ? 'view' : 'views'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={company.applications > 0 ? 'success' : 'secondary'}>
                          {company.applications} {company.applications === 1 ? 'application' : 'applications'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // Company Analytics would go here
          <div>Company analytics coming soon...</div>
        )}
      </div>
    </div>
  );
}
