'use client';

import { ArrowRight, Wallet, GraduationCap, Briefcase, BookOpen, Car, Zap } from 'lucide-react';
import Link from 'next/link';

const products = [
  {
    id: 'careerbox',
    name: 'CareerBox',
    icon: Briefcase,
    tagline: 'AI-Powered Career Platform',
    description: 'Match talent with opportunities. AI-driven career mobility connecting job seekers with perfect roles.',
    features: ['Job Matching', 'AI Insights', 'Career Coaching', 'Employer Network'],
    status: 'live',
    color: 'from-blue-500 to-blue-600',
    href: 'https://careerbox.alliedimpact.co.za',
  },
  {
    id: 'coinbox',
    name: 'CoinBox',
    icon: Wallet,
    tagline: 'P2P Financial Platform',
    description: 'Secure peer-to-peer lending, investments, and crypto trading. Earn returns, access loans, and grow your wealth.',
    features: ['P2P Loans', 'Investments', 'Crypto Trading', 'Referral Rewards'],
    status: 'live',
    color: 'from-green-500 to-green-600',
    href: 'https://coinbox.alliedimpact.co.za',
  },
  {
    id: 'drivemaster',
    name: 'DriveMaster',
    icon: Car,
    tagline: 'Driving Education Platform',
    description: 'Learn to drive with professional instructors. Book lessons, track progress, and get your license faster.',
    features: ['Online Lessons', 'Instructor Booking', 'Progress Tracking', 'Test Prep'],
    status: 'live',
    color: 'from-purple-500 to-purple-600',
    href: 'https://drivemaster.alliedimpact.co.za',
  },
  {
    id: 'edutech',
    name: 'EduTech',
    icon: BookOpen,
    tagline: 'Technology Education',
    description: 'Master coding and technology skills. From beginner to pro, learn the skills that matter in tech.',
    features: ['Coding Courses', 'Certificates', 'Project Portfolio', 'Career Support'],
    status: 'live',
    color: 'from-pink-500 to-pink-600',
    href: 'https://edutech.alliedimpact.co.za',
  },
  {
    id: 'myprojects',
    name: 'MyProjects',
    icon: Briefcase,
    tagline: 'Project Management',
    description: 'Track custom software development projects. Manage milestones, deliverables, and team collaboration.',
    features: ['Project Tracking', 'Team Collaboration', 'Version Control', 'Dependencies'],
    status: 'live',
    color: 'from-blue-500 to-blue-600',
    href: 'https://myprojects.alliedimpact.co.za',
  },
  {
    id: 'sportshup',
    name: 'SportsHub',
    icon: Zap,
    tagline: 'Sports Community Platform',
    description: 'Connect athletes, teams, and fans. Manage tournaments, share highlights, and build communities.',
    features: ['Tournament Management', 'Team Network', 'Live Updates', 'Community Engagement'],
    status: 'live',
    color: 'from-amber-500 to-amber-600',
    href: 'https://sportshup.alliedimpact.co.za',
  },
];

export default function ProductsSection() {
  return (
    <section className="w-full py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Multi-Solutions. One Platform.
          </h2>
          <p className="text-lg text-muted-foreground">
            Our capabilities in action. Every solution we've built demonstrates our ability to create transformative digital experiences. Explore our portfolio and imagine what we can build for you.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {products.map((product) => {
            const Icon = product.icon;
            const isExternal = product.href.startsWith('http');
            
            return (
              <Link 
                key={product.id} 
                href={product.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="group h-full"
              >
                <div className="h-full p-8 rounded-2xl border-2 border-muted/50 bg-gradient-to-br from-white via-background to-muted/20 dark:from-slate-900 dark:via-background dark:to-muted/20 hover:shadow-2xl hover:border-primary-blue/50 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm flex flex-col">
                  <div className="flex items-start justify-between mb-6">
                    <div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center group-hover:scale-125 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    {product.status === 'live' ? (
                      <span className="px-4 py-1.5 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                        LIVE
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                        COMING
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-blue transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-sm font-semibold text-primary-blue mb-3 opacity-75 group-hover:opacity-100 transition-opacity">
                    {product.tagline}
                  </p>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {product.description}
                  </p>

                  <div className="space-y-3 mb-6 pb-6 border-b border-muted/50 flex-grow">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm font-medium group/feature hover:translate-x-1 transition-transform">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-blue to-primary-purple mr-3 group-hover/feature:scale-150 transition-transform" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center text-primary-blue font-bold group-hover:text-primary-purple group-hover:translate-x-2 transition-all duration-300 mt-auto">
                    Explore Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12 p-6 bg-muted/50 rounded-lg max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">One Account, Unlimited Access:</strong> Sign up once and unlock all current and future Allied iMpact products. Your identity, your ecosystem.
          </p>
        </div>
      </div>
    </section>
  );
}
