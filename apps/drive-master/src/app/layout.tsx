import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { Toaster } from '@/components/Toaster';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { homeMetadata } from '@/lib/utils/metadata';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = homeMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <FeedbackWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
