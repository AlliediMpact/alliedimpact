'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsByEndpoint: Record<string, number>;
  requestsByDay: Array<{ date: string; count: number }>;
  rateLimitHits: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ApiUsageDashboard({ apiKeyId }: { apiKeyId?: string }) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadUsageStats();
  }, [apiKeyId, timeRange]);

  const loadUsageStats = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockStats: UsageStats = {
        totalRequests: 15420,
        successfulRequests: 14856,
        failedRequests: 564,
        averageResponseTime: 245,
        requestsByEndpoint: {
          '/api/v1/loans': 5230,
          '/api/v1/investments': 3890,
          '/api/v1/transactions': 4120,
          '/api/v1/crypto/orders': 2180,
        },
        requestsByDay: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: Math.floor(Math.random() * 3000) + 1000,
        })),
        rateLimitHits: 23,
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-center p-8">No usage data available</div>;
  }

  const successRate = ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1);

  const endpointData = Object.entries(stats.requestsByEndpoint).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">API Usage & Analytics</h2>
        <p className="text-muted-foreground mt-2">
          Monitor your API usage and performance metrics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRequests.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.successfulRequests.toLocaleString()} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Hits</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rateLimitHits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.rateLimitHits > 0 ? 'Consider upgrading tier' : 'Well within limits'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Requests Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Requests Over Time</CardTitle>
            <CardDescription>Daily API request volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.requestsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests by Endpoint */}
        <Card>
          <CardHeader>
            <CardTitle>Requests by Endpoint</CardTitle>
            <CardDescription>Distribution across endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={endpointData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    `${name.split('/').pop()}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {endpointData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Endpoints</CardTitle>
          <CardDescription>Most frequently accessed endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpointData.map((endpoint, index) => (
              <div key={endpoint.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{endpoint.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {endpoint.value.toLocaleString()} requests
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {((endpoint.value / stats.totalRequests) * 100).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
