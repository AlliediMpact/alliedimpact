'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, signOut } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Fleet', href: '/fleet' },
    { name: 'Drivers', href: '/drivers' },
    { name: 'Services', href: '/services' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-600 to-indigo-700 shadow-sm">
      <motion.nav
        className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2"
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-bold text-white">DriveMaster</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div
          className="hidden md:flex items-center gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {navItems.map((item) => (
            <motion.div
              key={item.name}
              variants={itemVariants}
              whileHover={{ y: -2 }}
            >
              <Link
                href={item.href}
                className={`text-sm font-medium relative group transition-colors ${
                  isActive(item.href) ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                {item.name}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-white rounded-full group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          {currentUser && (
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-white/10 p-2 rounded-md transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          )}
        </div>

        {/* Right Content - Auth */}
        <motion.div
          variants={itemVariants}
          className="hidden md:flex items-center gap-4"
        >
          {currentUser ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <motion.button
                onClick={handleSignOut}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </motion.button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-white text-blue-600 rounded-md text-sm font-semibold hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-blue-700"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-white/80 hover:bg-blue-600 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
