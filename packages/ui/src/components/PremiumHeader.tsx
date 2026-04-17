'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

interface HeaderProps {
  logo: ReactNode;
  navItems: Array<{ name: string; href: string }>;
  rightContent?: ReactNode;
  backgroundColor?: string;
  animated?: boolean;
}

export default function PremiumHeader({
  logo,
  navItems,
  rightContent,
  backgroundColor = '#193281',
  animated = true,
}: HeaderProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const navItemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      y: -2,
      transition: { duration: 0.3 },
    },
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b shadow-sm"
      style={{ backgroundColor }}
    >
      <motion.nav
        className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-0 h-16"
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      >
        {/* Logo */}
        <motion.div
          variants={animated ? itemVariants : undefined}
          className="flex-shrink-0"
        >
          {logo}
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div
          className="hidden md:flex items-center gap-8"
          variants={animated ? containerVariants : undefined}
          initial={animated ? 'hidden' : undefined}
          animate={animated ? 'visible' : undefined}
        >
          {navItems.map((item) => (
            <motion.div key={item.name} variants={animated ? navItemVariants : undefined}>
              <Link
                href={item.href}
                className="text-sm font-medium text-white relative group"
              >
                {item.name}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={animated ? { width: '100%' } : undefined}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Right Content */}
        {rightContent && (
          <motion.div
            variants={animated ? itemVariants : undefined}
            className="flex items-center gap-4"
          >
            {rightContent}
          </motion.div>
        )}
      </motion.nav>
    </header>
  );
}
