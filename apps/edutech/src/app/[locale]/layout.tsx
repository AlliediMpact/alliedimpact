import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { locales } from '@/i18n/config';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import Header from '@/components/layout/Header';
import PlatformFooter from '@/components/PlatformFooter';
import { MobileNav } from '@/components/layout/MobileNav';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CookieConsentBanner, PWAInstaller, ServiceWorkerRegistration } from '@alliedimpact/ui';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'EduTech - Online Learning Platform',
    template: '%s | EduTech',
  },
  description: 'Master computer skills and professional coding with EduTech by Allied iMpact. Learn at your own pace with interactive courses, earn certificates, and advance your career.',
  keywords: [
    'online learning',
    'coding courses',
    'computer skills',
    'South Africa education',
    'programming training',
    'web development',
    'certification',
    'e-learning',
    'tech education',
    'career development',
  ],
  authors: [{ name: 'Allied iMpact' }],
  creator: 'Allied iMpact',
  publisher: 'Allied iMpact',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://edutech.alliedimpact.com',
    title: 'EduTech - Online Learning Platform',
    description: 'Master computer skills and professional coding with interactive courses and earn certificates.',
    siteName: 'EduTech',
    images: [
      {
        url: '/assets/edutech-og.png',
        width: 1200,
        height: 630,
        alt: 'EduTech Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduTech - Online Learning Platform',
    description: 'Master computer skills and professional coding with interactive courses.',
    images: ['/assets/edutech-og.png'],
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
  themeColor: '#193281',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EduTech',
  },
  verification: {
    google: 'google-verification-code',
  },
};

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
    <html lang={locale} className="scroll-smooth">
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="flex flex-col min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <AnalyticsProvider>
            <AuthProvider>
              <ProgressProvider>
                <ToastProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <PlatformFooter currentApp="edutech" />
                  <MobileNav />
                  <CookieConsentBanner 
                    appName="EduTech" 
                    privacyLink={`/${locale}/privacy`} 
                    cookieLink={`/${locale}/cookies`} 
                  />
                  <PWAInstaller appName="EduTech" />
                  <ServiceWorkerRegistration />
                </ToastProvider>
              </ProgressProvider>
            </AuthProvider>
          </AnalyticsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
