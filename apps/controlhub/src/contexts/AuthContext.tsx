'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ControlHubRole } from '@/types/events';

interface AuthContextType {
  user: User | null;
  role: ControlHubRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<ControlHubRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Get custom claims (role)
        const tokenResult = await user.getIdTokenResult();
        const userRole = 
          tokenResult.claims.controlhub_super_admin ? 'controlhub_super_admin' :
          tokenResult.claims.controlhub_security ? 'controlhub_security' :
          tokenResult.claims.controlhub_support ? 'controlhub_support' :
          tokenResult.claims.controlhub_auditor ? 'controlhub_auditor' :
          null;
        
        setRole(userRole as ControlHubRole);
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut: handleSignOut }}>
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
