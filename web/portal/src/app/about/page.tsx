'use client';

import { Target, Users, Shield, TrendingUp, Heart, Globe } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Innovation First',
      description: 'We build cutting-edge solutions that solve real problems for South African communities.',
    },
    {
      icon: Users,
      title: 'User-Centric',
      description: 'Every decision we make starts with understanding our users\' needs and challenges.',
    },
    {
      icon: Shield,
      title: 'Security & Trust',
      description: 'Bank-level security and transparent practices earn and keep user trust.',
    },
    {
      icon: TrendingUp,
      title: 'Continuous Growth',
      description: 'We evolve with technology and user feedback to stay ahead of the curve.',
    },
    {
      icon: Heart,
      title: 'Community Impact',
      description: 'Our success is measured by the positive change we create in communities.',
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Technology should be accessible to everyone, regardless of background.',
    },
  ];

  const milestones = [
    { year: '2023', title: 'Founded', description: 'Allied iMpact launches with vision to unify digital services' },
    { year: '2024', title: 'Coin Box Launch', description: 'First product goes live, serving 8,500+ users' },
    { year: '2024', title: 'My Projects Launch', description: 'Project management platform reaches 1,200+ users' },
    { year: '2025', title: 'uMkhanyakude Launch', description: 'Education platform empowers 2,800+ students' },
    { year: '2026', title: 'Platform Expansion', description: 'Three new products launching throughout the year' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-br from-primary-blue via-[#1a3690] to-primary-purple overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
              Building the Future of Digital Services in South Africa
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Allied iMpact is more than a platform—it's an ecosystem of solutions designed to empower individuals, businesses, and communities across South Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To create a unified digital ecosystem that simplifies access to essential services—from financial management and education to project collaboration and beyond.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We believe in <strong className="text-foreground">one identity, unlimited access</strong>. Sign up once, and unlock a world of possibilities tailored for South Africans.
                </p>
              </div>
              <div className="space-y-6">
                <h2 className="text-4xl font-bold">Our Vision</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To become the most trusted and comprehensive digital platform in Africa, where every product we build makes a meaningful difference in people's lives.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We're building for the long term—creating sustainable solutions that grow with our users and adapt to their evolving needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground">
              These principles guide every decision we make and every product we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index} 
                  className="p-6 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors group bg-background"
                >
                  <div className="w-14 h-14 mb-4 rounded-lg bg-primary-blue/10 flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary-blue" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
              <p className="text-lg text-muted-foreground">
                From a vision to a thriving ecosystem serving 10,000+ users.
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className="flex gap-6 items-start group"
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-primary-blue/10 flex items-center justify-center group-hover:bg-primary-blue/20 transition-colors">
                      <span className="text-lg font-bold text-primary-blue">{milestone.year}</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-semibold mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold">Built by South Africans, for South Africans</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our team combines deep local knowledge with world-class technical expertise. We understand the unique challenges and opportunities in the South African market because we live them every day.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From Cape Town to Johannesburg, Durban to Polokwane, our distributed team is committed to building products that make a real difference in people's lives.
            </p>
          </div>
        </div>
      </section>

      {/* Products Overview Section */}
      <section className="w-full py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Our Products</h2>
              <p className="text-lg text-muted-foreground">
                Six powerful products, one seamless experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">Coin Box</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">LIVE</span>
                </div>
                <p className="text-sm text-muted-foreground">P2P financial platform for savings and transfers</p>
              </div>

              <div className="p-6 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">My Projects</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">LIVE</span>
                </div>
                <p className="text-sm text-muted-foreground">Professional project management and collaboration</p>
              </div>

              <div className="p-6 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">uMkhanyakude</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">LIVE</span>
                </div>
                <p className="text-sm text-muted-foreground">Community education and skills development</p>
              </div>

              <div className="p-6 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">Drive Master</h3>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">COMING SOON</span>
                </div>
                <p className="text-sm text-muted-foreground">Comprehensive driver training and licensing</p>
              </div>

              <div className="p-6 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">CodeTech</h3>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">COMING SOON</span>
                </div>
                <p className="text-sm text-muted-foreground">Professional tech education and career development</p>
              </div>

              <div className="p-6 rounded-xl border-2 border-muted hover:border-primary-blue transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold">Cup Final</h3>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">COMING SOON</span>
                </div>
                <p className="text-sm text-muted-foreground">Sports tournament and league management</p>
              </div>
            </div>

            <div className="text-center mt-10">
              <Link 
                href="/products"
                className="inline-flex items-center justify-center bg-primary-blue text-white hover:bg-primary-blue/90 font-semibold px-8 py-4 rounded-lg transition-colors group"
              >
                Explore All Products
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-br from-primary-blue to-primary-purple text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold">
              Join the Allied iMpact Community
            </h2>
            <p className="text-xl text-white/90">
              Be part of something bigger. One account, unlimited possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group text-lg"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-blue font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
