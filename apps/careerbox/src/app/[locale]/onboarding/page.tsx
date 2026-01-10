'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, Rocket, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const [isChecking, setIsChecking] = useState(true);
  const [userType, setUserType] = useState<'individual' | 'company' | null>(null);

  useEffect(() => {
    // TODO: Check if user has completed profile
    const checkProfileStatus = async () => {
      try {
        // Simulate API call to check profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock: Check if profile exists in Firebase
        const hasProfile = false; // Would check Firestore

        if (hasProfile) {
          // Redirect to dashboard if profile already exists
          router.replace(`/${locale}/dashboard/${userType || 'individual'}`);
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
        setIsChecking(false);
      }
    };

    checkProfileStatus();
  }, [router, locale, userType]);

  const handleSelectUserType = (type: 'individual' | 'company') => {
    setUserType(type);
    // Navigate to profile creation
    router.push(`/${locale}/profile/${type}/create`);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <Rocket className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to CareerBox!</h1>
          <p className="text-xl text-gray-600">
            Let's get you started on your journey to finding the perfect match
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            I am a...
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Individual Card */}
            <Card
              className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-600 group"
              onClick={() => handleSelectUserType('individual')}
            >
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-100 group-hover:bg-blue-600 rounded-full mb-6 transition-colors">
                  <User className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Job Seeker</h3>
                <p className="text-gray-600 mb-6">
                  I'm looking for exciting career opportunities that match my skills and experience
                </p>
                <ul className="text-left space-y-2 text-sm text-gray-700 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Create your professional profile
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Get matched with relevant job opportunities
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Connect directly with hiring companies
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Track your applications and interviews
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </CardContent>
            </Card>

            {/* Company Card */}
            <Card
              className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-indigo-600 group"
              onClick={() => handleSelectUserType('company')}
            >
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-indigo-100 group-hover:bg-indigo-600 rounded-full mb-6 transition-colors">
                  <Building2 className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Employer</h3>
                <p className="text-gray-600 mb-6">
                  I'm hiring and looking for talented candidates to join our team
                </p>
                <ul className="text-left space-y-2 text-sm text-gray-700 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Create your company profile
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Post job listings and requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Get matched with qualified candidates
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Streamline your hiring process
                  </li>
                </ul>
                <Button className="w-full">Get Started</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
            What makes CareerBox different?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="inline-flex items-center justify-center h-12 w-12 bg-green-100 rounded-full mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Matching</h4>
              <p className="text-sm text-gray-600">
                AI-powered matching algorithm ensures you only see relevant opportunities
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center h-12 w-12 bg-blue-100 rounded-full mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Direct Communication</h4>
              <p className="text-sm text-gray-600">
                Skip the middleman and connect directly with hiring managers or candidates
              </p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center h-12 w-12 bg-purple-100 rounded-full mb-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Local Focus</h4>
              <p className="text-sm text-gray-600">
                Built for South African professionals with local market understanding
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Already have a profile? This is just a demo - in production, you'd be redirected automatically.</p>
        </div>
      </div>
    </div>
  );
}
