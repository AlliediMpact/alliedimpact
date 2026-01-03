/**
 * @allied-impact/auth
 * 
 * Platform-wide authentication service.
 * Extends Firebase Auth with Allied iMpact-specific user management.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import type { PlatformUser } from '@allied-impact/types';

let firebaseApp: FirebaseApp;
let auth: Auth;

/**
 * Initialize Firebase Auth for the platform
 */
export function initializeAuth(firebaseConfig: any): Auth {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
  
  auth = getAuth(firebaseApp);
  return auth;
}

/**
 * Get the current Auth instance
 */
export function getAuthInstance(): Auth {
  if (!auth) {
    throw new Error('Auth not initialized. Call initializeAuth first.');
  }
  return auth;
}

/**
 * Create a new platform user
 */
export async function createPlatformUser(
  email: string,
  password: string,
  displayName?: string
): Promise<{ user: FirebaseUser; platformUser: PlatformUser }> {
  const auth = getAuthInstance();
  
  // Create Firebase user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update profile if displayName provided
  if (displayName) {
    await updateProfile(user, { displayName });
  }
  
  // Create platform user document
  const platformUser: PlatformUser = {
    uid: user.uid,
    email: user.email!,
    displayName: displayName || null,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: user.emailVerified,
    disabled: false,
    metadata: {
      lastSignInTime: user.metadata.lastSignInTime,
      creationTime: user.metadata.creationTime!
    }
  };
  
  const db = getFirestore(firebaseApp);
  await setDoc(doc(db, 'platform_users', user.uid), {
    ...platformUser,
    createdAt: Timestamp.fromDate(platformUser.createdAt),
    updatedAt: Timestamp.fromDate(platformUser.updatedAt)
  });
  
  // Send email verification
  await sendEmailVerification(user);
  
  return { user, platformUser };
}

/**
 * Sign in a platform user
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const auth = getAuthInstance();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Update lastSignInTime in platform_users
  const db = getFirestore(firebaseApp);
  await updateDoc(doc(db, 'platform_users', userCredential.user.uid), {
    'metadata.lastSignInTime': new Date().toISOString(),
    updatedAt: Timestamp.now()
  });
  
  return userCredential.user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const auth = getAuthInstance();
  await firebaseSignOut(auth);
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  const auth = getAuthInstance();
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
}

/**
 * Get platform user data from Firestore
 */
export async function getPlatformUser(uid: string): Promise<PlatformUser | null> {
  const db = getFirestore(firebaseApp);
  const userDoc = await getDoc(doc(db, 'platform_users', uid));
  
  if (!userDoc.exists()) {
    return null;
  }
  
  const data = userDoc.data();
  return {
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  } as PlatformUser;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  const auth = getAuthInstance();
  await sendPasswordResetEmail(auth, email);
}

/**
 * Update platform user profile
 */
export async function updatePlatformUserProfile(
  uid: string,
  updates: Partial<Pick<PlatformUser, 'displayName' | 'photoURL' | 'phoneNumber'>>
): Promise<void> {
  const auth = getAuthInstance();
  const user = auth.currentUser;
  
  if (!user || user.uid !== uid) {
    throw new Error('User not authenticated or UID mismatch');
  }
  
  // Update Firebase Auth profile
  const profileUpdates: { displayName?: string; photoURL?: string } = {};
  if (updates.displayName !== undefined) profileUpdates.displayName = updates.displayName;
  if (updates.photoURL !== undefined) profileUpdates.photoURL = updates.photoURL;
  
  if (Object.keys(profileUpdates).length > 0) {
    await updateProfile(user, profileUpdates);
  }
  
  // Update Firestore document
  const db = getFirestore(firebaseApp);
  await updateDoc(doc(db, 'platform_users', uid), {
    ...updates,
    updatedAt: Timestamp.now()
  });
}

// Re-export admin and middleware modules
export * from './admin';
export * from './middleware';

export default {
  initializeAuth,
  getAuthInstance,
  createPlatformUser,
  signIn,
  signOut,
  getCurrentUser,
  onAuthChange,
  getPlatformUser,
  resetPassword,
  updatePlatformUserProfile
};
