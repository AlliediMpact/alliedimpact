'use client';

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/');
    } else {
      alert('Still offline. Please check your internet connection.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-full shadow-xl">
              <WifiOff className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isOnline
            ? "Connection restored! Redirecting..."
            : "No internet connection detected. Please check your network settings and try again."}
        </p>

        {/* Status Indicator */}
        {isOnline ? (
          <div className="mb-8 flex items-center justify-center text-green-600 dark:text-green-400">
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            <span className="font-medium">Reconnecting...</span>
          </div>
        ) : (
          <div className="mb-8 flex items-center justify-center text-red-600 dark:text-red-400">
            <WifiOff className="w-5 h-5 mr-2" />
            <span className="font-medium">No Connection</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleRetry}
            disabled={!navigator.onLine}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-colors duration-200 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </button>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            While offline, you can:
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 text-left">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              View cached pages and data
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Browse previously loaded content
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Check your account balance (last synced)
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              View transaction history
            </li>
          </ul>
        </div>

        {/* Network Info */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-600">
          <p>Connection Type: {(navigator as any).connection?.effectiveType || 'Unknown'}</p>
          <p>Last Online: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}
