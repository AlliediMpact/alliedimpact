'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Payment verification happens via webhook
    // This page just shows success message
    setTimeout(() => {
      router.push('/dashboard');
    }, 5000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-2xl p-12 text-center">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your lifetime subscription is being activated...
          </p>

          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 mb-8">
            <h2 className="font-bold text-green-900 mb-3">What's Next?</h2>
            <ul className="text-left text-green-800 space-y-2">
              <li>✓ Your account will be upgraded within seconds</li>
              <li>✓ All stages will be unlocked automatically</li>
              <li>✓ Unlimited journeys starting now</li>
              <li>✓ Lifetime access with all future updates</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
            <Link href="/journeys">
              <Button variant="outline" size="lg">
                Start Learning
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Redirecting to dashboard in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
