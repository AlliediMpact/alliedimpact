'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { CryptoDashboard } from '@/components/admin/CryptoDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function CryptoAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        // TODO: Check if user has admin role from Firestore
        // const db = getFirestore();
        // const userDoc = await getDoc(doc(db, 'users', user.uid));
        // const userData = userDoc.data();
        // setIsAdmin(userData?.role === 'admin' || userData?.role === 'support');
        
        // For now, allow access (will be restricted by Firestore rules)
        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Admin access required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <CryptoDashboard />
    </div>
  );
}
