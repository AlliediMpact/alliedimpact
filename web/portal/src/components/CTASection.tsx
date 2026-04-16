'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CTASection() {
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

  return (
    <section className="w-full py-20 bg-gradient-to-br from-primary-blue via-primary-blue/95 to-primary-blue/90 text-white relative overflow-hidden">
      {/* Animated accent blobs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-primary-purple/20 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <motion.div
        className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            Join thousands of users already experiencing the power of Allied iMpact. 
            Sign up once and unlock access to all our products.
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-primary-blue hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg transition-colors group shadow-lg hover:shadow-2xl relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
                  Create Free Account
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
                href="/login"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-primary-blue font-semibold px-8 py-4 text-lg rounded-lg transition-colors shadow-lg hover:shadow-2xl"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-sm text-white/70 pt-4"
          >
            No credit card required • Free to join • Access all products
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
