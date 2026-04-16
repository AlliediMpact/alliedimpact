'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  Github,
  MapPin,
  Phone,
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const products = [
    { name: 'CareerBox', href: 'https://careerbox.alliedimpact.co.za', description: 'Career Platform' },
    { name: 'CoinBox', href: 'https://coinbox.alliedimpact.co.za', description: 'Financial Platform' },
    { name: 'DriveMaster', href: 'https://drivemaster.alliedimpact.co.za', description: 'Driver Training' },
    { name: 'EduTech', href: 'https://edutech.alliedimpact.co.za', description: 'Tech Education' },
    { name: 'MyProjects', href: 'https://myprojects.alliedimpact.co.za', description: 'Project Management' },
    { name: 'SportsHub', href: 'https://sportshup.alliedimpact.co.za', description: 'Sports Community' },
  ];

  const company = [
    { name: 'Services', href: '/services' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const resources = [
    { name: 'Documentation', href: '/docs' },
    { name: 'System Status', href: '/status' },
  ];

  const legal = [
    { name: 'Terms of Service', href: '/legal/terms' },
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Cookie Policy', href: '/legal/cookies' },
  ];

  const social = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/alliedimpact' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/alliedimpact' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/alliedimpact' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/alliedimpact' },
  ];

  return (
    <footer className="bg-background border-t">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {/* Company Info */}
          <motion.div
            className="col-span-2 md:col-span-4 lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Logo showText={false} className="mb-4" variant="footer" size="lg" />
            <p className="text-sm text-muted-foreground mb-4">
              Your custom, scalable digital solutions partner. Building transformative experiences for individuals, businesses, and organizations.
            </p>
            <div className="flex gap-2">
              {social.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-muted transition-colors group"
                    aria-label={item.name}
                  >
                    <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
                      <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-sm mb-3">Products</h3>
            <ul className="space-y-2">
              {products.slice(0, 3).map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                viewport={{ once: true }}
              >
                <Link
                  href="/products"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View all →
                </Link>
              </motion.li>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2">
              {company.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-sm mb-3">Resources</h3>
            <ul className="space-y-2">
              {resources.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2">
              {legal.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="border-t pt-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            {[
              { icon: MapPin, text: '123 Innovation Street, Johannesburg, South Africa' },
              { icon: Phone, text: '+27 (0) 11 123 4567' },
              { icon: Mail, text: 'hello@alliedimpact.co.za', href: 'mailto:hello@alliedimpact.co.za' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-2 md:items-center"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {item.href ? (
                  <a href={item.href} className="hover:text-foreground transition-colors">
                    {item.text}
                  </a>
                ) : (
                  <span>{item.text}</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p>© {currentYear} Allied iMpact. All rights reserved.</p>
          <p className="text-xs">
            Built with ❤️ in South Africa
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
