'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { EduTechUser as PlatformUser } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  platformUser: PlatformUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // TODO: Fetch platform user data from Firestore
        // For now, create basic platform user from Firebase user
        setPlatformUser({
          uid: firebaseUser.uid,
          userId: firebaseUser.uid, // Use uid as userId
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || undefined,
          userType: 'learner', // Default type
          languagePreference: 'en' as const,
          createdAt: { toDate: () => new Date() } as any, // Firebase Timestamp-like
          updatedAt: { toDate: () => new Date() } as any, // Firebase Timestamp-like
        } as PlatformUser);
      } else {
        setPlatformUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setPlatformUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, platformUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
