'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedHeroBackground from './AnimatedHeroBackground';

const FeaturePill = ({ text }: { text: string }) => {
  return (
    <motion.div
      className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all cursor-default"
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {text}
    </motion.div>
  );
};

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
            variants={badgeVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
            whileHover="hover"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
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
            <FeaturePill text="🚀 Custom Web Development" />
            <FeaturePill text="📱 Mobile App Development" />
            <FeaturePill text="💼 Enterprise Solutions" />
            <FeaturePill text="🔧 Custom Software Development" />
            <FeaturePill text="🌍 Community Impact Solutions" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-primary-blue hover:bg-white/90 transition-all group shadow-lg hover:shadow-2xl relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{
                    x: ['100%', '-100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                <span className="relative flex items-center">
                  Explore Our Platform
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </motion.div>
                </span>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="https://myprojects.alliedimpact.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-primary-blue transition-all shadow-lg hover:shadow-2xl relative group"
              >
                <motion.div
                  className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/10"
                  transition={{ duration: 0.3 }}
                />
                <span className="relative">Start A Project</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="pt-8"
          >
            <p className="text-sm text-white/70 mb-4">Trusted by thousands across South Africa</p>
            <div className="flex flex-wrap justify-center gap-6 items-center">
              {[
                { value: '10K+', label: 'Active Users' },
                { value: 'R50M+', label: 'Transactions' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.1, y: -4 }}
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
          whileHover={{ borderColor: 'rgba(255, 255, 255, 0.8)' }}
        >
          <motion.div
            className="w-1 h-2 bg-white/60 rounded-full"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
