'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!currentUser) {
        router.push(redirectTo);
        return;
      }

      // Authenticated but no role required - allow access
      if (!requiredRole) {
        return;
      }

      // Check role hierarchy
      if (requiredRole && userRole) {
        const roleHierarchy: Record<UserRole, number> = {
          fan: 1,
          admin: 2,
          super_admin: 3,
        };

        const hasPermission = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
        
        if (!hasPermission) {
          // Insufficient permissions
          router.push('/dashboard');
        }
      }
    }
  }, [currentUser, userRole, loading, requiredRole, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!currentUser) {
    return null;
  }

  // Insufficient role
  if (requiredRole && userRole) {
    const roleHierarchy: Record<UserRole, number> = {
      fan: 1,
      admin: 2,
      super_admin: 3,
    };

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
