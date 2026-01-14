/**
 * Footer Component - Allied iMpact Platform
 * 
 * CRITICAL RULES:
 * - This is a DUMB component (no routing logic)
 * - Receives footer sections and links via props
 * - Apps provide their own navigation structure
 * - Visual layout is consistent, content differs per app
 * 
 * Reference: CoinBox Footer (cleaned of Next.js routing)
 */

import * as React from 'react';
import { cn } from '../utils';

export interface FooterLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export interface FooterProps {
  /**
   * Footer sections (Company, Resources, Legal, etc.)
   * Each app provides its own structure
   */
  sections: FooterSection[];
  
  /**
   * Social media links
   */
  socialLinks?: SocialLink[];
  
  /**
   * Contact email
   */
  contactEmail?: string;
  
  /**
   * Copyright text
   * @example "© 2026 Allied iMpact CoinBox. All rights reserved."
   */
  copyrightText: string;
  
  /**
   * Optional: Region selector options
   */
  regions?: Array<{ value: string; label: string }>;
  
  /**
   * Optional: Current selected region
   */
  currentRegion?: string;
  
  /**
   * Optional: Region change handler
   */
  onRegionChange?: (region: string) => void;
  
  /**
   * Link renderer - app determines how to handle navigation
   * @example (href, children) => <Link href={href}>{children}</Link>
   */
  renderLink: (href: string, children: React.ReactNode, external?: boolean) => React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  (
    {
      sections,
      socialLinks,
      contactEmail,
      copyrightText,
      regions,
      currentRegion,
      onRegionChange,
      renderLink,
      className,
    },
    ref
  ) => {
    return (
      <footer ref={ref} className={cn('bg-background border-t', className)}>
        <div className="container px-4 py-8 mx-auto">
          {/* Footer Sections Grid */}
          <div className={cn('grid gap-8', `grid-cols-2 md:grid-cols-${Math.min(sections.length, 4)}`)}>
            {sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-sm mb-3">{section.title}</h3>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      {renderLink(
                        link.href,
                        <span className={cn('hover:underline', link.icon && 'flex items-center')}>
                          {link.icon && <span className="mr-1">{link.icon}</span>}
                          {link.label}
                        </span>,
                        link.external
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            {/* Social Links & Contact */}
            {(socialLinks || contactEmail) && (
              <div>
                {socialLinks && socialLinks.length > 0 && (
                  <>
                    <h3 className="font-semibold text-sm mb-3">Connect with Us</h3>
                    <div className="flex space-x-2 mb-4">
                      {socialLinks.map((social, idx) => (
                        <React.Fragment key={idx}>
                          {renderLink(
                            social.href,
                            <div className="p-2 rounded-full hover:bg-muted">{social.icon}</div>,
                            true
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}
                {contactEmail && (
                  <>
                    {renderLink(
                      `mailto:${contactEmail}`,
                      <span className="flex items-center text-sm hover:underline">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {contactEmail}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Bottom Section */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">{copyrightText}</p>
              
              {/* Optional Region Selector */}
              {regions && regions.length > 0 && (
                <div className="flex items-center mt-4 md:mt-0">
                  <p className="text-sm text-muted-foreground mr-2">Region:</p>
                  <select
                    className="text-sm bg-transparent border rounded p-1"
                    value={currentRegion}
                    onChange={(e) => onRegionChange?.(e.target.value)}
                  >
                    {regions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';
