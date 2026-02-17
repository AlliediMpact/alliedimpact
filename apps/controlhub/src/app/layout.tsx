import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { PWAInstaller, ServiceWorkerRegistration } from '@alliedimpact/ui';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ControlHub - Platform Observability',
  description: 'Allied iMpact Platform Observability and Governance Dashboard',
  manifest: '/manifest.json',
  robots: 'noindex, nofollow', // Internal tool only
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <PWAInstaller appName="ControlHub" />
            <ServiceWorkerRegistration />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
