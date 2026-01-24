'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { HealthEvent, Alert } from '@/types/events';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<HealthEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { toast } = useToast();

  // Real-time app health data
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'controlhub_app_health'),
      (snapshot) => {
        const healthData = snapshot.docs.map(doc => ({
          ...doc.data(),
          appId: doc.id,
        })) as HealthEvent[];
        setApps(healthData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching health data:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to load app health data. Retrying...',
          variant: 'destructive',
        });
      }
    );
    return () => unsubscribe();
  }, [toast]);

  // Real-time alerts data
  useEffect(() => {
    const alertsQuery = query(
      collection(db, 'controlhub_alerts'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Alert[];
      setAlerts(alertsData);
    });
    return () => unsubscribe();
  }, []);

  const healthyApps = apps.filter(app => app.status === 'healthy').length;
  const activeAlerts = alerts.filter(alert => !alert.resolved).length;
  const avgUptime = apps.length > 0 ? 99.8 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Platform Overview</h1>
        <p className="text-slate-400 mt-1">
          Real-time monitoring across all Allied iMpact apps
        </p>
      </div>

      {/* Platform Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Apps</p>
              <p className="mt-2 text-3xl font-bold">{apps.length}</p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Healthy Apps</p>
              <p className="mt-2 text-3xl font-bold text-green-500">{healthyApps}</p>
            </div>
            <div className="rounded-full bg-green-500/10 p-3">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="mt-2 text-3xl font-bold text-yellow-500">{activeAlerts}</p>
            </div>
            <div className="rounded-full bg-yellow-500/10 p-3">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="mt-2 text-3xl font-bold">{avgUptime.toFixed(1)}%</p>
            </div>
            <div className="rounded-full bg-purple-500/10 p-3">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* App Health Cards */}
      <div>
        <h2 className="text-xl font-bold mb-4">App Health Status</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No app health data available. Apps need to start sending health pings.
            </div>
          ) : (
            apps.map((app) => (
              <div key={app.appId} className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full animate-pulse ${
                      app.status === 'healthy' ? 'bg-green-500' :
                      app.status === 'degraded' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <h3 className="font-semibold capitalize">{app.appId}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium capitalize ${
                      app.status === 'healthy' ? 'text-green-500' :
                      app.status === 'degraded' ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>{app.status}</span>
                  </div>
                  {app.metrics?.responseTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Response Time</span>
                      <span>{app.metrics.responseTime}ms</span>
                    </div>
                  )}
                  {app.metrics?.activeUsers && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Users</span>
                      <span>{app.metrics.activeUsers.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {/* CoinBox */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-semibold text-slate-100">CoinBox</h3>
              </div>
              <span className="text-xs text-slate-400">2min ago</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Response Time</span>
                <span className="text-slate-300">145ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Users</span>
                <span className="text-slate-300">1,234</span>
              </div>
            </div>
          </div>

          {/* SportsHub */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-semibold text-slate-100">SportsHub</h3>
              </div>
              <span className="text-xs text-slate-400">1min ago</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Response Time</span>
                <span className="text-slate-300">98ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Users</span>
                <span className="text-slate-300">856</span>
              </div>
            </div>
          </div>

          {/* DriveMaster */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
                <h3 className="font-semibold text-slate-100">DriveMaster</h3>
              </div>
              <span className="text-xs text-slate-400">3min ago</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-yellow-400 font-medium">Degraded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Response Time</span>
                <span className="text-yellow-300">420ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Users</span>
                <span className="text-slate-300">342</span>
              </div>
            </div>
          </div>

          {/* EduTech */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-semibold text-slate-100">EduTech</h3>
              </div>
              <span className="text-xs text-slate-400">1min ago</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Response Time</span>
                <span className="text-slate-300">112ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Users</span>
                <span className="text-slate-300">678</span>
              </div>
            </div>
          </div>

          {/* Portal */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-semibold text-slate-100">Portal</h3>
              </div>
              <span className="text-xs text-slate-400">2min ago</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Response Time</span>
                <span className="text-slate-300">89ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Users</span>
                <span className="text-slate-300">2,156</span>
              </div>
            </div>
          </div>

          {/* MyProjects */}
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-semibold text-slate-100">MyProjects</h3>
              </div>
              <span className="text-xs text-slate-400">2min ago</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Response Time</span>
                <span className="text-slate-300">156ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Users</span>
                <span className="text-slate-300">234</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-4">Recent Alerts</h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900">
          <div className="divide-y divide-slate-800">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-yellow-500/10 p-2">
                  <span className="text-lg">⚠️</span>
                </div>
                <div>
                  <p className="font-medium text-slate-100">High Response Time Detected</p>
                  <p className="text-sm text-slate-400">DriveMaster - Response time exceeded 400ms threshold</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">5 min ago</span>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <span className="text-lg">ℹ️</span>
                </div>
                <div>
                  <p className="font-medium text-slate-100">Unusual Login Pattern</p>
                  <p className="text-sm text-slate-400">CoinBox - Multiple failed login attempts from same IP</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">12 min ago</span>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-2">
                  <span className="text-lg">✅</span>
                </div>
                <div>
                  <p className="font-medium text-slate-100">Deployment Successful</p>
                  <p className="text-sm text-slate-400">SportsHub - Version 2.1.5 deployed to production</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
