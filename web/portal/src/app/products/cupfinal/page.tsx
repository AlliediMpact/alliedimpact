'use client';

import { ArrowRight, Trophy, Users, Calendar, BarChart3, Shield, Bell, FileText, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CupFinalPage() {
  const features = [
    {
      icon: Trophy,
      title: 'Tournament Management',
      description: 'Create and manage tournaments with automated brackets and scheduling.',
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Register teams, manage rosters, and track player stats.',
    },
    {
      icon: Calendar,
      title: 'Match Scheduling',
      description: 'Smart scheduling with venue management and conflict detection.',
    },
    {
      icon: BarChart3,
      title: 'Live Scoring',
      description: 'Real-time score updates and live match tracking.',
    },
    {
      icon: Shield,
      title: 'Player Profiles',
      description: 'Comprehensive player stats, history, and achievements.',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Keep everyone informed with automated match reminders.',
    },
    {
      icon: FileText,
      title: 'League Tables',
      description: 'Automatic standings, rankings, and performance analytics.',
    },
    {
      icon: Zap,
      title: 'Mobile Friendly',
      description: 'Manage tournaments on-the-go with responsive design.',
    },
  ];

  const sports = [
    'Soccer (11-a-side, 5-a-side)',
    'Cricket (T20, One Day, Test)',
    'Rugby (15s, 7s)',
    'Netball',
    'Basketball',
    'Volleyball',
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
                Cup Final
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed">
                The ultimate sports tournament management platform. Organize leagues, tournaments, and matches with professional tools designed for South African sports.
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
                  <div className="text-2xl font-bold">500+</div>
                  <div className="text-white/70">Tournaments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">2,000+</div>
                  <div className="text-white/70">Teams</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">15k+</div>
                  <div className="text-white/70">Players</div>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="w-full h-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Trophy className="w-32 h-32 text-white/50" />
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
              Professional Sports Management Made Easy
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to run successful tournaments, from registration to final whistle.
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

      {/* Sports Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Supported Sports</h2>
              <p className="text-lg text-muted-foreground">
                Cup Final supports all major South African sports with custom rules and formats.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sports.map((sport, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-background border border-muted hover:border-primary-blue transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-blue flex-shrink-0" />
                  <span className="text-sm font-medium">{sport}</span>
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
              <span>LAUNCHING Q4 2026</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold">
              Revolutionize Your Tournament Management
            </h2>
            <p className="text-xl text-white/90">
              Join our waiting list and be among the first to experience Cup Final.
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
              Requires Allied iMpact account • Free for community tournaments
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
