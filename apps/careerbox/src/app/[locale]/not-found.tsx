'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Home, Search, ArrowLeft, Briefcase, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            404
          </h1>
          <div className="h-2 w-32 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href={`/${locale}`}>
            <Button className="w-full" size="lg">
              <Home className="h-5 w-5 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline" className="w-full" size="lg">
              <Briefcase className="h-5 w-5 mr-2" />
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Helpful Links */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Looking for something specific?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <Link href={`/${locale}/dashboard/individual/matches`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Briefcase className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Browse Jobs</div>
                  <div className="text-sm text-gray-600">Find your perfect match</div>
                </div>
              </Link>
              
              <Link href={`/${locale}/dashboard/company/listings`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Search className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Manage Listings</div>
                  <div className="text-sm text-gray-600">Post and edit job listings</div>
                </div>
              </Link>

              <Link href={`/${locale}/profile`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Home className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Your Profile</div>
                  <div className="text-sm text-gray-600">Update your information</div>
                </div>
              </Link>

              <Link href={`/${locale}/help`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">Get Help</div>
                  <div className="text-sm text-gray-600">FAQs and support</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
