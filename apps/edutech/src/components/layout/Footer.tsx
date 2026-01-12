'use client';

import Link from 'next/link';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary-blue" />
              <span className="font-bold text-xl">EduTech</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering learners from computer basics to professional coding
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Learning Tracks</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/en/courses?track=computer-skills" className="text-muted-foreground hover:text-primary-blue">
                  Computer Skills
                </Link>
              </li>
              <li>
                <Link href="/en/courses?track=coding" className="text-muted-foreground hover:text-primary-blue">
                  Coding Track
                </Link>
              </li>
              <li>
                <Link href="/en/pricing" className="text-muted-foreground hover:text-primary-blue">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/en/certificates" className="text-muted-foreground hover:text-primary-blue">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/en/about" className="text-muted-foreground hover:text-primary-blue">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/en/instructors" className="text-muted-foreground hover:text-primary-blue">
                  Become an Instructor
                </Link>
              </li>
              <li>
                <Link href="/en/sponsors" className="text-muted-foreground hover:text-primary-blue">
                  Sponsors
                </Link>
              </li>
              <li>
                <Link href="/en/contact" className="text-muted-foreground hover:text-primary-blue">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>edutech@alliedimpact.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+27 (0) 11 123 4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Johannesburg, South Africa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} EduTech by Allied iMpact. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/en/terms" className="text-sm text-muted-foreground hover:text-primary-blue">
              Terms of Service
            </Link>
            <Link href="/en/privacy" className="text-sm text-muted-foreground hover:text-primary-blue">
              Privacy Policy
            </Link>
            <Link href="/en/cookies" className="text-sm text-muted-foreground hover:text-primary-blue">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
