'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Footer as SharedFooter } from '@allied-impact/ui';
import type { FooterSection, SocialLink } from '@allied-impact/ui';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections: FooterSection[] = [
    {
      title: 'Learning Tracks',
      links: [
        { label: 'Computer Skills', href: '/en/courses?track=computer-skills' },
        { label: 'Coding Track', href: '/en/courses?track=coding' },
        { label: 'Pricing', href: '/en/pricing' },
        { label: 'Certificates', href: '/en/certificates' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/en/about' },
        { label: 'Become an Instructor', href: '/en/instructors' },
        { label: 'Sponsors', href: '/en/sponsors' },
        { label: 'Contact', href: '/en/contact' },
      ],
    },
    {
      title: 'Get in Touch',
      content: (
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
      ),
    },
  ];

  const socialLinks: SocialLink[] = [];

  const legalLinks = [
    { label: 'Terms of Service', href: '/en/terms' },
    { label: 'Privacy Policy', href: '/en/privacy' },
    { label: 'Cookie Policy', href: '/en/cookies' },
  ];

  return (
    <SharedFooter
      appName="EduTech"
      sections={sections}
      socialLinks={socialLinks}
      legalLinks={legalLinks}
      copyrightText={`© ${currentYear} EduTech by Allied iMpact. All rights reserved.`}
      description="Empowering learners from computer basics to professional coding"
      renderLink={(link) => (
        <Link href={link.href} className="text-muted-foreground hover:text-primary-blue">
          {link.label}
        </Link>
      )}
    />
  );
}
