import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DriveMaster - Learn by Living the Journey',
  description: 'Master your K53 learner\'s license with journey-based learning. Beginner to Expert progression with 95%+ mastery requirements.',
  keywords: ['K53', 'learners license', 'driving test', 'South Africa', 'driving school'],
  authors: [{ name: 'Allied iMpact' }],
  openGraph: {
    title: 'DriveMaster - K53 Learner\'s License Training',
    description: 'Journey-based learning platform for South African learner drivers',
    type: 'website',
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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
