'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import {
  fadeInVariants,
  containerVariants,
  itemVariants,
  scaleVariants,
} from '@allied-impact/ui/lib/animations';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b bg-white/80 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SportsHub
              </span>
            </motion.div>
            <motion.div
              className="flex items-center gap-4"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Link 
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <motion.span whileHover={{ scale: 1.05 }}>
                    Login
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Get Started
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeInVariants}
            className="inline-block mb-6 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
          >
            ⚽ Multi-Project Sports Platform
          </motion.div>
          
          <motion.h1
            variants={fadeInVariants}
            className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Your Sports, Your Voice
          </motion.h1>
          
          <motion.p
            variants={fadeInVariants}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            Engage with football tournaments, development initiatives, and sports campaigns.
            Vote, participate, and make an impact across multiple projects.
          </motion.p>

          <motion.div
            variants={containerVariants}
            className="flex gap-4 justify-center mb-16"
          >
            <motion.div variants={itemVariants}>
              <Link
                href="/signup"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all"
              >
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Start Voting Now
                </motion.span>
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                href="/about"
                className="inline-block px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-purple-600 hover:text-purple-600 transition-all"
              >
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  Learn More
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-8 mt-20"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, translateY: -5 }}
              className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Vote for Teams</h3>
              <p className="text-gray-600">
                Choose which African and International teams should compete in the tournament.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, translateY: -5 }}
              className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Pick Venues</h3>
              <p className="text-gray-600">
                Decide where the matches should be played. Your vote determines the locations.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05, translateY: -5 }}
              className="p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Transparent Results</h3>
              <p className="text-gray-600">
                Every vote is recorded and auditable. Complete transparency in the democratic process.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="border-t bg-white/80 backdrop-blur-sm mt-20"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-600" />
              <span className="font-semibold text-gray-900">SportsHub</span>
            </div>
            <motion.div
              className="flex gap-6 text-sm text-gray-600"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Link href="/about" className="hover:text-purple-600 transition-colors">About</Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href="/terms" className="hover:text-purple-600 transition-colors">Terms</Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href="/privacy" className="hover:text-purple-600 transition-colors">Privacy</Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link href="/contact" className="hover:text-purple-600 transition-colors">Contact</Link>
              </motion.div>
            </motion.div>
            <p className="text-sm text-gray-600">
              © 2026 Allied iMpact. All rights reserved.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t text-center text-sm text-gray-500">
            <p>
              ⚠️ SportsHub is a participatory platform where users vote to influence sports events. 
              Voting is not gambling or betting. No prizes awarded.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
