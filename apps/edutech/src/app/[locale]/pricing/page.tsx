'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, GraduationCap, Code } from 'lucide-react';

const computerSkillsFeatures = [
  'All Computer Skills courses',
  'Basic Office applications',
  'Internet & Email basics',
  'Digital literacy certification',
  'Community forum access',
  'Lifetime course access',
];

const codingFeatures = [
  'All Computer Skills courses',
  'All Coding courses (200+)',
  'Web development track',
  'Mobile app development',
  'Career-ready projects',
  'Code review & feedback',
  'Interview preparation',
  'Job placement assistance',
  'Industry certifications',
  'Priority support',
  'Offline downloads',
  'Live coding sessions',
];

export default function PricingPage({ params }: { params: { locale: string } }) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSelectPlan = (plan: 'free' | 'premium') => {
    if (!user) {
      router.push(`/${params.locale}/login?redirect=/pricing`);
      return;
    }

    if (plan === 'free') {
      // Redirect to courses (already have free access)
      router.push(`/${params.locale}/courses?track=computer-skills`);
    } else {
      // Integrate with @allied-impact/billing
      fetch('/ api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          plan: 'premium',
          productId: 'edu-tech',
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
          } else {
            alert('Premium subscription coming soon! Integration with billing platform in progress.');
          }
        })
        .catch((error) => {
          console.error('Billing error:', error);
          alert('Premium subscription coming soon! Integration with billing platform in progress.');
        });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 border-b">
        <div className="container py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">Choose Your Learning Path</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with free computer skills or unlock your coding potential with our
            premium track
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan - Computer Skills */}
          <div className="bg-background border-2 rounded-2xl p-8 hover:border-green-300 transition-colors">
            {/* Header */}
            <div className="mb-8">
              <div className="h-16 w-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Computer Skills</h2>
              <p className="text-muted-foreground mb-4">
                Essential digital literacy for everyone
              </p>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-green-600">Free</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Sponsored by our partners
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {computerSkillsFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => handleSelectPlan('free')}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Get Started Free
            </button>

            {/* Info */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              No credit card required
            </p>
          </div>

          {/* Premium Plan - Coding Track */}
          <div className="bg-gradient-to-br from-primary-blue/5 to-primary-purple/5 border-2 border-primary-blue rounded-2xl p-8 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-primary-blue text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                <Sparkles className="h-4 w-4" />
                <span>Most Popular</span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="h-16 w-16 bg-primary-blue/20 rounded-xl flex items-center justify-center mb-4">
                <Code className="h-8 w-8 text-primary-blue" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Coding Track</h2>
              <p className="text-muted-foreground mb-4">
                Launch your tech career with professional skills
              </p>
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold text-primary-blue">R99</span>
                <span className="text-muted-foreground ml-2">/month</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-primary-blue">R1,000</span>
                <span className="text-muted-foreground ml-2">/year</span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Save R188!
                </span>
              </div>
              <p className="text-sm text-green-600 font-semibold mt-3">
                🎉 30-Day FREE Trial for Coding Track
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                No credit card required for trial
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {codingFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-primary-blue flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => handleSelectPlan('premium')}
              className="w-full py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue/90 transition-colors"
            >
              Start 30-Day FREE Trial
            </button>

            {/* Info */}
            <p className="text-xs text-center text-muted-foreground mt-4">
              Then R99/month or R1,000/year, cancel anytime
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">
                What's included in the free Computer Skills track?
              </h3>
              <p className="text-muted-foreground">
                The Computer Skills track includes courses on basic computer operation,
                Microsoft Office, internet safety, email, and digital literacy. All
                courses are completely free and sponsored by NGOs and government
                initiatives.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Can I upgrade from the free track to premium later?
              </h3>
              <p className="text-muted-foreground">
                Absolutely! You can upgrade to the Coding Track anytime. Your progress
                in the Computer Skills courses will be saved, and you'll gain immediate
                access to all premium coding content.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is there a free trial for the Coding Track?</h3>
              <p className="text-muted-foreground">
                Yes! We offer a 30-day FREE trial for the Coding Track. You'll have full
                access to all coding courses during the trial, and you won't be charged
                unless you decide to continue after the trial ends.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What are the subscription options?</h3>
              <p className="text-muted-foreground">
                After your 30-day trial, you can choose between R99/month (billed monthly)
                or R1,000/year (billed annually, save R188 per year). Both options give you
                full access to all coding courses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Do I get certificates for completing courses?
              </h3>
              <p className="text-muted-foreground">
                Yes! Both free and premium tracks offer certificates of completion.
                These certificates are verifiable and can be added to your LinkedIn
                profile or CV.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and mobile money
                payments. Payment processing is secure and handled through our Allied
                iMpact platform.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Can I access courses offline?
              </h3>
              <p className="text-muted-foreground">
                Premium Coding Track members can download course materials for offline
                viewing. This is perfect for learning without an internet connection.
                The Computer Skills track requires an active internet connection.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What if I need help or support?</h3>
              <p className="text-muted-foreground">
                All users have access to our community forums and knowledge base.
                Premium members also receive priority email support with response times
                under 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-blue to-primary-purple rounded-2xl p-12 text-center text-white mt-20">
          <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners building their digital skills
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => handleSelectPlan('free')}
              className="px-8 py-3 bg-white text-primary-blue rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free
            </button>
            <button
              onClick={() => handleSelectPlan('premium')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Try Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
