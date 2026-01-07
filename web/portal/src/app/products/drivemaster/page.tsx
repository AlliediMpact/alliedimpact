'use client';

import { ArrowRight, Car, BookOpen, Video, Award, Map, Calendar, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DriveMasterPage() {
  const features = [
    {
      icon: BookOpen,
      title: 'Theory Training',
      description: 'Comprehensive K53 theory prep with practice tests and quizzes.',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'HD driving lessons covering all maneuvers and road situations.',
    },
    {
      icon: Map,
      title: 'Route Planning',
      description: 'Practice routes and test center navigation guides.',
    },
    {
      icon: Calendar,
      title: 'Booking System',
      description: 'Schedule practical lessons and tests with certified instructors.',
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Monitor your learning journey and readiness for testing.',
    },
    {
      icon: Shield,
      title: 'Licensed Instructors',
      description: 'Learn from qualified, background-checked driving professionals.',
    },
    {
      icon: Car,
      title: 'Vehicle Access',
      description: 'Use instructor vehicles for lessons and test day.',
    },
    {
      icon: TrendingUp,
      title: 'High Pass Rate',
      description: 'Our students achieve 87% first-time pass rate.',
    },
  ];

  const offerings = [
    'Code 08 (Light Motor Vehicle)',
    'Code 10 (Heavy Motor Vehicle)',
    'Code 14 (Extra Heavy Vehicle)',
    'Motorcycle licenses (A, A1)',
    'Defensive driving courses',
    'Refresher training for experienced drivers',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-br from-primary-blue via-[#1a3690] to-primary-purple overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span>COMING SOON</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                Drive Master
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed">
                Your complete journey to becoming a confident, licensed driver. From K53 theory to test day success with South Africa's most comprehensive driver training platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="#notify"
                  className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group"
                >
                  Get Notified at Launch
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="#features"
                  className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-blue font-semibold px-8 py-4 rounded-lg transition-colors"
                >
                  Learn More
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-6 text-sm">
                <div>
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-white/70">Pass Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">150+</div>
                  <div className="text-white/70">Instructors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">9 Provinces</div>
                  <div className="text-white/70">Coverage</div>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="w-full h-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Car className="w-32 h-32 text-white/50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Everything You Need to Pass Your Test
            </h2>
            <p className="text-lg text-muted-foreground">
              Drive Master combines digital learning with real-world instruction for the best results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="p-6 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors group"
                >
                  <div className="w-12 h-12 mb-4 rounded-lg bg-primary-blue/10 flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary-blue" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* License Types Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">All License Types Covered</h2>
              <p className="text-lg text-muted-foreground">
                Whether you're learning to drive a car, truck, or motorcycle, we've got you covered.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offerings.map((offering, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-background border border-muted hover:border-primary-blue transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-blue flex-shrink-0" />
                  <span className="text-sm font-medium">{offering}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notify Section */}
      <section id="notify" className="w-full py-20 bg-gradient-to-br from-primary-blue to-primary-purple text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span>LAUNCHING Q2 2026</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Be First to Drive Master
            </h2>
            <p className="text-xl text-white/90">
              Join our waiting list and get exclusive early-bird discounts when we launch.
            </p>
            <div className="pt-4">
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group text-lg"
              >
                Join Waiting List
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-sm text-white/70 pt-2">
              Requires Allied iMpact account • No payment required to join waitlist
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
