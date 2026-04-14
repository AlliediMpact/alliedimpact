'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'header' | 'footer';
}

export default function Logo({ className = '', showText = true, size = 'md', variant = 'header' }: LogoProps) {
  const sizes = {
    sm: { width: 32, height: 32, text: 'text-lg' },
    md: { width: 40, height: 40, text: 'text-xl' },
    lg: { width: 120, height: 96, text: 'text-2xl' },
    xl: { width: 80, height: 80, text: 'text-4xl' }
  };

  const { width, height, text } = sizes[size];
  const logoSrc = variant === 'footer' ? '/logo_footer.png' : '/logo.png';

  return (
    <Link 
      href="/" 
      className={`flex items-center gap-2 ${className}`}
      aria-label="Allied iMpact Home"
    >
      {/* Logo Icon - Using actual logo image */}
      <div 
        className="flex items-center justify-center"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image 
          src={logoSrc}
          alt="Allied iMpact"
          width={width}
          height={height}
          priority
          className="rounded-lg hover:scale-105 transition-transform duration-300 object-contain"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold ${text}`}>
            Allied <span className="text-accent-DEFAULT">iMpact</span>
          </span>
        </div>
      )}
    </Link>
  );
}
