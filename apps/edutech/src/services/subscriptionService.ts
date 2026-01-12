/**
 * Subscription Service
 * 
 * Manages subscriptions and trial access for Coding track in EduTech platform.
 * Computer Skills track is always FREE.
 * Coding track: 30-day FREE trial, then R99/month or R1000/year.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Subscription, SubscriptionStatus, SubscriptionType } from '../types';

// ============================================================================
// COLLECTION REFERENCES
// ============================================================================

const subscriptionsRef = collection(db, 'edutech_subscriptions');
const usersRef = collection(db, 'edutech_users');

// Constants
const TRIAL_DURATION_DAYS = 30;
const MONTHLY_PRICE = 99;
const ANNUAL_PRICE = 1000;

// ============================================================================
// TRIAL MANAGEMENT
// ============================================================================

/**
 * Start a 30-day free trial for Coding track
 */
export async function startTrial(userId: string): Promise<string> {
  try {
    // Check if user already has a trial/subscription
    const existing = await getSubscription(userId);
    if (existing) {
      throw new Error('User already has an active subscription or trial');
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);

    const subscriptionData: Omit<Subscription, 'subscriptionId'> = {
      userId,
      track: 'coding',
      status: 'trial',
      trialStartDate: Timestamp.fromDate(now),
      trialEndDate: Timestamp.fromDate(trialEnd),
      trialUsed: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(subscriptionsRef, subscriptionData);

    // Update user profile
    const userRef = doc(usersRef, userId);
    await updateDoc(userRef, {
      subscriptionStatus: 'trial',
      trialStartDate: Timestamp.fromDate(now),
      trialEndDate: Timestamp.fromDate(trialEnd),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error starting trial:', error);
    throw error;
  }
}

/**
 * Check trial status for a user
 */
export async function checkTrialStatus(userId: string): Promise<{
  hasTrialAvailable: boolean;
  trialUsed: boolean;
  trialActive: boolean;
  daysRemaining?: number;
  trialEndDate?: Date;
}> {
  try {
    const subscription = await getSubscription(userId);

    if (!subscription) {
      return {
        hasTrialAvailable: true,
        trialUsed: false,
        trialActive: false,
      };
    }

    if (subscription.status === 'trial') {
      const now = new Date();
      const endDate = subscription.trialEndDate.toDate();
      const daysRemaining = Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        hasTrialAvailable: false,
        trialUsed: true,
        trialActive: daysRemaining > 0,
        daysRemaining,
        trialEndDate: endDate,
      };
    }

    return {
      hasTrialAvailable: false,
      trialUsed: subscription.trialUsed,
      trialActive: false,
    };
  } catch (error) {
    console.error('Error checking trial status:', error);
    throw error;
  }
}

/**
 * Expire trial (called automatically or manually)
 */
export async function expireTrial(subscriptionId: string): Promise<void> {
  try {
    const docRef = doc(subscriptionsRef, subscriptionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Subscription not found');
    }

    const subscription = { ...docSnap.data(), subscriptionId: docSnap.id } as Subscription;

    await updateDoc(docRef, {
      status: 'expired',
      updatedAt: Timestamp.now(),
    });

    // Update user profile
    const userRef = doc(usersRef, subscription.userId);
    await updateDoc(userRef, {
      subscriptionStatus: 'expired',
    });
  } catch (error) {
    console.error('Error expiring trial:', error);
    throw error;
  }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Activate a paid subscription (R99/month or R1000/year)
 */
export async function activateSubscription(
  userId: string,
  type: SubscriptionType,
  paymentMethod?: string
): Promise<string> {
  try {
    const subscription = await getSubscription(userId);

    if (!subscription) {
      throw new Error('No subscription record found. Start trial first.');
    }

    const now = new Date();
    const nextBilling = new Date(now);

    if (type === 'monthly') {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }

    const amount = type === 'monthly' ? MONTHLY_PRICE : ANNUAL_PRICE;

    const docRef = doc(subscriptionsRef, subscription.subscriptionId);
    await updateDoc(docRef, {
      status: 'active',
      subscriptionType: type,
      amount,
      startDate: Timestamp.fromDate(now),
      nextBillingDate: Timestamp.fromDate(nextBilling),
      paymentMethod,
      lastPaymentDate: Timestamp.fromDate(now),
      updatedAt: Timestamp.now(),
    });

    // Update user profile
    const userRef = doc(usersRef, userId);
    await updateDoc(userRef, {
      subscriptionStatus: 'active',
    });

    return subscription.subscriptionId;
  } catch (error) {
    console.error('Error activating subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    const docRef = doc(subscriptionsRef, subscriptionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Subscription not found');
    }

    const subscription = { ...docSnap.data(), subscriptionId: docSnap.id } as Subscription;

    await updateDoc(docRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now(),
    });

    // Update user profile
    const userRef = doc(usersRef, subscription.userId);
    await updateDoc(userRef, {
      subscriptionStatus: 'cancelled',
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Renew a subscription (after successful payment)
 */
export async function renewSubscription(subscriptionId: string): Promise<void> {
  try {
    const docRef = doc(subscriptionsRef, subscriptionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Subscription not found');
    }

    const subscription = { ...docSnap.data(), subscriptionId: docSnap.id } as Subscription;

    if (!subscription.subscriptionType) {
      throw new Error('No subscription type found');
    }

    const nextBilling = new Date();
    if (subscription.subscriptionType === 'monthly') {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }

    await updateDoc(docRef, {
      status: 'active',
      lastPaymentDate: Timestamp.now(),
      nextBillingDate: Timestamp.fromDate(nextBilling),
      updatedAt: Timestamp.now(),
    });

    // Update user profile
    const userRef = doc(usersRef, subscription.userId);
    await updateDoc(userRef, {
      subscriptionStatus: 'active',
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    throw error;
  }
}

// ============================================================================
// ACCESS CONTROL
// ============================================================================

/**
 * Check if user has access to Coding track content
 */
export async function checkAccess(
  userId: string,
  track: 'computer-skills' | 'coding'
): Promise<{
  hasAccess: boolean;
  reason?: string;
  subscriptionStatus?: SubscriptionStatus;
  daysRemaining?: number;
}> {
  try {
    // Computer Skills is always FREE
    if (track === 'computer-skills') {
      return { hasAccess: true };
    }

    // Check Coding track access
    const subscription = await getSubscription(userId);

    if (!subscription) {
      return {
        hasAccess: false,
        reason: 'No trial or subscription. Start your 30-day FREE trial!',
      };
    }

    if (subscription.status === 'trial') {
      const now = new Date();
      const endDate = subscription.trialEndDate.toDate();

      if (now < endDate) {
        const daysRemaining = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          hasAccess: true,
          subscriptionStatus: 'trial',
          daysRemaining,
        };
      } else {
        return {
          hasAccess: false,
          reason: 'Trial expired. Subscribe to continue learning!',
          subscriptionStatus: 'expired',
        };
      }
    }

    if (subscription.status === 'active') {
      return {
        hasAccess: true,
        subscriptionStatus: 'active',
      };
    }

    return {
      hasAccess: false,
      reason: 'Subscription expired or cancelled. Reactivate to continue!',
      subscriptionStatus: subscription.status,
    };
  } catch (error) {
    console.error('Error checking access:', error);
    throw error;
  }
}

// ============================================================================
// SUBSCRIPTION RETRIEVAL
// ============================================================================

/**
 * Get user's subscription
 */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    const q = query(subscriptionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { ...doc.data(), subscriptionId: doc.id } as Subscription;
    }

    return null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}

/**
 * Get all subscriptions (for admin)
 */
export async function getAllSubscriptions(
  status?: SubscriptionStatus
): Promise<Subscription[]> {
  try {
    let q = query(subscriptionsRef, orderBy('createdAt', 'desc'));

    if (status) {
      q = query(subscriptionsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const subscriptions: Subscription[] = [];

    querySnapshot.forEach((doc) => {
      subscriptions.push({ ...doc.data(), subscriptionId: doc.id } as Subscription);
    });

    return subscriptions;
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    throw error;
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscriptionById(
  subscriptionId: string
): Promise<Subscription | null> {
  try {
    const docRef = doc(subscriptionsRef, subscriptionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), subscriptionId: docSnap.id } as Subscription;
    }
    return null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }
}

// ============================================================================
// ANALYTICS & REVENUE
// ============================================================================

/**
 * Get subscription analytics (for admin dashboard)
 */
export async function getSubscriptionAnalytics(): Promise<{
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialUsers: number;
  expiredUsers: number;
  monthlyRevenue: number;
  annualRevenue: number;
  totalRevenue: number;
}> {
  try {
    const subscriptions = await getAllSubscriptions();

    const active = subscriptions.filter((s) => s.status === 'active');
    const trial = subscriptions.filter((s) => s.status === 'trial');
    const expired = subscriptions.filter((s) => s.status === 'expired');

    const monthlyRevenue = active
      .filter((s) => s.subscriptionType === 'monthly')
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    const annualRevenue = active
      .filter((s) => s.subscriptionType === 'annual')
      .reduce((sum, s) => sum + (s.amount || 0), 0);

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: active.length,
      trialUsers: trial.length,
      expiredUsers: expired.length,
      monthlyRevenue,
      annualRevenue: annualRevenue / 12, // Monthly recurring
      totalRevenue: monthlyRevenue + annualRevenue / 12,
    };
  } catch (error) {
    console.error('Error calculating subscription analytics:', error);
    throw error;
  }
}

/**
 * Get trials expiring soon (for proactive outreach)
 */
export async function getTrialsExpiringSoon(days: number = 7): Promise<Subscription[]> {
  try {
    const subscriptions = await getAllSubscriptions('trial');
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return subscriptions.filter((s) => {
      const endDate = s.trialEndDate.toDate();
      return endDate >= now && endDate <= futureDate;
    });
  } catch (error) {
    console.error('Error fetching trials expiring soon:', error);
    throw error;
  }
}
