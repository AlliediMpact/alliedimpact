/**
 * Firebase Configuration and Initialization
 * Central Firebase setup for Allied iMpact Portal
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate configuration
const validateConfig = (): { isValid: boolean; missing: string[] } => {
  const required = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `⚠️ Missing Firebase environment variables: ${missing.join(', ')}\n` +
      `Please add these to your Vercel project settings:\n` +
      `https://vercel.com/your-team/portal/settings/environment-variables`,
      `\n\nMissing vars: ${JSON.stringify(missing)}`
    );
    return { isValid: false, missing };
  }
  return { isValid: true, missing };
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let initError: string | null = null;

export const initializeFirebase = (): FirebaseApp | null => {
  if (typeof window === 'undefined') {
    // Server-side: don't initialize
    return null;
  }

  // Validate config before initialization
  const { isValid, missing } = validateConfig();
  if (!isValid) {
    const errorMsg = `Firebase configuration incomplete. Missing: ${missing.join(', ')}`;
    initError = errorMsg;
    console.error(errorMsg);
    return null;
  }

  // Initialize only if not already initialized
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      initError = null;
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      initError = `Firebase initialization failed: ${error}`;
      console.error(initError);
      return null;
    }
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return app;
};

// Export initialization error
export const getInitError = (): string | null => initError;

// Export auth and db instances
export const getAuthInstance = (): Auth | null => {
  if (!auth) {
    const app = initializeFirebase();
    if (!app) return null;
  }
  return auth || null;
};

export const getDbInstance = (): Firestore | null => {
  if (!db) {
    const app = initializeFirebase();
    if (!app) return null;
  }
  return db || null;
};

// Export for direct use
export { app, auth, db };

