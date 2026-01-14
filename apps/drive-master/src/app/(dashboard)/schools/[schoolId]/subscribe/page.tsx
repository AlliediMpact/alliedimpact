'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { DrivingSchoolService, DrivingSchool } from '@/lib/services/DrivingSchoolService';
import { Button } from '@allied-impact/ui';

export default function SchoolSubscribePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const schoolId = params.schoolId as string;

  const [school, setSchool] = useState<DrivingSchool | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly_3' | 'annual'>('annual');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadSchool();
  }, [user, schoolId]);

  const loadSchool = async () => {
    try {
      const drivingSchoolService = new DrivingSchoolService();
      const fetchedSchool = await drivingSchoolService.getSchool(schoolId);
      setSchool(fetchedSchool);
    } catch (error) {
      console.error('Error loading school:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (!school || !user) return;

    const drivingSchoolService = new DrivingSchoolService();
    const paymentData = drivingSchoolService.getPayFastPaymentData(
      schoolId,
      selectedPlan,
      school.contactEmail,
      `${window.location.origin}/school-dashboard/subscription-success`,
      `${window.location.origin}/school-dashboard/subscription-cancel`,
      `${window.location.origin}/api/payfast/notify`
    );

    // Create PayFast form and submit
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = process.env.NEXT_PUBLIC_PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process';

    Object.entries(paymentData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">School Not Found</h2>
        </div>
      </div>
    );
  }

  const plans = new DrivingSchoolService().getSubscriptionPlans();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Subscribe to Advertise</h1>
          <p className="text-sm text-gray-600">{school.name}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Choose Your Plan</h2>
          <p className="text-gray-600 text-center mb-8">
            Get your driving school in front of thousands of learners
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* 3-Month Plan */}
            <div
              onClick={() => setSelectedPlan('monthly_3')}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedPlan === 'monthly_3'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">3 Months</h3>
                  <p className="text-sm text-gray-600">Short-term commitment</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'monthly_3'
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedPlan === 'monthly_3' && <span className="text-white text-xs">✓</span>}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold mb-1">R{plans.monthly_3.amount}</div>
                <div className="text-sm text-gray-600">for 3 months</div>
                <div className="text-xs text-gray-500 mt-1">
                  ~R{(plans.monthly_3.amount / 3).toFixed(0)}/month
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Featured in home carousel</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Listed in discovery page</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Regional targeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Lead tracking dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>20% commission per lead</span>
                </div>
              </div>
            </div>

            {/* Annual Plan */}
            <div
              onClick={() => setSelectedPlan('annual')}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all relative ${
                selectedPlan === 'annual'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                SAVE 16%
              </div>

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">12 Months</h3>
                  <p className="text-sm text-gray-600">Best value</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'annual'
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedPlan === 'annual' && <span className="text-white text-xs">✓</span>}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold mb-1">R{plans.annual.amount}</div>
                <div className="text-sm text-gray-600">for 12 months</div>
                <div className="text-xs text-gray-500 mt-1">
                  ~R{(plans.annual.amount / 12).toFixed(0)}/month
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Featured in home carousel</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Listed in discovery page</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Regional targeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Lead tracking dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>20% commission per lead</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-semibold">Priority placement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribe Button */}
          <Button onClick={handleSubscribe} className="w-full" size="lg">
            Subscribe Now - R
            {selectedPlan === 'monthly_3' ? plans.monthly_3.amount : plans.annual.amount}
          </Button>

          {/* Payment Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">What happens next?</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>You'll be redirected to PayFast to complete secure payment</li>
              <li>Your school profile will be activated immediately after payment</li>
              <li>Your ads will start showing to learners across the platform</li>
              <li>Track leads and confirm conversions in your school dashboard</li>
              <li>Earn 20% commission from DriveMaster for each confirmed lead</li>
            </ol>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">How does the 20% commission work?</h4>
              <p className="text-sm text-gray-700">
                When a learner converts to your customer, DriveMaster pays you 20% of your
                subscription amount per confirmed lead. For the annual plan, that's R199.80 per
                lead!
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">How do I confirm conversions?</h4>
              <p className="text-sm text-gray-700">
                Simply mark leads as "confirmed" in your school dashboard once they become paying
                customers. This allows us to calculate your commission.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">When do I receive commission payments?</h4>
              <p className="text-sm text-gray-700">
                Commissions are calculated monthly and paid via EFT. You'll receive a detailed
                statement in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
