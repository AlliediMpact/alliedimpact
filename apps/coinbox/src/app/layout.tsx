import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Allied iMpact Coin Box - Secure P2P Financial Platform',
    template: '%s | Allied iMpact Coin Box',
  },
  description: 'Allied iMpact Coin Box is a secure peer-to-peer financial platform offering investments, loans, and crypto trading with transparent terms and competitive rates.',
  keywords: [
    'peer-to-peer lending',
    'P2P investment',
    'cryptocurrency trading',
    'microfinance',
    'financial inclusion',
    'secure loans',
    'investment platform',
    'South Africa fintech',
  ],
  authors: [{ name: 'Allied iMpact' }],
  creator: 'Allied iMpact',
  publisher: 'Allied iMpact',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://coinbox.vercel.app',
    title: 'Allied iMpact Coin Box - Secure P2P Financial Platform',
    description: 'Secure peer-to-peer financial platform offering investments, loans, and crypto trading with transparent terms.',
    siteName: 'Allied iMpact Coin Box',
    images: [
      {
        url: '/assets/coinbox-ai.png',
        width: 1200,
        height: 630,
        alt: 'Allied iMpact Coin Box',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allied iMpact Coin Box - Secure P2P Financial Platform',
    description: 'Secure peer-to-peer financial platform offering investments, loans, and crypto trading.',
    images: ['/assets/coinbox-ai.png'],
    creator: '@alliedimpact',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/assets/coinbox-ai.svg',
    shortcut: '/assets/coinbox-ai.svg',
    apple: '/assets/coinbox-ai.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://coinbox.vercel.app',
  },
};

// Root layout only provides the document structure
// The actual HTML/body is handled by [locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}


