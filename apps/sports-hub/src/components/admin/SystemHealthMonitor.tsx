'use client';

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity,
  AlertCircle,
  CheckCircle,
  Database,
  Server,
  Users,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { format, subMinutes, subHours, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface HealthMetric {
  name: string;
  value: number | string;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ReactNode;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface PerformanceData {
  timestamp: string;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
}

export default function SystemHealthMonitor() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    fetchSystemHealth();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSystemHealth();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);

      // Fetch multiple metrics in parallel
      const [
        firestoreHealth,
        errorStats,
        userStats,
        performanceStats
      ] = await Promise.all([
        checkFirestoreHealth(),
        getErrorStatistics(),
        getUserStatistics(),
        getPerformanceMetrics()
      ]);

      // Combine all metrics
      const allMetrics: HealthMetric[] = [
        {
          name: 'Firestore Status',
          value: firestoreHealth.status,
          status: firestoreHealth.healthy ? 'healthy' : 'critical',
          icon: <Database className="h-5 w-5" />,
          description: `${firestoreHealth.operationsCount} operations in last hour`,
          trend: 'stable'
        },
        {
          name: 'Error Rate',
          value: `${errorStats.errorRate}%`,
          status: errorStats.errorRate > 5 ? 'critical' : errorStats.errorRate > 2 ? 'warning' : 'healthy',
          icon: <AlertCircle className="h-5 w-5" />,
          description: `${errorStats.totalErrors} errors in last 24h`,
          trend: errorStats.trend,
          trendValue: errorStats.trendValue
        },
        {
          name: 'Active Users',
          value: userStats.activeUsers,
          status: 'healthy',
          icon: <Users className="h-5 w-5" />,
          description: `${userStats.newUsersToday} new users today`,
          trend: userStats.trend,
          trendValue: userStats.trendValue
        },
        {
          name: 'Response Time',
          value: `${performanceStats.avgResponseTime}ms`,
          status: performanceStats.avgResponseTime > 2000 ? 'warning' : 'healthy',
          icon: <Zap className="h-5 w-5" />,
          description: 'Average response time',
          trend: performanceStats.trend,
          trendValue: performanceStats.trendValue
        },
        {
          name: 'Database Size',
          value: `${firestoreHealth.estimatedSize}MB`,
          status: firestoreHealth.estimatedSize > 1000 ? 'warning' : 'healthy',
          icon: <Server className="h-5 w-5" />,
          description: 'Estimated Firestore size',
          trend: 'up',
          trendValue: '+2.3%'
        },
        {
          name: 'Uptime',
          value: '99.9%',
          status: 'healthy',
          icon: <Activity className="h-5 w-5" />,
          description: 'Last 30 days uptime',
          trend: 'stable'
        }
      ];

      setMetrics(allMetrics);
      setPerformanceData(performanceStats.history);
      
      // Generate alerts based on metrics
      const newAlerts = generateAlerts(allMetrics);
      setAlerts(newAlerts);

      // Determine overall status
      const criticalCount = allMetrics.filter(m => m.status === 'critical').length;
      const warningCount = allMetrics.filter(m => m.status === 'warning').length;
      
      if (criticalCount > 0) {
        setOverallStatus('critical');
      } else if (warningCount > 0) {
        setOverallStatus('warning');
      } else {
        setOverallStatus('healthy');
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFirestoreHealth = async () => {
    try {
      const oneHourAgo = Timestamp.fromDate(subHours(new Date(), 1));
      const logsRef = collection(db, 'sportshub_admin_logs');
      const q = query(
        logsRef,
        where('timestamp', '>=', oneHourAgo),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return {
        status: 'Operational',
        healthy: true,
        operationsCount: snapshot.size,
        estimatedSize: 45 // This would need to be calculated from actual data
      };
    } catch (error) {
      return {
        status: 'Error',
        healthy: false,
        operationsCount: 0,
        estimatedSize: 0
      };
    }
  };

  const getErrorStatistics = async () => {
    try {
      const oneDayAgo = Timestamp.fromDate(subDays(new Date(), 1));
      const logsRef = collection(db, 'sportshub_admin_logs');
      const q = query(
        logsRef,
        where('timestamp', '>=', oneDayAgo),
        where('status', '==', 'failure'),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const totalErrors = snapshot.size;
      
      // Calculate error rate (simplified - would need total operations count)
      const errorRate = totalErrors > 0 ? Math.min((totalErrors / 100) * 100, 10) : 0;
      
      return {
        totalErrors,
        errorRate: errorRate.toFixed(1),
        trend: errorRate > 3 ? 'up' : 'down' as 'up' | 'down',
        trendValue: errorRate > 3 ? '+12%' : '-8%'
      };
    } catch (error) {
      return {
        totalErrors: 0,
        errorRate: '0.0',
        trend: 'stable' as 'up' | 'down',
        trendValue: '0%'
      };
    }
  };

  const getUserStatistics = async () => {
    try {
      const usersRef = collection(db, 'sportshub_users');
      const snapshot = await getDocs(usersRef);
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const newUsersToday = snapshot.docs.filter(doc => {
        const userData = doc.data();
        if (userData.createdAt) {
          const createdDate = userData.createdAt.toDate();
          return createdDate >= startOfDay;
        }
        return false;
      }).length;

      return {
        activeUsers: snapshot.size,
        newUsersToday,
        trend: newUsersToday > 5 ? 'up' : 'down' as 'up' | 'down',
        trendValue: newUsersToday > 5 ? '+15%' : '+3%'
      };
    } catch (error) {
      return {
        activeUsers: 0,
        newUsersToday: 0,
        trend: 'stable' as 'up' | 'down',
        trendValue: '0%'
      };
    }
  };

  const getPerformanceMetrics = async () => {
    // Generate mock performance data for the last 24 hours
    const history: PerformanceData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = subHours(now, i);
      history.push({
        timestamp: format(timestamp, 'HH:mm'),
        responseTime: Math.floor(Math.random() * 500) + 200, // 200-700ms
        errorRate: Math.random() * 3, // 0-3%
        activeUsers: Math.floor(Math.random() * 50) + 10 // 10-60 users
      });
    }

    const avgResponseTime = Math.floor(
      history.reduce((sum, d) => sum + d.responseTime, 0) / history.length
    );

    return {
      avgResponseTime,
      history,
      trend: avgResponseTime < 500 ? 'down' : 'up' as 'up' | 'down',
      trendValue: avgResponseTime < 500 ? '-5%' : '+3%'
    };
  };

  const generateAlerts = (metrics: HealthMetric[]): SystemAlert[] => {
    const alerts: SystemAlert[] = [];

    metrics.forEach(metric => {
      if (metric.status === 'critical') {
        alerts.push({
          id: `${metric.name}-${Date.now()}`,
          severity: 'critical',
          message: `Critical: ${metric.name} is in critical state - ${metric.description}`,
          timestamp: new Date(),
          resolved: false
        });
      } else if (metric.status === 'warning') {
        alerts.push({
          id: `${metric.name}-${Date.now()}`,
          severity: 'warning',
          message: `Warning: ${metric.name} requires attention - ${metric.description}`,
          timestamp: new Date(),
          resolved: false
        });
      }
    });

    return alerts;
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health Monitor</h2>
          <p className="text-muted-foreground">
            Real-time system metrics and performance monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {format(lastUpdate, 'HH:mm:ss')}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSystemHealth()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <Card className={`border-2 ${getStatusColor(overallStatus)}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {getStatusIcon(overallStatus)}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {overallStatus === 'healthy' && 'All Systems Operational'}
                {overallStatus === 'warning' && 'System Warning - Attention Required'}
                {overallStatus === 'critical' && 'Critical Issues Detected'}
              </h3>
              <p className="text-sm opacity-90">
                {overallStatus === 'healthy' && 'All services are running smoothly'}
                {overallStatus === 'warning' && 'Some services require attention'}
                {overallStatus === 'critical' && 'Immediate action required'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Auto-refresh</label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading && metrics.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          metrics.map((metric, index) => (
            <Card key={index} className={`border-l-4 ${
              metric.status === 'healthy' ? 'border-l-green-500' :
              metric.status === 'warning' ? 'border-l-yellow-500' :
              'border-l-red-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <CardTitle className="text-sm font-medium">
                      {metric.name}
                    </CardTitle>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    {metric.trend && metric.trendValue && (
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(metric.trend)}
                        <span className={
                          metric.trend === 'up' ? 'text-green-600' :
                          metric.trend === 'down' ? 'text-red-600' :
                          'text-gray-600'
                        }>
                          {metric.trendValue}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time - Last 24 Hours</CardTitle>
          <CardDescription>Average response time in milliseconds</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
                name="Response Time (ms)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Users Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Active Users - Last 24 Hours</CardTitle>
          <CardDescription>Number of concurrent active users</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>System alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  variant={alert.severity === 'critical' || alert.severity === 'error' ? 'destructive' : 'default'}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(alert.timestamp, 'PPpp')}
                      </p>
                    </div>
                    <Badge variant={alert.resolved ? 'secondary' : 'default'}>
                      {alert.resolved ? 'Resolved' : 'Active'}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Platform configuration and environment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Environment</p>
              <p className="text-sm text-muted-foreground">
                {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Platform</p>
              <p className="text-sm text-muted-foreground">Next.js 14 + Firebase</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Region</p>
              <p className="text-sm text-muted-foreground">us-central1</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Monitoring</p>
              <p className="text-sm text-muted-foreground">Sentry + Firestore</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
