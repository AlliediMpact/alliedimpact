'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section 
      className="relative w-full min-h-screen flex items-center justify-center text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #193281 0%, #5e17eb 100%)' }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">One Identity. Multiple Products.</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            Welcome to{' '}
            <span className="text-yellow-300">
              Allied iMpact
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            One platform. Six powerful products. Sign up once and access financial services, 
            project management, education, sports engagement, and more—all with a single account.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              💰 Financial Services
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              📊 Project Management
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              🚗 Driving Education
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              💻 Tech Training
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              ⚽ Sports & Community
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-primary-blue hover:bg-white/90 transition-all group"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-primary-blue transition-all"
            >
              Explore Products
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8">
            <p className="text-sm text-white/70 mb-4">Trusted by thousands across South Africa</p>
            <div className="flex flex-wrap justify-center gap-6 items-center">
              <div className="text-center">
                <div className="text-2xl font-bold">6</div>
                <div className="text-xs text-white/70">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-xs text-white/70">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">R50M+</div>
                <div className="text-xs text-white/70">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-xs text-white/70">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
