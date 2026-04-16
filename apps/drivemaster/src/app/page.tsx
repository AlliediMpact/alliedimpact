'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@allied-impact/ui';
import {
  fadeInVariants,
  slideInVariants,
  containerVariants,
  itemVariants,
  scaleVariants,
} from '@allied-impact/ui/lib/animations';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-72 h-72 bg-primary-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ top: '-10%', left: '-10%' }}
          />
          <motion.div
            className="absolute w-96 h-96 bg-primary-300/10 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ bottom: '-20%', right: '-10%' }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeInVariants}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              Learn by Living the Journey
            </motion.h1>
            <motion.p
              variants={fadeInVariants}
              className="text-xl md:text-2xl mb-8 text-primary-100"
            >
              Master your K53 learner's license with immersive, journey-based learning.
              From Beginner to Expert, every question happens in context.
            </motion.p>
            <motion.div
              variants={containerVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {user ? (
                <motion.div variants={itemVariants}>
                  <Link href="/dashboard">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="secondary">
                        Go to Dashboard
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div variants={itemVariants}>
                    <Link href="/auth/register">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" variant="secondary">
                          Start Free
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link href="/auth/login">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                          Sign In
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-12"
          >
            Why DriveMaster?
          </motion.h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            <motion.div variants={itemVariants}>
              <FeatureCard
                icon="🎮"
                title="Journey-Based Learning"
                description="Experience realistic driving scenarios. Every question happens in context, not in isolation."
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FeatureCard
                icon="📈"
                title="Mastery Progression"
                description="95%+ required to advance. No shortcuts. Build real confidence through proven competence."
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FeatureCard
                icon="🎯"
                title="Gamified Experience"
                description="Earn credits, unlock badges, build streaks. Stay motivated as you master each stage."
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="border-t border-gray-800 pt-8 text-center text-gray-400"
          >
            <p className="mb-4 text-sm">
              <strong>Important Disclaimer:</strong> DriveMaster is not affiliated with the South African government.
              We are not an official testing center. This platform provides preparation only.
              You must pass the official K53 test at a recognized testing center to obtain your learner's license.
            </p>
            <p>&copy; {new Date().getFullYear()} Allied iMpact. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      variants={scaleVariants}
      whileHover="hover"
      className="bg-white p-6 rounded-lg shadow-lg"
    >
      <motion.div className="text-4xl mb-4">{icon}</motion.div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}
