'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { OfflineContentManager } from '@/components/OfflineContentManager';
import { ContentCachingService } from '@/lib/services/ContentCachingService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function OfflineModePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [freshness, setFreshness] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    checkFreshness();
  }, []);

  const checkFreshness = async () => {
    const cachingService = new ContentCachingService();
    const days = await cachingService.getCacheFreshness();
    setFreshness(days);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Offline Mode</h1>
              <p className="text-sm text-gray-600">Download content for offline practice</p>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary">← Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Cache Freshness Alert */}
        {freshness !== null && freshness > 7 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div>
                <h3 className="text-xl font-bold mb-2">Content Update Available</h3>
                <p className="text-gray-700 mb-4">
                  Your offline content is {freshness} days old. Update to get the latest journeys and questions.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Offline Content Manager */}
          <div>
            <OfflineContentManager />
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">How Offline Mode Works</h3>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">1️⃣</span>
                  <div>
                    <div className="font-semibold mb-1">Download Content</div>
                    <div>Cache Beginner journeys to your device while connected to internet.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">2️⃣</span>
                  <div>
                    <div className="font-semibold mb-1">Practice Offline</div>
                    <div>Complete journeys without internet. Progress is saved locally.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">3️⃣</span>
                  <div>
                    <div className="font-semibold mb-1">Auto-Sync</div>
                    <div>When you reconnect, your progress syncs automatically to the cloud.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Features</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Complete Beginner stage offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Progress saved locally</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Auto-sync when online</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Credits & badges sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Cheat detection</span>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-bold mb-2">Requirements</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>• Modern browser with IndexedDB support</div>
                <div>• ~5-10 MB free storage space</div>
                <div>• Stable internet for initial download</div>
                <div>• Must sync within 7 days</div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="font-bold mb-2 text-yellow-800">Important Notes</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div>⚠️ Only Beginner stage available offline</div>
                <div>⚠️ Progress must sync within 7 days</div>
                <div>⚠️ Suspicious activity will be flagged</div>
                <div>⚠️ Server data takes precedence in conflicts</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
