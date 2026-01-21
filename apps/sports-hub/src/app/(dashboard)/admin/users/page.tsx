'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UserManagement from '@/components/admin/UserManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'User Management - SportsHub Admin',
  description: 'Manage users, roles, and permissions',
};

export default function UsersManagementPage() {
  const router = useRouter();
  const { cupfinalUser, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if user has super_admin role
    if (!loading) {
      if (!cupfinalUser) {
        router.push('/login');
        return;
      }

      if (cupfinalUser.globalRole !== 'sportshub_super_admin') {
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
    }
  }, [cupfinalUser, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (!authorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render the user management component
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, assign roles, and perform bulk operations
        </p>
      </div>
      
      <UserManagement />
    </div>
  );
}
