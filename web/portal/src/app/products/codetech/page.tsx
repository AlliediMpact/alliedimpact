'use client';

import { ArrowRight, Code, Laptop, Briefcase, Award, Users, BookOpen, Zap, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function CodeTechPage() {
  const features = [
    {
      icon: Code,
      title: 'Hands-On Coding',
      description: 'Learn by building real projects, not just watching videos.',
    },
    {
      icon: Laptop,
      title: 'Modern Tech Stack',
      description: 'Master in-demand technologies used by top companies.',
    },
    {
      icon: Briefcase,
      title: 'Career Services',
      description: 'Portfolio building, CV reviews, and interview preparation.',
    },
    {
      icon: Award,
      title: 'Industry Certificates',
      description: 'Earn recognized credentials that employers trust.',
    },
    {
      icon: Users,
      title: 'Mentorship Program',
      description: 'Get guidance from experienced developers in the field.',
    },
    {
      icon: BookOpen,
      title: 'Structured Curriculum',
      description: 'Step-by-step learning paths from beginner to job-ready.',
    },
    {
      icon: Zap,
      title: 'Live Coding Sessions',
      description: 'Participate in real-time workshops and pair programming.',
    },
    {
      icon: TrendingUp,
      title: 'Job Placement Support',
      description: 'Connect with hiring partners and job opportunities.',
    },
  ];

  const tracks = [
    'Full-Stack Web Development (React, Node.js)',
    'Mobile App Development (React Native)',
    'Python Programming & Data Science',
    'Cloud Computing (AWS, Azure)',
    'DevOps & CI/CD Pipelines',
    'Cybersecurity Fundamentals',
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
                CodeTech
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed">
                Transform your career with professional tech education. Learn to code, build projects, and land your dream job in South Africa's growing tech industry.
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
                  <div className="text-2xl font-bold">78%</div>
                  <div className="text-white/70">Job Placement</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">6 Months</div>
                  <div className="text-white/70">To Job-Ready</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">R45k+</div>
                  <div className="text-white/70">Avg Starting Salary</div>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="w-full h-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Code className="w-32 h-32 text-white/50" />
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
              Your Path to a Tech Career
            </h2>
            <p className="text-lg text-muted-foreground">
              CodeTech provides everything you need to go from beginner to professional developer.
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

      {/* Learning Tracks Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Learning Tracks</h2>
              <p className="text-lg text-muted-foreground">
                Choose your path and master the skills that match your career goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tracks.map((track, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-background border border-muted hover:border-primary-blue transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-blue flex-shrink-0" />
                  <span className="text-sm font-medium">{track}</span>
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
              <span>LAUNCHING Q3 2026</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Start Your Tech Journey
            </h2>
            <p className="text-xl text-white/90">
              Join our waiting list and get exclusive founder's pricing when we launch.
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
              Requires Allied iMpact account • Early-bird discounts available
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
