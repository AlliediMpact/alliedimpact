/**
 * @allied-impact/billing - Transaction Store
 * 
 * Manages transaction recording in Firestore
 */

import { getFirestore, collection, doc, addDoc, updateDoc, getDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { PlatformTransaction, ProductId, TransactionType, TransactionStatus, PaymentMethod } from '@allied-impact/types';

/**
 * Record a new transaction
 */
export async function recordTransaction(
  transaction: Omit<PlatformTransaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = getFirestore();
  const now = new Date();
  
  const docRef = await addDoc(collection(db, 'platform_transactions'), {
    ...transaction,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now)
  });
  
  return docRef.id;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  metadata?: Record<string, any>
): Promise<void> {
  const db = getFirestore();
  
  const updates: any = {
    status,
    updatedAt: Timestamp.now()
  };
  
  if (metadata) {
    updates.metadata = metadata;
  }
  
  await updateDoc(doc(db, 'platform_transactions', transactionId), updates);
}

/**
 * Get transaction by ID
 */
export async function getTransaction(transactionId: string): Promise<PlatformTransaction | null> {
  const db = getFirestore();
  const docRef = doc(db, 'platform_transactions', transactionId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  } as PlatformTransaction;
}

/**
 * Get transaction by payment intent ID
 */
export async function getTransactionByPaymentIntent(
  paymentIntentId: string
): Promise<PlatformTransaction | null> {
  const db = getFirestore();
  const q = query(
    collection(db, 'platform_transactions'),
    where('paymentIntentId', '==', paymentIntentId)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  const docSnap = snapshot.docs[0];
  const data = docSnap.data();
  
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate()
  } as PlatformTransaction;
}

/**
 * Get user transactions
 */
export async function getUserTransactions(
  userId: string,
  limit: number = 50
): Promise<PlatformTransaction[]> {
  const db = getFirestore();
  const q = query(
    collection(db, 'platform_transactions'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as PlatformTransaction;
  }).slice(0, limit);
}

export default {
  recordTransaction,
  updateTransactionStatus,
  getTransaction,
  getTransactionByPaymentIntent,
  getUserTransactions,
};
