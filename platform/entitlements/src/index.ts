/**
 * @allied-impact/entitlements
 * 
 * Platform-wide entitlement management service.
 * Controls user access to products and features across Allied iMpact.
 * 
 * Supports multiple access types:
 * - subscription: Paid subscriptions
 * - sponsored: Sponsored by organizations
 * - project: Project-based access
 * - role: Role-based access
 * - grant: Grant-funded access
 */

import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import type { ProductEntitlement, ProductId, SubscriptionTier, SubscriptionStatus } from '@allied-impact/types';
import { getCache, invalidateUserCache } from './cache';

// Re-export cache utilities
export * from './cache';

/**
 * Access types for entitlements
 */
export enum AccessType {
  SUBSCRIPTION = 'subscription',
  SPONSORED = 'sponsored',
  PROJECT = 'project',
  ROLE = 'role',
  GRANT = 'grant'
}

/**
 * Enhanced entitlement with multi-source support
 */
export interface EnhancedEntitlement extends ProductEntitlement {
  accessType: AccessType;
  
  // Context (optional, depends on accessType)
  sponsorId?: string;
  sponsorshipName?: string;
  projectId?: string;
  projectName?: string;
  grantId?: string;
  grantName?: string;
  
  // Who granted this access
  grantedBy: string;
}

/**
 * Check if a user has access to a product
 */
export async function hasProductAccess(
  userId: string,
  productId: ProductId
): Promise<boolean> {
  const entitlement = await getProductEntitlement(userId, productId);
  
  if (!entitlement) {
    return false;
  }
  
  // Check if entitlement is active
  if (entitlement.status !== 'active' && entitlement.status !== 'trial') {
    return false;
  }
  
  // Check if not expired
  if (entitlement.endDate && entitlement.endDate < new Date()) {
    return false;
  }
  
  return true;
}

/**
 * Get a user's entitlement for a specific product
 */
export async function getProductEntitlement(
  userId: string,
  productId: ProductId
): Promise<ProductEntitlement | null> {
  const db = getFirestore();
  const entitlementRef = doc(db, 'product_entitlements', `${userId}_${productId}`);
  const entitlementDoc = await getDoc(entitlementRef);
  
  if (!entitlementDoc.exists()) {
    return null;
  }
  
  const data = entitlementDoc.data();
  return {
    ...data,
    startDate: data.startDate.toDate(),
    endDate: data.endDate?.toDate(),
    trialEndDate: data.trialEndDate?.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  } as ProductEntitlement;
}

/**
 * Get all entitlements for a user (with caching)
 */
export async function getUserEntitlements(userId: string, skipCache: boolean = false): Promise<ProductEntitlement[]> {
  // Check cache first (unless explicitly skipped)
  if (!skipCache) {
    const cached = getCache().get(userId);
    if (cached) {
      return cached;
    }
  }

  // Fetch from Firestore
  const db = getFirestore();
  const entitlementsRef = collection(db, 'product_entitlements');
  const q = query(entitlementsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  const entitlements = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      startDate: data.startDate.toDate(),
      endDate: data.endDate?.toDate(),
      trialEndDate: data.trialEndDate?.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as ProductEntitlement;
  });

  // Cache the result
  getCache().set(userId, entitlements);

  return entitlements;
}

/**
 * Grant product access to a user (legacy - defaults to subscription)
 */
export async function grantProductAccess(
  userId: string,
  productId: ProductId,
  tier: SubscriptionTier,
  options: {
    startDate?: Date;
    endDate?: Date;
    trialEndDate?: Date;
    autoRenew?: boolean;
    metadata?: Record<string, any>;
  } = {}
): Promise<ProductEntitlement> {
  return grantAccess(userId, productId, {
    accessType: AccessType.SUBSCRIPTION,
    tier,
    ...options,
    grantedBy: 'system'
  });
}

/**
 * Grant access to a user (enhanced with multi-source support)
 */
