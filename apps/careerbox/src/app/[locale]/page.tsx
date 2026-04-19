'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Users, Building2, TrendingUp, MessageSquare, MapPin, ArrowRight, Check, Briefcase, Sparkles } from 'lucide-react';
import { Logo } from '@allied-impact/ui';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || 'en';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    hover: {
      scale: 1.05,
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
    },
  };

  const statVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
        <motion.nav
          className="container mx-auto px-4 py-4 flex items-center justify-between"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Logo 
              appName="CareerBox" 
              onClick={() => router.push(`/${locale}`)}
              size={64}
            />
          </motion.div>
          <motion.div
            className="flex items-center gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { name: 'Pricing', href: `/${locale}/pricing` },
              { name: 'About', href: `/${locale}/about` },
            ].map((item) => (
              <motion.div key={item.name} variants={navItemVariants} whileHover={{ y: -2 }}>
                <Link href={item.href} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <motion.div variants={navItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href={`/${locale}/auth/login`}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href={`/${locale}/auth/signup`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </motion.nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 -right-32 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -40, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute bottom-20 -left-32 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-8"
              variants={badgeVariants}
            >
              <div className="px-4 py-2 rounded-full bg-blue-100 border border-blue-300 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </motion.div>
                <span className="text-sm font-semibold text-blue-600">AI-Powered Matching</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              variants={itemVariants}
            >
              Find Your Next Career Move in <motion.span className="text-blue-600 relative inline-block">Minutes</motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              CareerBox matches job seekers with opportunities and companies with talent using intelligent matching. 
              No endless applications. No manual searching. Just perfect matches.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex gap-4 justify-center flex-col sm:flex-row"
              variants={itemVariants}
            >
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
                className="w-full sm:w-auto"
              >
                <Link
                  href={`/${locale}/auth/signup?type=individual`}
                  className="block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-lg font-semibold transition-colors"
                >
                  I'm Looking for a Job
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover="hover"
                whileTap="tap"
                variants={buttonVariants}
                className="w-full sm:w-auto"
              >
                <Link
                  href={`/${locale}/auth/signup?type=company`}
                  className="block px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 text-lg font-semibold transition-colors"
                >
                  I'm Hiring Talent
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {[
              { value: '10K+', label: 'Active Job Seekers' },
              { value: '2K+', label: 'Companies' },
              { value: '50K+', label: 'Matches Made' },
              { value: '5K+', label: 'Jobs Filled' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover="hover"
                className="cursor-default"
              >
                <motion.div
                  className="text-4xl font-bold text-blue-600 mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - For Individuals */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">For Job Seekers</h2>
          <p className="text-xl text-gray-600">Simple steps to find your next opportunity</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Create Your Profile</h3>
            <p className="text-gray-600">
              Add your skills, experience, location, and career preferences in minutes
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Get Instant Matches</h3>
            <p className="text-gray-600">
              Our algorithm finds positions that match your profile in real-time
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Connect & Apply</h3>
            <p className="text-gray-600">
              Message companies directly and schedule interviews with matched employers
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - For Companies */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">For Companies</h2>
            <p className="text-xl text-gray-600">Find qualified candidates instantly</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Post Your Position</h3>
              <p className="text-gray-600">
                Create a listing with role requirements, location, and skills needed
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. See Matching Candidates</h3>
              <p className="text-gray-600">
                Instantly view candidates who match your requirements
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Hire Faster</h3>
              <p className="text-gray-600">
                Contact qualified candidates directly and fill positions quickly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why CareerBox?</h2>
          <p className="text-xl text-gray-600">Matching-first approach that saves time</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex gap-4">
            <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Intelligent Matching</h3>
              <p className="text-gray-600">
                Algorithm considers role, location, skills, industry, and availability
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">
                Get notified immediately when new matches are found
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Direct Messaging</h3>
              <p className="text-gray-600">
                No middleman - connect directly with employers or candidates
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Location-Based</h3>
              <p className="text-gray-600">
                Find opportunities in your city or indicate relocation preferences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Free to browse. Upgrade for full access to matches and messaging.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={`/${locale}/pricing`}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold"
            >
              View Pricing
            </Link>
            <Link
              href={`/${locale}/auth/signup`}
              className="px-8 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold border-2 border-white"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">CareerBox</span>
              </div>
              <p className="text-sm">
                Part of Allied iMpact ecosystem. Matching careers, changing lives.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${locale}/auth/signup?type=individual`} className="hover:text-white">Create Profile</Link></li>
                <li><Link href={`/${locale}/pricing`} className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Companies</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${locale}/auth/signup?type=company`} className="hover:text-white">Post a Position</Link></li>
                <li><Link href={`/${locale}/pricing`} className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href={`/${locale}/about`} className="hover:text-white">About</Link></li>
                <li><Link href={`/${locale}/legal/privacy`} className="hover:text-white">Privacy</Link></li>
                <li><Link href={`/${locale}/legal/terms`} className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 Allied iMpact. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
