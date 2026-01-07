'use client';

import { ArrowRight, Wallet, GraduationCap, Code, Trophy, School, FolderKanban } from 'lucide-react';
import Link from 'next/link';

const products = [
  {
    id: 'coinbox',
    name: 'Coin Box',
    icon: Wallet,
    tagline: 'P2P Financial Platform',
    description: 'Secure peer-to-peer lending, investments, and crypto trading. Earn returns, access loans, and grow your wealth.',
    features: ['P2P Loans', 'Investments', 'Crypto Trading', 'Referral Rewards'],
    status: 'live',
    color: 'from-green-500 to-green-600',
    href: 'https://coinbox.alliedimpact.com',
  },
  {
    id: 'myprojects',
    name: 'My Projects',
    icon: FolderKanban,
    tagline: 'Project Management',
    description: 'Track custom software development projects. Manage milestones, deliverables, and team collaboration.',
    features: ['Project Tracking', 'Team Collaboration', 'Version Control', 'Dependencies'],
    status: 'live',
    color: 'from-blue-500 to-blue-600',
    href: 'https://myprojects.alliedimpact.com',
  },
  {
    id: 'drivemaster',
    name: 'Drive Master',
    icon: GraduationCap,
    tagline: 'Driving Education Platform',
    description: 'Learn to drive with professional instructors. Book lessons, track progress, and get your license faster.',
    features: ['Online Lessons', 'Instructor Booking', 'Progress Tracking', 'Test Prep'],
    status: 'coming-soon',
    color: 'from-purple-500 to-purple-600',
    href: '/products/drivemaster',
  },
  {
    id: 'codetech',
    name: 'CodeTech',
    icon: Code,
    tagline: 'Technology Education',
    description: 'Master coding and technology skills. From beginner to pro, learn the skills that matter in tech.',
    features: ['Coding Courses', 'Certificates', 'Project Portfolio', 'Career Support'],
    status: 'coming-soon',
    color: 'from-pink-500 to-pink-600',
    href: '/products/codetech',
  },
  {
    id: 'cupfinal',
    name: 'Cup Final',
    icon: Trophy,
    tagline: 'Sports Management',
    description: 'Manage sports tournaments and engage with fans. Vote, earn rewards, and be part of the game.',
    features: ['Tournament Management', 'Team Registration', 'Live Scores', 'Sponsorships'],
    status: 'coming-soon',
    color: 'from-amber-500 to-amber-600',
    href: '/products/cupfinal',
  },
  {
    id: 'umkhanyakude',
    name: 'uMkhanyakude',
    icon: School,
    tagline: 'Community Education Hub',
    description: 'Connect learners, parents, and schools. Access resources, track performance, and stay informed.',
    features: ['School Info', 'Resources', 'Parent Portal', 'Student Tracking'],
    status: 'live',
    color: 'from-teal-500 to-teal-600',
    href: 'https://umkhanyakude.alliedimpact.com',
  },
];

export default function ProductsSection() {
  return (
    <section className="w-full py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Six Products. One Platform.
          </h2>
          <p className="text-lg text-muted-foreground">
            Access multiple services with a single account. No need to sign up multiple times—your Allied iMpact identity works everywhere.
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
                className="group"
              >
                <div className="h-full p-6 rounded-lg border-2 border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary-blue">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {product.status === 'live' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-semibold rounded-full">
                        Live
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs font-semibold rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-blue transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    {product.tagline}
                  </p>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {product.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mr-2" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center text-primary-blue font-medium pt-2 group-hover:translate-x-1 transition-transform">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4" />
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