export async function grantAccess(
  userId: string,
  productId: ProductId,
  options: {
    accessType: AccessType;
    tier?: SubscriptionTier;
    startDate?: Date;
    endDate?: Date;
    trialEndDate?: Date;
    autoRenew?: boolean;
    sponsorId?: string;
    sponsorshipName?: string;
    projectId?: string;
    projectName?: string;
    grantId?: string;
    grantName?: string;
    grantedBy: string;
    metadata?: Record<string, any>;
  }
): Promise<EnhancedEntitlement> {
  const db = getFirestore();
  const entitlementId = `${userId}_${productId}`;
  
  const now = new Date();
  const entitlement: EnhancedEntitlement = {
    id: entitlementId,
    userId,
    productId,
    tier: options.tier || 'basic',
    accessType: options.accessType,
    status: options.trialEndDate ? 'trial' : 'active',
    startDate: options.startDate || now,
    endDate: options.endDate,
    trialEndDate: options.trialEndDate,
    autoRenew: options.autoRenew ?? (options.accessType === AccessType.SUBSCRIPTION),
    sponsorId: options.sponsorId,
    sponsorshipName: options.sponsorshipName,
    projectId: options.projectId,
    projectName: options.projectName,
    grantId: options.grantId,
    grantName: options.grantName,
    grantedBy: options.grantedBy,
    createdAt: now,
    updatedAt: now,
    metadata: options.metadata
  };
  
  await setDoc(doc(db, 'product_entitlements', entitlementId), {
    ...entitlement,
    startDate: Timestamp.fromDate(entitlement.startDate),
    endDate: entitlement.endDate ? Timestamp.fromDate(entitlement.endDate) : null,
    trialEndDate: entitlement.trialEndDate ? Timestamp.fromDate(entitlement.trialEndDate) : null,
    createdAt: Timestamp.fromDate(entitlement.createdAt),
    updatedAt: Timestamp.fromDate(entitlement.updatedAt)
  });

  // Invalidate cache
  invalidateUserCache(userId);
  
  return entitlement;
}

/**
 * Grant subscription access (paid subscription)
 */
export async function grantSubscription(
  userId: string,
  productId: ProductId,
  tier: SubscriptionTier,
  options: {
    startDate?: Date;
    endDate?: Date;
    autoRenew?: boolean;
  } = {}
): Promise<EnhancedEntitlement> {
  return grantAccess(userId, productId, {
    accessType: AccessType.SUBSCRIPTION,
    tier,
    grantedBy: 'billing',
    ...options
  });
}

/**
 * Grant sponsored access (sponsored by organization)
 */
export async function grantSponsoredAccess(
  userId: string,
  productId: ProductId,
  sponsorId: string,
  options: {
    sponsorshipName?: string;
    duration?: number; // milliseconds
    tier?: SubscriptionTier;
  } = {}
): Promise<EnhancedEntitlement> {
  const endDate = options.duration 
    ? new Date(Date.now() + options.duration)
    : undefined;

  return grantAccess(userId, productId, {
    accessType: AccessType.SPONSORED,
    tier: options.tier,
    sponsorId,
    sponsorshipName: options.sponsorshipName,
    endDate,
    autoRenew: false,
    grantedBy: sponsorId
  });
}

/**
 * Grant project-based access (custom dev clients)
/**
 * Get entitlements by access type
 */
export async function getEntitlementsByAccessType(
  userId: string,
  accessType: AccessType
): Promise<EnhancedEntitlement[]> {
  const allEntitlements = await getUserEntitlements(userId);
  return allEntitlements.filter(
    (e: any) => e.accessType === accessType
  ) as EnhancedEntitlement[];
}

/**
 * Check if user has sponsored access
 */
export async function hasSponsoredAccess(
  userId: string,
  productId: ProductId
): Promise<boolean> {
  const entitlement = await getProductEntitlement(userId, productId);
  return (entitlement as any)?.accessType === AccessType.SPONSORED && 
         entitlement?.status === 'active';
}

/**
 * Check if user has any access (regardless of type)
 */
export async function hasAnyAccess(
  userId: string,
  productId: ProductId
): Promise<boolean> {
  return hasProductAccess(userId, productId);
}

