/**
 * Firebase Configuration
 * Client-side Firebase initialization
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { env } from '@/config/env';

let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

/**
 * Initialize Firebase (client-side only)
 */
export function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
} {
  if (!getApps().length) {
    firebaseApp = initializeApp(env.firebase);
  } else {
    firebaseApp = getApps()[0];
  }
  
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  
  return { app: firebaseApp, auth, db, storage };
}

/**
 * Get Firebase instances
 */
export function getFirebaseInstances() {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  
  return { app: firebaseApp, auth, db, storage };
}

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  initializeFirebase();
}

export { firebaseApp, auth, db, storage };
