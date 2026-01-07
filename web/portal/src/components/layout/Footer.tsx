'use client';

import Link from 'next/link';
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
    { name: 'Coin Box', href: '/products/coinbox', description: 'Financial Platform' },
    { name: 'My Projects', href: '/products/myprojects', description: 'Project Management' },
    { name: 'Drive Master', href: '/products/drivemaster', description: 'Driver Training' },
    { name: 'CodeTech', href: '/products/codetech', description: 'Learn to Code' },
    { name: 'Cup Final', href: '/products/cupfinal', description: 'Sports Management' },
    { name: 'uMkhanyakude', href: '/products/umkhanyakude', description: 'Community Platform' },
  ];

  const company = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
  ];

  const resources = [
    { name: 'Help Center', href: '/help' },
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api' },
    { name: 'System Status', href: '/status' },
  ];

  const legal = [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Compliance', href: '/compliance' },
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Logo showText={false} className="mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              One Identity. Multiple Products. Allied iMpact connects you to a world of solutions.
            </p>
            <div className="flex gap-2">
              {social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Products</h3>
            <ul className="space-y-2">
              {products.slice(0, 3).map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2">
              {company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Resources</h3>
            <ul className="space-y-2">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>123 Innovation Street, Johannesburg, South Africa</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>+27 (0) 11 123 4567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <a href="mailto:hello@alliedimpact.co.za" className="hover:text-foreground">
                hello@alliedimpact.co.za
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Allied iMpact. All rights reserved.</p>
          <p className="text-xs">
            Built with ❤️ in South Africa
          </p>
        </div>
      </div>
    </footer>
  );
}