export default {
  // Legacy functions (backward compatible)
  hasProductAccess,
  getProductEntitlement,
  getUserEntitlements,
  grantProductAccess,
  revokeProductAccess,
  updateEntitlementTier,
  updateEntitlementStatus,
  isInTrial,
  getSubscriptionTier,
  
  // Enhanced functions
  grantAccess,
  grantSubscription,
  grantSponsoredAccess,
  grantProjectAccess,
  grantRoleAccess,
  grantGrantAccess,
  getEntitlementsByAccessType,
  hasSponsoredAccess,
  hasAnyAccess
): Promise<EnhancedEntitlement> {
  return grantAccess(userId, productId, {
    accessType: AccessType.PROJECT,
    tier: options.tier,
    projectId,
    projectName: options.projectName,
    endDate: options.endDate,
    autoRenew: false,
    grantedBy: 'admin'
  });
}

/**
 * Grant role-based access (admins, staff)
 */
export async function grantRoleAccess(
  userId: string,
  productId: ProductId,
  options: {
    tier?: SubscriptionTier;
  } = {}
): Promise<EnhancedEntitlement> {
  return grantAccess(userId, productId, {
    accessType: AccessType.ROLE,
    tier: options.tier,
    autoRenew: false,
    grantedBy: 'admin'
  });
}

/**
 * Grant grant-funded access (NGOs, institutions)
 */
export async function grantGrantAccess(
  userId: string,
  productId: ProductId,
  grantId: string,
  options: {
    grantName?: string;
    duration?: number;
    tier?: SubscriptionTier;
  } = {}
): Promise<EnhancedEntitlement> {
  const endDate = options.duration 
    ? new Date(Date.now() + options.duration)
    : undefined;

  return grantAccess(userId, productId, {
    accessType: AccessType.GRANT,
    tier: options.tier,
    grantId,
    grantName: options.grantName,
    endDate,
    autoRenew: false,
    grantedBy: 'admin'
  });
}

/**
 * Revoke product access from a user
 */
export async function revokeProductAccess(
  userId: string,
  productId: ProductId
): Promise<void> {
  const db = getFirestore();
  const entitlementId = `${userId}_${productId}`;
  
  await updateDoc(doc(db, 'product_entitlements', entitlementId), {

  // Invalidate cache
  invalidateUserCache(userId);
    status: 'cancelled',
    updatedAt: Timestamp.now()
  });
}

/**
 * Update entitlement tier
 */
export async function updateEntitlementTier(
  userId: string,
  productId: ProductId,
  newTier: SubscriptionTier
): Promise<void> {
  const db = getFirestore();
  const entitlementId = `${userId}_${productId}`;
  
  await updateDoc(doc(db, 'product_entitlements', entitlementId), {

  // Invalidate cache
  invalidateUserCache(userId);
    tier: newTier,
    updatedAt: Timestamp.now()
  });
}

/**
 * Update entitlement status
 */
export async function updateEntitlementStatus(
  userId: string,
  productId: ProductId,
  status: SubscriptionStatus
): Promise<void> {
  const db = getFirestore();

  // Invalidate cache
  invalidateUserCache(userId);
  const entitlementId = `${userId}_${productId}`;
  
  await updateDoc(doc(db, 'product_entitlements', entitlementId), {
    status,
    updatedAt: Timestamp.now()
  });
}

/**
 * Check if user is in trial period
 */
export async function isInTrial(
  userId: string,
  productId: ProductId
): Promise<boolean> {
  const entitlement = await getProductEntitlement(userId, productId);
  
  if (!entitlement || entitlement.status !== 'trial') {
    return false;
  }
  
  if (entitlement.trialEndDate && entitlement.trialEndDate < new Date()) {
    return false;
  }
  
  return true;
}

/**
 * Get user's subscription tier for a product
 */
export async function getSubscriptionTier(
  userId: string,
  productId: ProductId
): Promise<SubscriptionTier | null> {
  const entitlement = await getProductEntitlement(userId, productId);
  return entitlement?.tier || null;
}

export default {
  hasProductAccess,
  getProductEntitlement,
  getUserEntitlements,
  grantProductAccess,
  revokeProductAccess,
  updateEntitlementTier,
  updateEntitlementStatus,
  isInTrial,
  getSubscriptionTier
};
