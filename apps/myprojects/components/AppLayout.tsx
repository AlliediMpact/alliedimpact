'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import PlatformFooter from './PlatformFooter';
import { useProject } from '@/contexts/ProjectContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedProject, setSelectedProject } = useProject();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { getAuthInstance } = await import('@allied-impact/auth');
        const auth = getAuthInstance();
        
        if (!auth.currentUser) {
          // Allow public routes
          const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
          if (!publicRoutes.includes(pathname)) {
            router.push('/login');
          }
          return;
        }
        
        setUser(auth.currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('@allied-impact/auth');
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Public routes (no layout)
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Public layout (no header/sidebar)
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected dashboard layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AppSidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <AppHeader
          user={user}
          onSignOut={handleSignOut}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          currentProject={selectedProject}
          onProjectChange={setSelectedProject}
        />

        {/* Page Content */}
        <main className="pt-16 min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <PlatformFooter currentApp="myprojects" />
      </div>
    </div>
  );
}
