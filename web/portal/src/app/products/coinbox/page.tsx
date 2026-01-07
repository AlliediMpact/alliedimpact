'use client';

import { ArrowRight, Wallet, Send, PiggyBank, Users, Shield, TrendingUp, Coins, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CoinBoxPage() {
  const features = [
    {
      icon: Wallet,
      title: 'Digital Wallet',
      description: 'Secure ZAR wallet with instant deposits and withdrawals.',
    },
    {
      icon: Send,
      title: 'P2P Transfers',
      description: 'Send money to anyone, anytime with crypto-backed security.',
    },
    {
      icon: PiggyBank,
      title: 'Savings Jars',
      description: 'Create multiple savings goals with automated contributions.',
    },
    {
      icon: Users,
      title: 'Group Savings',
      description: 'Collaborative saving with friends, family, or colleagues.',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Multi-factor authentication and encrypted transactions.',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Track your spending and savings with detailed insights.',
    },
    {
      icon: Coins,
      title: 'Crypto Integration',
      description: 'Blockchain-backed security for all transactions.',
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your financial data stays private and secure.',
    },
  ];

  const useCases = [
    'Monthly savings goals',
    'Emergency fund building',
    'Group contributions (stokvels, family funds)',
    'Bill splitting with friends',
    'Freelancer payments',
    'Small business transactions',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-br from-primary-blue via-[#1a3690] to-primary-purple overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>LIVE & ACTIVE</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                Coin Box
              </h1>
              
              <p className="text-xl text-white/90 leading-relaxed">
                South Africa's premier peer-to-peer financial platform. Save smarter, send faster, and secure your financial future with crypto-backed technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="https://coinbox.alliedimpact.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group"
                >
                  Launch Coin Box
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
                  <div className="text-2xl font-bold">8,500+</div>
                  <div className="text-white/70">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">R48M+</div>
                  <div className="text-white/70">Transacted</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-white/70">Uptime</div>
                </div>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="w-full h-96 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Wallet className="w-32 h-32 text-white/50" />
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
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-lg text-muted-foreground">
              Coin Box combines traditional banking convenience with cutting-edge blockchain security.
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

      {/* Use Cases Section */}
      <section className="w-full py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Perfect For</h2>
              <p className="text-lg text-muted-foreground">
                Whether you're saving for a goal or managing group finances, Coin Box adapts to your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-background border border-muted hover:border-primary-blue transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-primary-blue flex-shrink-0" />
                  <span className="text-sm font-medium">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-br from-primary-blue to-primary-purple text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold">
              Start Using Coin Box Today
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of South Africans taking control of their finances with Coin Box.
            </p>
            <div className="pt-4">
              <Link 
                href="https://coinbox.alliedimpact.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors group text-lg"
              >
                Launch Application
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-sm text-white/70 pt-2">
              Requires Allied iMpact account • Sign up in minutes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
