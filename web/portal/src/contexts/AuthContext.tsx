'use client';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuthInstance, getDbInstance, initializeFirebase } from '@/lib/firebase';

// Platform user interface
export interface PlatformUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  disabled: boolean;
  metadata: {
    lastSignInTime: string | null;
    creationTime: string;
  };
}

// Auth context interface
interface AuthContextType {
  user: FirebaseUser | null;
  platformUser: PlatformUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [platformUser, setPlatformUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Firebase on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        initializeFirebase();
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    }
  }, []);

  // Fetch platform user data from Firestore
  const fetchPlatformUser = async (uid: string): Promise<PlatformUser | null> => {
    try {
      const db = getDbInstance();
      const userDoc = await getDoc(doc(db, 'platform_users', uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as PlatformUser;
      }

      return null;
    } catch (error) {
      console.error('Error fetching platform user:', error);
      return null;
    }
  };

  // Create platform user document
  const createPlatformUser = async (firebaseUser: FirebaseUser): Promise<void> => {
    try {
      const db = getDbInstance();
      const platformUserData: Omit<PlatformUser, 'createdAt' | 'updatedAt'> & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
      } = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        emailVerified: firebaseUser.emailVerified,
        disabled: false,
        metadata: {
          lastSignInTime: firebaseUser.metadata.lastSignInTime || null,
          creationTime: firebaseUser.metadata.creationTime || new Date().toISOString(),
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, 'platform_users', firebaseUser.uid), platformUserData);
    } catch (error) {
      console.error('Error creating platform user:', error);
      throw error;
    }
  };

  // Update platform user document
  const updatePlatformUser = async (uid: string): Promise<void> => {
    try {
      const db = getDbInstance();
      await updateDoc(doc(db, 'platform_users', uid), {
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating platform user:', error);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const auth = getAuthInstance();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch or create platform user
        let pUser = await fetchPlatformUser(firebaseUser.uid);

        if (!pUser) {
          await createPlatformUser(firebaseUser);
          pUser = await fetchPlatformUser(firebaseUser.uid);
        } else {
          // Update last sign in time
          await updatePlatformUser(firebaseUser.uid);
        }

        setPlatformUser(pUser);
      } else {
        setPlatformUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in
  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    const auth = getAuthInstance();
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<UserCredential> => {
    const auth = getAuthInstance();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile if displayName provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Send email verification
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }

    return userCredential;
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    const auth = getAuthInstance();
    await sendPasswordResetEmail(auth, email);
  };

  // Update user profile
  const updateUserProfile = async (data: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> => {
    const auth = getAuthInstance();
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, data);
      await refreshUser();
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (user) {
      const pUser = await fetchPlatformUser(user.uid);
      setPlatformUser(pUser);
    }
  };

  const value: AuthContextType = {
    user,
    platformUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
