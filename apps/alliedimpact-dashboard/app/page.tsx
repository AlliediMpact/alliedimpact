'use client';

import { useDashboard } from './lib/dashboard-context';
import { analytics, AnalyticsEvents } from './lib/analytics';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardEngine, UserArchetype, detectArchetypes } from './lib/dashboard-engine';
import { getSubscriptionProducts, getProduct } from '@allied-impact/shared';
import ProductGrid from './components/ProductGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { Sparkles, TrendingUp, Users, LayoutDashboard, AlertCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@allied-impact/ui';

export default function DashboardPage() {
  const { platformUser, entitlements, loading } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [archetypes, setArchetypes] = useState<UserArchetype[]>([UserArchetype.INDIVIDUAL]);
  const [dashboardView, setDashboardView] = useState<string>('individual');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeSubscriptions = entitlements.filter(e => e.status === 'active').length;
  const subscriptionProducts = getSubscriptionProducts();

  useEffect(() => {
    if (platformUser) {
      // Detect user archetypes
      const detectedArchetypes = detectArchetypes({
        email: platformUser.email || '',
        customClaims: (platformUser as any).customClaims
      });
      setArchetypes(detectedArchetypes);

      // Determine primary view
      const primaryView = DashboardEngine.getPrimaryView(detectedArchetypes);
      setDashboardView(primaryView);

      // Track analytics
      analytics.page('Dashboard', {
        userId: platformUser.uid,
        activeSubscriptions,
        view: primaryView,
        archetypes: detectedArchetypes
      });
    }
  }, [platformUser, activeSubscriptions]);

  // Handle error messages from redirects
  useEffect(() => {
    const Error Message Alert */}
      {errorMessage && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="flex items-start justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-4 hover:opacity-70 transition-opacity"
              aria-label="Dismiss"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* error = searchParams.get('error');
    const productId = searchParams.get('product');
    
    if (error && productId) {
      const product = getProduct(productId);
      const productName = product?.name || productId;
      
      let message = '';
      switch (error) {
        case 'auth-required':
          message = `Please sign in to access ${productName}.`;
          break;
        case 'subscription-required':
          message = `You need an active subscription to access ${productName}. Subscribe below to get started!`;
          break;
        case 'error':
          message = `There was an error accessing ${productName}. Please try again or contact support if the issue persists.`;
          break;
        default:
          message = `Unable to access ${productName}.`;
      }
      
      setErrorMessage(message);
      
      // Track error in analytics
      analytics.track(AnalyticsEvents.ERROR_OCCURRED, {
        userId: platformUser?.uid,
        error,
        product: productId,
        message
      });
      
      // Clear error message after 10 seconds
      const timer = setTimeout(() => setErrorMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, platformUser]);

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
Start a Project CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Need a Custom Solution?</h3>
                <p className="text-gray-600 mb-4 max-w-2xl">
                  Looking for a custom web app, mobile solution, or API integration? 
                  Our team builds tailored solutions for businesses, NGOs, schools, and government.
                </p>
                <Button
                  onClick={() => router.push('/solutions/discover')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Start a Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 
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
