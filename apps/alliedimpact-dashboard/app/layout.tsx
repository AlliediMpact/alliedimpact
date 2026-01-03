import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardProvider } from './lib/dashboard-context';
import DashboardNav from './components/DashboardNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard - Allied iMpact',
  description: 'Your central hub for all Allied iMpact products and services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardProvider>
          <div className="min-h-screen bg-background">
            <DashboardNav />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
}
