import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
    
    if (!serviceAccount) {
      throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT environment variable is not set');
    }

    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

export default admin;
