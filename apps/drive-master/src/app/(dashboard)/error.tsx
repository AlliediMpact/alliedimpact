'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Error
        </h2>

        <p className="text-gray-600 mb-6">
          We couldn't load your dashboard. Your data is safe.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-mono text-gray-700">
              {error.message}
            </p>
          </div>
        )}

        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Reload Dashboard
        </button>
      </div>
    </div>
  );
}
