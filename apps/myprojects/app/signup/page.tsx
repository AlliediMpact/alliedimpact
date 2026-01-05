'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { CheckCircle, Loader2 } from 'lucide-react';

interface DiscoveryData {
  projectType: string;
  customProjectType?: string;
  budgetRange: string;
  timeline: string;
  description: string;
  organizationName?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
}

export default function MyProjectsSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    const discoveryId = searchParams.get('discovery');
    
    if (!discoveryId) {
      // No discovery ID - redirect to platform
      router.push('https://platform.alliedimpact.com/solutions/discover');
      return;
    }

    // Fetch discovery data from platform
    fetchDiscoveryData(discoveryId);
  }, [searchParams, router]);

  const fetchDiscoveryData = async (discoveryId: string) => {
    try {
      const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
      const response = await fetch(`${platformUrl}/api/solutions/discovery?id=${discoveryId}`);

      if (!response.ok) {
        throw new Error('Discovery data not found');
      }

      const { data } = await response.json();
      setDiscoveryData(data);
    } catch (error) {
      console.error('Failed to fetch discovery data:', error);
      alert('Discovery session expired. Please start again.');
      window.location.href = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create account with discovery data
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: discoveryData!.contactEmail,
          password,
          name: discoveryData!.contactName,
          organizationName: discoveryData!.organizationName,
          phone: discoveryData!.contactPhone,
          discoveryData // Pass discovery data to create first project
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const { userId, projectId } = await response.json();

      // Redirect to dashboard
      router.push('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(error.message || 'Signup failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!discoveryData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3">Create Your Account</h1>
        <p className="text-lg text-gray-600">
          Your project dashboard is ready. Just one more step!
        </p>
      </div>

      {/* Project Summary */}
      <Card className="mb-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Your Project</CardTitle>
          <CardDescription>We'll create this project automatically when you sign up</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Type:</strong> {discoveryData.projectType === 'custom' ? discoveryData.customProjectType : discoveryData.projectType}</div>
          <div><strong>Budget:</strong> {discoveryData.budgetRange}</div>
          <div><strong>Timeline:</strong> {discoveryData.timeline}</div>
          <div><strong>Description:</strong> {discoveryData.description.slice(0, 100)}...</div>
        </CardContent>
      </Card>

      {/* Signup Form */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>We've pre-filled your information from the discovery form</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Pre-filled fields (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={discoveryData.contactName}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={discoveryData.contactEmail}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              />
            </div>

            {discoveryData.organizationName && (
              <div>
                <label className="block text-sm font-medium mb-2">Organization</label>
                <input
                  type="text"
                  value={discoveryData.organizationName}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
            )}

            {/* Password fields */}
            <div>
              <label className="block text-sm font-medium mb-2">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-2 border rounded-lg"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2 border rounded-lg"
                required
                minLength={8}
              />
            </div>

            {/* Terms acceptance */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I accept the{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account & Start Project'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
}
