/**
 * Firebase Configuration and Initialization
 * Central Firebase setup for MyProjects
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
const validateConfig = (): boolean => {
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
      `https://vercel.com/your-team/myprojects/settings/environment-variables`
    );
    return false;
  }
  return true;
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export const initializeFirebase = (): FirebaseApp | null => {
  if (typeof window === 'undefined') {
    // Server-side: don't initialize
    console.warn('Firebase initialization attempted on server-side');
    return null;
  }

  // Validate config before initialization
  if (!validateConfig()) {
    // Config validation failed - return null and let app handle gracefully
    return null;
  }

  // Initialize only if not already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return app;
};

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
