import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { locales } from '@/i18n/config';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { SkipLink } from '@/components/ui/accessibility';
import { CookieConsentBanner, PWAInstaller, ServiceWorkerRegistration } from '@alliedimpact/ui';
import PlatformFooter from '@/components/PlatformFooter';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'CareerBox - AI-Powered Job Matching',
    template: '%s | CareerBox',
  },
  description: 'Find your dream job or discover top talent with CareerBox. AI-powered matching connects job seekers with opportunities and companies with the perfect candidates across South Africa.',
  keywords: [
    'jobs South Africa',
    'job search',
    'careers',
    'recruitment',
    'job matching',
    'AI recruitment',
    'talent acquisition',
    'employment',
    'career opportunities',
    'job board',
  ],
  authors: [{ name: 'Allied iMpact' }],
  creator: 'Allied iMpact',
  publisher: 'Allied iMpact',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://careerbox.alliedimpact.com',
    title: 'CareerBox - AI-Powered Job Matching',
    description: 'Connect with your next opportunity or find the perfect candidate with intelligent job matching.',
    siteName: 'CareerBox',
    images: [
      {
        url: '/assets/careerbox-og.png',
        width: 1200,
        height: 630,
        alt: 'CareerBox Job Matching Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CareerBox - AI-Powered Job Matching',
    description: 'Find your dream job or discover top talent with intelligent matching.',
    images: ['/assets/careerbox-og.png'],
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
    google: 'google-verification-code',
  },
  manifest: '/manifest.json',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <SkipLink />
        <ErrorBoundary>
          <ToastProvider>
            <NextIntlClientProvider messages={messages}>
              <div className="flex flex-col min-h-screen">
                <main className="flex-1">
                  {children}
                </main>
                <PlatformFooter currentApp="careerbox" />
              </div>
              <CookieConsentBanner 
                appName="CareerBox" 
                privacyLink={`/${locale}/privacy`} 
                cookieLink={`/${locale}/cookies`} 
              />
              <PWAInstaller appName="CareerBox" />
              <ServiceWorkerRegistration />
            </NextIntlClientProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
