'use client';

import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-2xl p-12 text-center">
          <div className="text-8xl mb-6">😔</div>
          <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your payment was cancelled. No charges were made.
          </p>

          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 mb-8">
            <h2 className="font-bold text-blue-900 mb-3">💡 Still Interested?</h2>
            <ul className="text-left text-blue-800 space-y-2">
              <li>• Lifetime access for just R99</li>
              <li>• All stages unlocked permanently</li>
              <li>• Unlimited journeys and practice</li>
              <li>• Free updates and new content</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/subscription">
              <Button size="lg">Try Again</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
