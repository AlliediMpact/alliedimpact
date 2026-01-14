import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import '../globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'EduTech - Learn, Grow, Succeed',
  description: 'Master computer skills and professional coding with EduTech by Allied iMpact',
  manifest: '/manifest.json',
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
                  <Footer />
                  <MobileNav />
                </ToastProvider>
              </ProgressProvider>
            </AuthProvider>
          </AnalyticsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
