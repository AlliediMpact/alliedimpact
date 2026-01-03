'use client';

import { useDashboard } from '../lib/dashboard-context';
import { analytics, AnalyticsEvents } from '../lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { Input } from '@allied-impact/ui';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  revenue: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
}

export default function AdminPage() {
  const { user, platformUser } = useDashboard();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    revenue: 0,
  });
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: 99.9,
    responseTime: 45,
    errorRate: 0.1,
  });

  useEffect(() => {
    // Check if user has admin role
    // TODO: Implement proper role checking with custom claims
    const checkAdminAccess = async () => {
      try {
        // For now, simulate admin check
        // In production, check user.customClaims.role === 'admin'
        
        // Simulate data loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setStats({
          totalUsers: 1247,
          activeUsers: 856,
          newUsersToday: 23,
          revenue: 45230.50,
        });

        setHealth({
          status: 'healthy',
          uptime: 99.95,
          responseTime: 42,
          errorRate: 0.08,
        });

        setLoading(false);
      } catch (error) {
        console.error('Admin access check failed:', error);
        router.push('/');
      }
    };

    checkAdminAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Platform management and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Admin Access</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.newUsersToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% active rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {getHealthIcon(health.status)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getHealthColor(health.status)}`}>
              {health.status}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {health.uptime}% uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Details */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Metrics</CardTitle>
          <CardDescription>Real-time platform performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm text-green-600 font-medium">{health.uptime}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${health.uptime}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avg Response Time</span>
                <span className="text-sm text-blue-600 font-medium">{health.responseTime}ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((health.responseTime / 100) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm text-yellow-600 font-medium">{health.errorRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ width: `${health.errorRate * 10}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and permissions</CardDescription>
            </div>
            <Button>Add User</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search users by name, email, or ID..." className="flex-1" />
            </div>

            <div className="border rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-sm">User</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Subscriptions</th>
                    <th className="text-left py-3 px-4 font-medium text-sm">Joined</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-accent/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">User {i}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">user{i}@example.com</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{Math.floor(Math.random() * 3) + 1}</td>
                      <td className="py-3 px-4 text-sm">Jan {i}, 2026</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing 1-5 of {stats.totalUsers.toLocaleString()} users</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>Monthly revenue and growth trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Revenue chart will be integrated here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
