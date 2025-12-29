/**
 * @allied-impact/entitlements
 * 
 * Platform-wide entitlement management service.
 * Controls user access to products and features across Allied iMpact.
 */

import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import type { ProductEntitlement, ProductId, SubscriptionTier, SubscriptionStatus } from '@allied-impact/types';

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
 * Get all entitlements for a user
 */
export async function getUserEntitlements(userId: string): Promise<ProductEntitlement[]> {
  const db = getFirestore();
  const entitlementsRef = collection(db, 'product_entitlements');
  const q = query(entitlementsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => {
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
}

/**
 * Grant product access to a user
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
  const db = getFirestore();
  const entitlementId = `${userId}_${productId}`;
  
  const now = new Date();
  const entitlement: ProductEntitlement = {
    id: entitlementId,
    userId,
    productId,
    tier,
    status: options.trialEndDate ? 'trial' : 'active',
    startDate: options.startDate || now,
    endDate: options.endDate,
    trialEndDate: options.trialEndDate,
    autoRenew: options.autoRenew ?? true,
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
  
  return entitlement;
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
