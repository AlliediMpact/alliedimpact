/**
 * @allied-impact/auth - Admin Module
 * 
 * Server-side Firebase Admin SDK helpers for authentication.
 * Use this ONLY in server contexts (API routes, server components).
 */

import * as admin from 'firebase-admin';
import { getApps, initializeApp as initializeAdminApp, cert } from 'firebase-admin/app';
import type { DecodedIdToken } from 'firebase-admin/auth';

let adminAuth: admin.auth.Auth | null = null;
let adminDb: admin.firestore.Firestore | null = null;

export interface AdminAuthConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL?: string;
}

/**
 * Initialize Firebase Admin SDK
 * Call this once at server startup
 */
export function initializeAdminAuth(config: AdminAuthConfig): void {
  // Admin SDK should only be used in server/Node.js environments
  if (typeof process === 'undefined' || !process.versions?.node) {
    throw new Error('Admin SDK can only be initialized on the server');
  }

  // Check if already initialized
  if (getApps().length > 0) {
    const app = getApps()[0];
    adminAuth = admin.auth(app);
    adminDb = admin.firestore(app);
    return;
  }

  try {
    const app = initializeAdminApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey.replace(/\\n/g, '\n'),
      }),
      databaseURL: config.databaseURL,
    });

    adminAuth = admin.auth(app);
    adminDb = admin.firestore(app);
    
    console.log('[Platform Auth] Firebase Admin SDK initialized');
  } catch (error) {
    console.error('[Platform Auth] Failed to initialize Admin SDK:', error);
    throw error;
  }
}

/**
 * Get Admin Auth instance
 */
export function getAdminAuth(): admin.auth.Auth {
  if (!adminAuth) {
    throw new Error('Admin Auth not initialized. Call initializeAdminAuth first.');
  }
  return adminAuth;
}

/**
 * Get Admin Firestore instance
 */
export function getAdminDb(): admin.firestore.Firestore {
  if (!adminDb) {
    throw new Error('Admin DB not initialized. Call initializeAdminAuth first.');
  }
  return adminDb;
}

/**
 * Verify ID token from client
 */
export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  const auth = getAdminAuth();
  return auth.verifyIdToken(token);
}

/**
 * Create a session cookie for cross-domain authentication
 */
export async function createSessionCookie(
  idToken: string,
  expiresIn: number = 60 * 60 * 24 * 7 * 1000 // 7 days
): Promise<string> {
  const auth = getAdminAuth();
  return auth.createSessionCookie(idToken, { expiresIn });
}

/**
 * Verify session cookie
 */
export async function verifySessionCookie(
  sessionCookie: string,
  checkRevoked: boolean = true
): Promise<DecodedIdToken> {
  const auth = getAdminAuth();
  return auth.verifySessionCookie(sessionCookie, checkRevoked);
}

/**
 * Revoke all sessions for a user
 */
export async function revokeUserSessions(uid: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.revokeRefreshTokens(uid);
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
  const auth = getAdminAuth();
  return auth.getUser(uid);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
  const auth = getAdminAuth();
  return auth.getUserByEmail(email);
}

/**
 * Set custom claims for a user (roles, permissions)
 */
export async function setUserClaims(
  uid: string,
  claims: Record<string, any>
): Promise<void> {
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, claims);
}

/**
 * Disable a user account
 */
export async function disableUser(uid: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.updateUser(uid, { disabled: true });
}

/**
 * Enable a user account
 */
export async function enableUser(uid: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.updateUser(uid, { disabled: false });
}

/**
 * Delete a user account
 */
export async function deleteUser(uid: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.deleteUser(uid);
}

export default {
  initializeAdminAuth,
  getAdminAuth,
  getAdminDb,
  verifyIdToken,
  createSessionCookie,
  verifySessionCookie,
  revokeUserSessions,
  getUserByUid,
  getUserByEmail,
  setUserClaims,
  disableUser,
  enableUser,
  deleteUser,
};
