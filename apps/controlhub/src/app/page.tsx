'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Activity } from 'lucide-react';
import { Logo, Button } from '@allied-impact/ui';
import {
  fadeInVariants,
  containerVariants,
  itemVariants,
  scaleVariants,
} from '@allied-impact/ui/lib/animations';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <motion.div
        className="max-w-2xl mx-auto p-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo & Title */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo appName="ControlHub" size={64} />
          </motion.div>
        </motion.div>
        
        <motion.h1
          variants={fadeInVariants}
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
        >
          ControlHub
        </motion.h1>
        
        <motion.p
          variants={fadeInVariants}
          className="text-xl text-slate-300 mb-2"
        >
          Platform Observability & Governance
        </motion.p>
        
        <motion.p
          variants={fadeInVariants}
          className="text-sm text-slate-400 mb-12 max-w-md mx-auto"
        >
          Real-time monitoring, security oversight, and compliance management
          for the Allied iMpact platform
        </motion.p>

        {/* Status Cards */}
        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-4 mb-12"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, translateY: -5 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
          >
            <div className="text-3xl font-bold text-green-400 mb-2">6</div>
            <div className="text-sm text-slate-400">Apps Monitored</div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, translateY: -5 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
          >
            <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-sm text-slate-400">Uptime Monitoring</div>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, translateY: -5 }}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
          >
            <div className="text-3xl font-bold text-purple-400 mb-2">∞</div>
            <div className="text-sm text-slate-400">Event Streams</div>
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/dashboard">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Button size="lg" className="gap-2">
                <Shield className="h-5 w-5" />
                Access Dashboard
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={fadeInVariants}
          className="mt-16 pt-8 border-t border-slate-700"
        >
          <p className="text-xs text-slate-500">
            🔒 Internal Use Only - Platform Super Admins, Security & Support Teams
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
