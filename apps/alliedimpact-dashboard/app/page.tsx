'use client';

import { useDashboard } from './lib/dashboard-context';
import { analytics, AnalyticsEvents } from './lib/analytics';
import { useEffect } from 'react';
import ProductGrid from './components/ProductGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Sparkles, TrendingUp, Users } from 'lucide-react';

export default function DashboardPage() {
  const { platformUser, entitlements, loading } = useDashboard();

  const activeSubscriptions = entitlements.filter(e => e.status === 'active').length;

  useEffect(() => {
    if (platformUser) {
      analytics.page('Dashboard', {
        userId: platformUser.uid,
        activeSubscriptions,
      });
    }
  }, [platformUser, activeSubscriptions]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {platformUser?.displayName || 'User'}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your Allied iMpact products and subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Products
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 bg-muted animate-pulse rounded w-16" />
            ) : (
              <div className="text-2xl font-bold">{activeSubscriptions}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Currently subscribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available to explore
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Status
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Products</h2>
        <ProductGrid />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Explore our resources to get the most out of Allied iMpact
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/subscriptions"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">Manage Subscriptions</h3>
            <p className="text-sm text-muted-foreground">
              View and upgrade your product subscriptions
            </p>
          </a>
          <a
            href="/profile"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">Update Profile</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </a>
          <a
            href={process.env.NEXT_PUBLIC_HOMEPAGE_URL || 'http://localhost:3000'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">Visit Homepage</h3>
            <p className="text-sm text-muted-foreground">
              Learn more about Allied iMpact products
            </p>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
