'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@allied-impact/ui';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Learn by Living the Journey
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Master your K53 learner's license with immersive, journey-based learning.
              From Beginner to Expert, every question happens in context.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/register">
                    <Button size="lg" variant="secondary">
                      Start Free
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why DriveMaster?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon="🎮"
              title="Journey-Based Learning"
              description="Experience realistic driving scenarios. Every question happens in context, not in isolation."
            />
            <FeatureCard
              icon="📈"
              title="Mastery Progression"
              description="95%+ required to advance. No shortcuts. Build real confidence through proven competence."
            />
            <FeatureCard
              icon="🎯"
              title="Gamified Experience"
              description="Earn credits, unlock badges, build streaks. Stay motivated as you master each stage."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p className="mb-4 text-sm">
              <strong>Important Disclaimer:</strong> DriveMaster is not affiliated with the South African government.
              We are not an official testing center. This platform provides preparation only.
              You must pass the official K53 test at a recognized testing center to obtain your learner's license.
            </p>
            <p>&copy; {new Date().getFullYear()} Allied iMpact. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
