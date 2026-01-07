'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="w-full py-20 bg-gradient-to-br from-primary-blue via-primary-blue/95 to-primary-blue/90 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of users already experiencing the power of Allied iMpact. 
            Sign up once and unlock access to all our products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg transition-colors group"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-blue font-semibold px-8 py-4 text-lg rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-white/70 pt-4">
            No credit card required • Free to join • Access all products
          </p>
        </div>
      </div>
    </section>
  );
}
