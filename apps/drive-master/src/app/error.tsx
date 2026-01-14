'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error);

    // TODO: Log to Sentry in production
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error);
    // }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Oops! Something went wrong
        </h1>

        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Don't worry, your progress is safe.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-mono text-gray-800 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          If this problem persists, please{' '}
          <a href="mailto:support@drivemaster.co.za" className="text-emerald-600 hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
