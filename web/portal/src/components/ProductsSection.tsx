'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { ArrowRight, Wallet, GraduationCap, Code, Trophy, School } from 'lucide-react';
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
    color: 'from-blue-500 to-blue-600',
    href: '/products/coinbox',
  },
  {
    id: 'drivemaster',
    name: 'Drive Master',
    icon: GraduationCap,
    tagline: 'Driving Education Platform',
    description: 'Learn to drive with professional instructors. Book lessons, track progress, and get your license faster.',
    features: ['Online Lessons', 'Instructor Booking', 'Progress Tracking', 'Test Prep'],
    status: 'coming-soon',
    color: 'from-green-500 to-green-600',
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
    color: 'from-purple-500 to-purple-600',
    href: '/products/codetech',
  },
  {
    id: 'cupfinal',
    name: 'Cup Final',
    icon: Trophy,
    tagline: 'Sports & Fan Engagement',
    description: 'Connect with your favorite teams and players. Vote, earn rewards, and be part of the game.',
    features: ['Fan Voting', 'Team Support', 'Rewards System', 'Live Updates'],
    status: 'coming-soon',
    color: 'from-red-500 to-red-600',
    href: '/products/cupfinal',
  },
  {
    id: 'umkhanyakude',
    name: 'uMkhanyakude Schools',
    icon: School,
    tagline: 'Education Hub',
    description: 'Connect learners, parents, and schools. Access resources, track performance, and stay informed.',
    features: ['School Info', 'Resources', 'Parent Portal', 'Student Tracking'],
    status: 'coming-soon',
    color: 'from-orange-500 to-orange-600',
    href: '/products/umkhanyakude',
  },
];

export default function ProductsSection() {
  return (
    <section className="w-full py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Five Products. One Platform.
          </h2>
          <p className="text-lg text-muted-foreground">
            Access multiple services with a single account. No need to sign up multiple times—your Allied iMpact identity works everywhere.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <Link key={product.id} href={product.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {product.status === 'live' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Live
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-base font-medium">
                      {product.tagline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                    <div className="space-y-2">
                      {product.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center text-primary font-medium pt-2 group-hover:translate-x-1 transition-transform">
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
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
