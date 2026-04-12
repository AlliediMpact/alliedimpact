'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Footer as SharedFooter } from '@allied-impact/ui';
import type { FooterSection } from '@allied-impact/ui';

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
      links: [
        { label: 'Email: edutech@alliedimpact.com', href: 'mailto:edutech@alliedimpact.com' },
        { label: 'Phone: +27 (0) 11 123 4567', href: 'tel:+27011234567' },
        { label: 'Johannesburg, South Africa', href: '#' },
      ],
    },
  ];

  return (
    <SharedFooter
      sections={sections}
      copyrightText={`© ${currentYear} Allied iMpact. All rights reserved.`}
      renderLink={(href: string) => <a href={href} />}
    />
  );
}
