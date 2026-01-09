'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Briefcase } from 'lucide-react';

interface LogoProps {
  toDashboard?: boolean;
  className?: string;
}

export default function Logo({ toDashboard = false, className = '' }: LogoProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(toDashboard ? '/dashboard' : '/')}
      className={`flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-lg transition-opacity hover:opacity-80 ${className}`}
    >
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <Briefcase className="w-6 h-6 text-white" />
      </div>
      <span className="hidden sm:inline-block text-lg font-bold text-foreground">
        My Projects
      </span>
    </button>
  );
}
