/**
 * Authentication Helper for P2P Crypto
 * 
 * Provides utilities for getting authenticated user information
 * and enforcing authentication in API routes.
 */

import { cookies } from 'next/headers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MembershipTierType } from '@/lib/membership-tiers';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName: string;
  membershipTier: MembershipTierType;
  weeklyVolume: number;
  activeListings: number;
}

/**
 * Get the current authenticated user from session
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    // Get session from cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    // Parse session (assuming it contains userId)
    let userId: string;
    try {
      const session = JSON.parse(sessionCookie.value);
      userId = session.uid || session.userId;
    } catch {
      // If not JSON, assume it's the userId directly
      userId = sessionCookie.value;
    }

    if (!userId) {
      return null;
    }

    // Fetch user details from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.error('[Auth] User not found:', userId);
      return null;
    }

    const userData = userDoc.data();

    // Fetch P2P stats
    const statsDoc = await getDoc(doc(db, 'p2p_crypto_stats', userId));
    const stats = statsDoc.exists() ? statsDoc.data() : { weeklyVolume: 0, activeListings: 0 };

    return {
      uid: userId,
      email: userData.email || '',
      displayName: userData.displayName || userData.name || 'Anonymous',
      membershipTier: userData.membershipTier || 'Basic',
      weeklyVolume: stats.weeklyVolume || 0,
      activeListings: stats.activeListings || 0,
    };
  } catch (error) {
    console.error('[Auth] Error getting current user:', error);
    return null;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes that require authentication
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Extract user ID from request headers (alternative method)
 * Useful for routes that use custom auth headers
 */
export function getUserIdFromHeaders(headers: Headers): string | null {
  // Try common auth header patterns
  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // Could decode JWT token here if using that pattern
    return null; // Implement based on your auth pattern
  }

  // Try custom header
  const userIdHeader = headers.get('x-user-id');
  if (userIdHeader) {
    return userIdHeader;
  }

  return null;
}

/**
 * Validate user has required tier for feature access
 */
export function validateTierAccess(
  userTier: MembershipTierType,
  requiredTier: MembershipTierType
): boolean {
  const tierOrder: MembershipTierType[] = ['Basic', 'Ambassador', 'VIP', 'Business'];
  const userTierIndex = tierOrder.indexOf(userTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
}
