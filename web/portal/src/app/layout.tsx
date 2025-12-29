import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Allied iMpact - One Identity. Multiple Products.',
    template: '%s | Allied iMpact',
  },
  description: 'Allied iMpact is a multi-product platform offering financial services, education, sports engagement, and more. One account, unlimited possibilities.',
  keywords: [
    'allied impact',
    'multi-product platform',
    'fintech',
    'education platform',
    'sports platform',
    'coin box',
    'drive master',
    'codetech',
    'south africa technology',
  ],
  authors: [{ name: 'Allied iMpact' }],
  creator: 'Allied iMpact',
  publisher: 'Allied iMpact',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://alliedimpact.co.za',
    title: 'Allied iMpact - One Identity. Multiple Products.',
    description: 'Multi-product platform offering financial services, education, sports engagement. One account, unlimited possibilities.',
    siteName: 'Allied iMpact',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Allied iMpact Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allied iMpact - One Identity. Multiple Products.',
    description: 'Multi-product platform offering financial services, education, sports engagement.',
    images: ['/og-image.png'],
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
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
