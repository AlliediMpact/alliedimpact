import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

interface PlatformFooterProps {
  className?: string;
}

export default function PlatformFooter({ className = '' }: PlatformFooterProps) {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { name: 'CoinBox', href: 'https://coinbox.alliedimpact.com' },
    { name: 'SportsHub', href: 'https://sportshub.alliedimpact.com' },
    { name: 'MyProjects', href: 'https://myprojects.alliedimpact.com' },
    { name: 'EduTech', href: 'https://edutech.alliedimpact.com' },
    { name: 'DriveMaster', href: 'https://drivemaster.alliedimpact.com' },
  ];

  const resourceLinks = [
    { name: 'Documentation', href: '/docs' },
    { name: 'Help Center', href: '/help-center' },
    { name: 'Blog', href: '/blog' },
    { name: 'API Reference', href: '/api' },
    { name: 'System Status', href: '/status' },
  ];

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Press', href: '/press' },
    { name: 'Partners', href: '/partners' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Compliance', href: '/compliance' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/alliedimpact' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/alliedimpact' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/alliedimpact' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/alliedimpact' },
  ];

  return (
    <footer className={`bg-background border-t ${className}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold">Allied iMpact</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Empowering communities through innovative digital solutions across South Africa and beyond.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Products Column */}
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Allied iMpact. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="mailto:info@alliedimpact.com"
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
              >
                <Mail className="h-4 w-4 mr-1" />
                info@alliedimpact.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
