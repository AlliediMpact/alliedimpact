'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Briefcase, Check, X } from 'lucide-react';

export default function PricingPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const plans = [
    {
      tier: 'free',
      name: 'Free',
      price: 'R0',
      period: '/month',
      description: 'Get started and see what matches await',
      features: [
        { text: 'See number of potential matches', included: true },
        { text: 'See names only (no full profiles)', included: true },
        { text: 'Basic search and filters', included: true },
        { text: 'Email notifications', included: true },
        { text: 'Full profile viewing', included: false },
        { text: 'Messaging', included: false },
        { text: 'Location details', included: false },
        { text: 'Priority matching', included: false },
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      tier: 'entry',
      name: 'Entry',
      price: 'R1,000',
      period: '/month',
      description: 'Perfect for active job seekers and growing companies',
      features: [
        { text: 'Everything in Free, plus:', included: true },
        { text: 'View up to 10 full profiles/month', included: true },
        { text: 'Send up to 5 messages/month', included: true },
        { text: 'City/province location visibility', included: true },
        { text: 'Priority support', included: true },
        { text: 'Unlimited matches', included: false },
        { text: 'Exact location details', included: false },
        { text: 'Priority matching', included: false },
      ],
      cta: 'Choose Entry',
      popular: true,
    },
    {
      tier: 'classic',
      name: 'Classic',
      price: 'R5,000',
      period: '/month',
      description: 'Full access for serious professionals and recruiters',
      features: [
        { text: 'Everything in Entry, plus:', included: true },
        { text: 'Unlimited profile viewing', included: true },
        { text: 'Unlimited messaging', included: true },
        { text: 'Exact location with coordinates', included: true },
        { text: 'Priority matching (shown first)', included: true },
        { text: 'Advanced filters and search', included: true },
        { text: 'Team members (for companies)', included: true },
        { text: 'Analytics dashboard', included: true },
      ],
      cta: 'Choose Classic',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CareerBox</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}`} className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link 
              href={`/${locale}/auth/login`}
              className="px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your needs. Start free, upgrade anytime.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative flex flex-col rounded-2xl border-2 ${
                plan.popular
                  ? 'border-blue-600 shadow-xl'
                  : 'border-gray-200'
              } p-8`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/${locale}/auth/signup`}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately,
                and you'll be billed pro-rata for the difference.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens when I reach my monthly limits?
              </h3>
              <p className="text-gray-600">
                On the Entry plan, once you've viewed 10 profiles or sent 5 messages, you'll need to wait
                until next month or upgrade to Classic for unlimited access.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee on all paid plans. If you're not satisfied,
                contact support within 7 days of purchase for a full refund.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use bank-level encryption (TLS 1.3) and store all data in secure Firebase
                databases. We never share your personal information with third parties.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do I need a credit card for the free plan?
              </h3>
              <p className="text-gray-600">
                No credit card required! The free plan is completely free with no hidden charges.
                You can browse matches and upgrade when you're ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your perfect match?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of job seekers and companies using CareerBox
          </p>
          <Link
            href={`/${locale}/auth/signup`}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold"
          >
            Start Free Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Allied iMpact. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
