'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SubscriptionService, SubscriptionInfo } from '@/lib/services/SubscriptionService';
import { Button } from '@allied-impact/ui';
import Link from 'next/link';

export default function SubscriptionPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [activatingTrial, setActivatingTrial] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const subscriptionService = new SubscriptionService(user.uid);
      const info = await subscriptionService.getSubscriptionInfo();
      setSubscriptionInfo(info);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTrial = async () => {
    if (!user) return;

    setActivatingTrial(true);
    try {
      const subscriptionService = new SubscriptionService(user.uid);
      await subscriptionService.activateTrial();
      
      // Reload subscription info
      await loadSubscription();
      
      // Show success message
      alert('🎉 Trial activated! You now have 7 days of full access.');
    } catch (error: any) {
      alert(`Failed to activate trial: ${error.message}`);
    } finally {
      setActivatingTrial(false);
    }
  };

  const handleUpgradeToPaid = () => {
    if (!user || !userProfile) return;

    const subscriptionService = new SubscriptionService(user.uid);
    const payFastData = subscriptionService.getPayFastPaymentData(
      `${window.location.origin}/subscription/success`,
      `${window.location.origin}/subscription/cancel`,
      `${window.location.origin}/api/payfast/notify`
    );

    // Create form and submit to PayFast
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = process.env.NEXT_PUBLIC_PAYFAST_URL || 'https://sandbox.payfast.co.za/eng/process';

    Object.entries({ ...payFastData, email_address: userProfile.email }).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
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

  if (!subscriptionInfo) {
    return null;
  }

  const { tier, trialInfo } = subscriptionInfo;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Subscription</h1>
            <Link href="/dashboard">
              <Button variant="secondary">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Current Tier Status */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Current Plan</h2>
          <div className="flex items-center gap-6">
            <div className="text-6xl">
              {tier === 'free' && '🆓'}
              {tier === 'trial' && '⏰'}
              {tier === 'paid' && '⭐'}
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold capitalize mb-2">{tier} Plan</h3>
              {tier === 'trial' && trialInfo?.daysRemaining && (
                <div className="text-lg text-orange-600 font-semibold">
                  ⏳ {trialInfo.daysRemaining} day{trialInfo.daysRemaining !== 1 ? 's' : ''} remaining
                </div>
              )}
              {tier === 'paid' && subscriptionInfo.paidAt && (
                <div className="text-sm text-gray-600">
                  Activated on {subscriptionInfo.paidAt.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Trial Expiring Warning */}
          {tier === 'trial' && trialInfo?.daysRemaining && trialInfo.daysRemaining <= 2 && (
            <div className="mt-6 bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-bold text-orange-900">Trial Ending Soon!</div>
                  <div className="text-sm text-orange-700">
                    Upgrade now to keep unlimited access after trial ends
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Free Plan */}
          <PricingCard
            title="Free"
            price="R0"
            period=""
            features={[
              'Beginner stage only',
              '3 journeys per day',
              'Basic progress tracking',
              'Credits & streak system',
            ]}
            icon="🆓"
            isCurrent={tier === 'free'}
            buttonText="Current Plan"
            buttonDisabled={true}
          />

          {/* Trial Plan */}
          <PricingCard
            title="Trial"
            price="Free"
            period="7 days"
            features={[
              'All stages unlocked',
              'Unlimited journeys',
              'Full progress tracking',
              'All achievements',
              'One-time only',
            ]}
            icon="⏰"
            isCurrent={tier === 'trial'}
            recommended={tier === 'free' && trialInfo?.isEligible}
            buttonText={
              tier === 'trial'
                ? 'Active'
                : trialInfo?.isEligible
                ? 'Start Free Trial'
                : trialInfo?.ineligibilityReason || 'Not Available'
            }
            buttonDisabled={tier === 'trial' || !trialInfo?.isEligible}
            onButtonClick={handleActivateTrial}
            buttonLoading={activatingTrial}
          />

          {/* Paid Plan */}
          <PricingCard
            title="Lifetime"
            price="R99"
            period="once-off"
            features={[
              'Lifetime access',
              'All stages unlocked',
              'Unlimited journeys',
              'Priority support',
              'Future updates included',
              'Downloadable certificates',
            ]}
            icon="⭐"
            isCurrent={tier === 'paid'}
            recommended={tier === 'trial'}
            buttonText={tier === 'paid' ? 'Active' : 'Upgrade Now'}
            buttonDisabled={tier === 'paid'}
            onButtonClick={handleUpgradeToPaid}
          />
        </div>

        {/* Benefits Comparison */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Free</th>
                  <th className="text-center py-3 px-4">Trial</th>
                  <th className="text-center py-3 px-4">Lifetime</th>
                </tr>
              </thead>
              <tbody>
                <FeatureRow
                  feature="Beginner Stage"
                  free={true}
                  trial={true}
                  paid={true}
                />
                <FeatureRow
                  feature="Intermediate Stage"
                  free={false}
                  trial={true}
                  paid={true}
                />
                <FeatureRow
                  feature="Advanced Stage"
                  free={false}
                  trial={true}
                  paid={true}
                />
                <FeatureRow
                  feature="K53 Simulation"
                  free={false}
                  trial={true}
                  paid={true}
                />
                <FeatureRow
                  feature="Daily Journey Limit"
                  free="3 journeys"
                  trial="Unlimited"
                  paid="Unlimited"
                />
                <FeatureRow
                  feature="Progress Tracking"
                  free={true}
                  trial={true}
                  paid={true}
                />
                <FeatureRow
                  feature="Badges & Achievements"
                  free={true}
                  trial={true}
                  paid={true}
                />
                <FeatureRow
                  feature="Certificates"
                  free={false}
                  trial={true}
                  paid={true}
                />
                <FeatureRow
                  feature="Duration"
                  free="Forever"
                  trial="7 days"
                  paid="Lifetime"
                />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  icon,
  isCurrent,
  recommended,
  buttonText,
  buttonDisabled,
  onButtonClick,
  buttonLoading,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  icon: string;
  isCurrent?: boolean;
  recommended?: boolean;
  buttonText: string;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  buttonLoading?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-6 border-2 ${
        recommended
          ? 'border-primary-600 relative'
          : isCurrent
          ? 'border-green-500'
          : 'border-gray-200'
      }`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-bold">
          Recommended
        </div>
      )}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <div className="text-4xl font-bold text-primary-600 mb-1">{price}</div>
        {period && <div className="text-sm text-gray-600">{period}</div>}
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        onClick={onButtonClick}
        disabled={buttonDisabled || buttonLoading}
        className="w-full"
        variant={recommended ? 'default' : 'outline'}
      >
        {buttonLoading ? 'Processing...' : buttonText}
      </Button>
    </div>
  );
}

function FeatureRow({
  feature,
  free,
  trial,
  paid,
}: {
  feature: string;
  free: boolean | string;
  trial: boolean | string;
  paid: boolean | string;
}) {
  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <span className="text-green-600 text-xl">✓</span>
      ) : (
        <span className="text-gray-300 text-xl">−</span>
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <tr className="border-b">
      <td className="py-3 px-4">{feature}</td>
      <td className="text-center py-3 px-4">{renderCell(free)}</td>
      <td className="text-center py-3 px-4">{renderCell(trial)}</td>
      <td className="text-center py-3 px-4">{renderCell(paid)}</td>
    </tr>
  );
}
