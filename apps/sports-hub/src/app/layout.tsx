import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PlatformFooter from '@/components/PlatformFooter';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CookieConsentBanner, PWAInstaller, ServiceWorkerRegistration } from '@alliedimpact/ui';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'SportsHub - Community Sports Voting Platform',
    template: '%s | SportsHub'
  },
  description: 'Vote on your favorite sports events, teams, and players. Join the SportsHub community for live tournaments, real-time results, and fan engagement.',
  keywords: [
    'sports voting',
    'sports tournaments',
    'fan engagement',
    'live sports voting',
    'sports community',
    'tournament voting',
    'South Africa sports',
    'sports platform',
    'real-time results',
    'community voting'
  ],
  authors: [{ name: 'Allied iMpact' }],
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://sportshub.alliedimpact.com',
    title: 'SportsHub - Community Sports Voting Platform',
    description: 'Vote on your favorite sports events, teams, and players. Join the SportsHub community for live tournaments and real-time results.',
    siteName: 'SportsHub',
    images: [
      {
        url: '/assets/sportshub-og.png',
        width: 1200,
        height: 630,
        alt: 'SportsHub - Community Sports Voting Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SportsHub - Community Sports Voting Platform',
    description: 'Vote on your favorite sports events and join the community',
    images: ['/assets/sportshub-og.png'],
    creator: '@alliedimpact'
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
    }
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <div className="flex flex-col min-h-screen">
              <main className="flex-1">
                {children}
              </main>
              <PlatformFooter currentApp="sportshub" />
            </div>
            <CookieConsentBanner 
              appName="SportsHub" 
              privacyLink="/privacy" 
              cookieLink="/cookies" 
            />
            <PWAInstaller appName="SportsHub" />
            <ServiceWorkerRegistration />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
