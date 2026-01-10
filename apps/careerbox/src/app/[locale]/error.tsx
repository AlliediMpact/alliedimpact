'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          We encountered an unexpected error. Don't worry, our team has been notified and is working on a fix.
        </p>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-8 text-left">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Error Details (Development Only)</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto">
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {error.message}
                  {error.digest && `\n\nDigest: ${error.digest}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button onClick={reset} size="lg">
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>
          <Link href={`/${locale}`}>
            <Button variant="outline" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Help Card */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Still having issues?
            </h3>
            <p className="text-gray-600 mb-4">
              If this problem persists, please contact our support team for assistance.
            </p>
            <Link href={`/${locale}/contact`}>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
