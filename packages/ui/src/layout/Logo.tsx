/**
 * Logo Component - Allied iMpact Platform
 * 
 * CRITICAL RULES:
 * - This is a DUMB component (no routing, no navigation logic)
 * - Receives logo details and click handler via props
 * - Can be used by any app with different branding
 * 
 * Reference: CoinBox Logo component (cleaned of Next.js routing)
 */

import * as React from 'react';
import { cn } from '../utils';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Logo image URL or path
   * @example "/assets/coinbox-ai.png"
   */
  logoSrc?: string;
  
  /**
   * Alt text for the logo image
   */
  logoAlt?: string;
  
  /**
   * App name to display next to logo
   * @example "CoinBox" | "EduTech" | "CareerBox"
   */
  appName?: string;
  
  /**
   * Logo size in pixels
   * @default 40
   */
  size?: number;
  
  /**
   * Click handler - app determines where to navigate
   * @example onClick={() => router.push('/dashboard')}
   */
  onClick?: () => void;
  
  /**
   * Show app name on mobile devices
   * @default false (hidden on mobile by default)
   */
  showNameOnMobile?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const Logo = React.forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      logoSrc,
      logoAlt = 'Logo',
      appName,
      size = 40,
      onClick,
      showNameOnMobile = false,
      className,
      ...props
    },
    ref
  ) => {
    const content = (
      <>
        {logoSrc && (
          <img
            src={logoSrc}
            alt={logoAlt}
            width={size}
            height={size}
            className="rounded-full"
          />
        )}
        {appName && (
          <span
            className={cn(
              'text-lg font-bold text-white',
              !showNameOnMobile && 'hidden sm:inline-block'
            )}
          >
            {appName}
          </span>
        )}
      </>
    );

    // If onClick is provided, render as button
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 rounded-full',
            className
          )}
        >
          {content}
        </button>
      );
    }

    // Otherwise, render as div
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {content}
      </div>
    );
  }
);

Logo.displayName = 'Logo';
