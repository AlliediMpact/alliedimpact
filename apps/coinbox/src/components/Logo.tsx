'use client';

import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

interface LogoProps {
  /** Optional: when true, always send users to dashboard */
  toDashboard?: boolean;
}

export default function Logo({ toDashboard }: LogoProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  return (
    <button
      type="button"
      onClick={() => router.push(toDashboard ? `/${locale}/dashboard` : `/${locale}`)}
      className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 rounded-full"
    >
      <Image
        src="/assets/coinbox-ai.png"
        alt="CoinBox Logo"
        width={40}
        height={40}
        className="rounded-full"
      />
      <span className="hidden sm:inline-block text-lg font-bold text-white">
        CoinBox
      </span>
    </button>
  );
}
