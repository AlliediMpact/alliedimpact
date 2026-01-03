'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getCurrentUser,
  getPlatformUser,
  onAuthChange,
  signOut as authSignOut,
} from '@allied-impact/auth';
import { getUserEntitlements } from '@allied-impact/entitlements';
import type { User as FirebaseUser } from 'firebase/auth';
import type { PlatformUser, ProductEntitlement } from '@allied-impact/types';

interface DashboardContextType {
  user: FirebaseUser | null;
  platformUser: PlatformUser | null;
  entitlements: ProductEntitlement[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshEntitlements: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(null);
  const [entitlements, setEntitlements] = useState<ProductEntitlement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntitlements = async (userId: string) => {
    try {
      const userEntitlements = await getUserEntitlements(userId);
      setEntitlements(userEntitlements);
    } catch (error) {
      console.error('Failed to load entitlements:', error);
      setEntitlements([]);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const pUser = await getPlatformUser(firebaseUser.uid);
          setPlatformUser(pUser);
          await loadEntitlements(firebaseUser.uid);
        } catch (error) {
          console.error('Failed to load user data:', error);
          setPlatformUser(null);
          setEntitlements([]);
        }
      } else {
        setPlatformUser(null);
        setEntitlements([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await authSignOut();
      
      // Clear session cookie
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });

      // Redirect to homepage
      const homepageUrl = process.env.NEXT_PUBLIC_HOMEPAGE_URL || 'http://localhost:3000';
      window.location.href = homepageUrl;
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const refreshEntitlements = async () => {
    if (user) {
      await loadEntitlements(user.uid);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        user,
        platformUser,
        entitlements,
        loading,
        signOut,
        refreshEntitlements,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
