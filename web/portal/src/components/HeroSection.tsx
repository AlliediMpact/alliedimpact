'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedHeroBackground from './AnimatedHeroBackground';

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section 
      className="relative w-full min-h-screen flex items-center justify-center text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #193281 0%, #5e17eb 100%)' }}
    >
      {/* Animated background */}
      <AnimatedHeroBackground />

      <motion.div
        className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">One Account. Infinite Possibilities.</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            Your Custom, Scalable{' '}
            <span className="text-yellow-300">
              Digital Solutions
            </span>{' '}
            Partner
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            We develop and build custom digital solutions tailored to your needs. Whether you're an individual seeking growth opportunities, a business scaling your operations, or an organization solving community challenges—we have proven solutions designed for your success.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-3"
          >
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              🚀 Custom Web Development
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              📱 Mobile App Development
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              💼 Enterprise Solutions
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              🔧 Custom Software Development
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
              🌍 Community Impact Solutions
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Link 
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-primary-blue hover:bg-white/90 transition-all group"
            >
              Explore Our Platform
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="https://myprojects.alliedimpact.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-primary-blue transition-all"
            >
              Start A Project
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="pt-8"
          >
            <p className="text-sm text-white/70 mb-4">Trusted by thousands across South Africa</p>
            <div className="flex flex-wrap justify-center gap-6 items-center">
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
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
