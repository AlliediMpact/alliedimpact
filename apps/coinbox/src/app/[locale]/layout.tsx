import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { locales } from '@/i18n/config';
import { GeistSans, GeistMono } from 'geist/font';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import HeaderSidebarLayout from '@/components/HeaderSidebar';
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SkipToMainContent } from '@/hooks/use-accessibility';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import OnlineStatus from '@/components/OnlineStatus';
import { CookieConsentBanner } from '@alliedimpact/ui';
import Script from 'next/script';
import '../globals.css';

// Pre-loaded i18n messages (static imports to avoid runtime import failures)
import enMessages from '@/i18n/messages/en.json';
import afMessages from '@/i18n/messages/af.json';
import zuMessages from '@/i18n/messages/zu.json';
import xhMessages from '@/i18n/messages/xh.json';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

const messagesMap: Record<string, any> = {
  en: enMessages,
  af: afMessages,
  zu: zuMessages,
  xh: xhMessages,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params: { locale } }: Props) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = messagesMap[locale];

  if (!messages) {
    notFound();
  }

  return (
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CoinBox" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </head>
      <body className="antialiased">
        {/* PWA Service Worker Registration */}
        <Script
          id="pwa-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        
        <SkipToMainContent />
        <ErrorBoundary>
          <ThemeProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <AuthProvider>
                <OnboardingProvider>
                    {/* PWA Components */}
                    <PWAInstallPrompt />
                    <OnlineStatus />
                    
                    <HeaderSidebarLayout>
                      {children}
                    </HeaderSidebarLayout>
                    <Toaster />
                    <CookieConsentBanner 
                      appName="CoinBox" 
                      privacyLink={`/${locale}/privacy`} 
                      cookieLink={`/${locale}/cookies`} 
                    />
                </OnboardingProvider>
              </AuthProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
