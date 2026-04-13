'use client';

import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { width: 32, height: 32, text: 'text-lg' },
    md: { width: 40, height: 40, text: 'text-xl' },
    lg: { width: 48, height: 48, text: 'text-2xl' }
  };

  const { width, height, text } = sizes[size];

  return (
    <Link 
      href="/" 
      className={`flex items-center gap-2 logo-animated ${className}`}
      aria-label="Allied iMpact Home"
    >
      {/* Logo Icon - Using actual logo image */}
      <div 
        className="flex items-center justify-center"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <Image 
          src="/logo.png"
          alt="Allied iMpact"
          width={width}
          height={height}
          priority
          className="rounded-lg"
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
