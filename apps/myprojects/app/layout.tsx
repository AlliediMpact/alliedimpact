import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppLayout from '@/components/AppLayout';
import { ProjectProvider } from '@/contexts/ProjectContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Projects - Allied iMpact',
  description: 'Track your custom development projects with Allied iMpact',
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
        </ErrorBoundary>
      </body>
    </html>
  );
}
