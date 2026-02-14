import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppLayout from '@/components/AppLayout';
import { CookieConsentBanner } from '@alliedimpact/ui';
import { ProjectProvider } from '@/contexts/ProjectContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'MyProjects - Custom Development Tracking',
    template: '%s | MyProjects',
  },
  description: 'Track and manage your custom software development projects with MyProjects. View progress, milestones, documentation, and collaborate with the Allied iMpact team.',
  keywords: [
    'project management',
    'software development',
    'custom development',
    'project tracking',
    'milestone tracking',
    'development progress',
    'client portal',
    'Allied iMpact projects',
    'South Africa software development',
  ],
  authors: [{ name: 'Allied iMpact' }],
  creator: 'Allied iMpact',
  publisher: 'Allied iMpact',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://myprojects.alliedimpact.com',
    title: 'MyProjects - Custom Development Tracking',
    description: 'Track and manage your custom software development projects with real-time progress updates',
    siteName: 'MyProjects',
    images: [
      {
        url: '/assets/myprojects-og.png',
        width: 1200,
        height: 630,
        alt: 'MyProjects - Development Tracking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyProjects - Custom Development Tracking',
    description: 'Track and manage your custom software development projects',
    images: ['/assets/myprojects-og.png'],
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
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ProjectProvider>
            <AppLayout>{children}</AppLayout>
          </ProjectProvider>
          <CookieConsentBanner 
            appName="MyProjects" 
            privacyLink="/privacy" 
            cookieLink="/cookies" 
          />
        </ErrorBoundary>
      </body>
    </html>
  );
}
