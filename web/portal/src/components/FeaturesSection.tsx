'use client';

import { Shield, Zap, Users, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Shield,
    title: 'Secure & Trusted',
    description: 'Bank-level security with Firebase authentication. Your data is encrypted and protected 24/7.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance across all products. Sub-200ms response times for a seamless experience.',
  },
  {
    icon: Users,
    title: 'One Identity',
    description: 'Single sign-on across all products. No multiple accounts, no repeated verification processes.',
  },
  {
    icon: Lock,
    title: 'Product Isolation',
    description: 'Each product is independent with its own rules and pricing. Your data stays separate and secure.',
  },
];

export default function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="w-full py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Built for Scale. Designed for You.
          </h2>
          <p className="text-lg text-muted-foreground">
            Allied iMpact combines enterprise-grade infrastructure with a user-first approach.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center space-y-4 p-6 rounded-xl hover:bg-background transition-colors duration-300"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary-blue/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary-blue" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
