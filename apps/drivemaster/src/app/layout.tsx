import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { Toaster } from '@/components/Toaster';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { CookieConsentBanner } from '@alliedimpact/ui';
import PlatformFooter from '@/components/PlatformFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Allied iMpact DriveMaster',
    template: '%s | DriveMaster',
  },
  description: 'Professional driver training and learner testing platform. Book theory and practical lessons, track your progress, and get road-ready with expert instructors across South Africa.',
  keywords: ['driver training', 'learner licence', 'driving school', 'practical test', 'theory test', 'driving lessons', 'road safety', 'South Africa', 'learner permit', 'driving instructor'],
  authors: [{ name: 'Allied iMpact' }],
  creator: 'Allied iMpact',
  publisher: 'Allied iMpact',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://drivemaster.alliedimpact.com',
    title: 'DriveMaster - Professional Driver Training Platform',
    description: 'Book driving lessons, track your progress, and get road-ready with expert instructors.',
    siteName: 'Allied iMpact DriveMaster',
    images: [{
      url: '/assets/drivemaster-og.png',
      width: 1200,
      height: 630,
      alt: 'Allied iMpact DriveMaster',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DriveMaster - Professional Driver Training',
    description: 'Book lessons, track progress, and get road-ready with expert instructors.',
    images: ['/assets/drivemaster-og.png'],
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
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            <PlatformFooter currentApp="drivemaster" />
          </div>
          <Toaster />
          <FeedbackWidget />
          <CookieConsentBanner 
            appName="DriveMaster" 
            privacyLink="/privacy" 
            cookieLink="/cookies" 
          />
        </AuthProvider>
      </body>
    </html>
  );
}
