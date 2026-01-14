/**
 * Real-time Data Hook
 * Provides live updates from Firestore using onSnapshot
 */

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Query,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { captureException } from '@/lib/monitoring';

interface UseRealtimeOptions<T> {
  collectionName: string;
  constraints?: QueryConstraint[];
  transform?: (data: DocumentData) => T;
  enabled?: boolean;
}

interface UseRealtimeResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Subscribe to real-time updates from Firestore
 */
export function useRealtime<T = DocumentData>(
  options: UseRealtimeOptions<T>
): UseRealtimeResult<T> {
  const { collectionName, constraints = [], transform, enabled = true } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0 
        ? query(collectionRef, ...constraints) 
        : collectionRef;

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: T[] = [];
          
          snapshot.forEach((doc) => {
            const docData = { id: doc.id, ...doc.data() };
            items.push(transform ? transform(docData) : (docData as T));
          });

          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error('Real-time subscription error:', err);
          setError(err as Error);
          setLoading(false);
          
          captureException(err as Error, {
            tags: { collection: collectionName },
            extra: { constraints },
          });
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      
      captureException(err as Error, {
        tags: { collection: collectionName },
      });
    }
  }, [collectionName, enabled, refetchTrigger, JSON.stringify(constraints)]);

  const refetch = () => setRefetchTrigger((prev) => prev + 1);

  return { data, loading, error, refetch };
}

/**
 * Subscribe to a single document's real-time updates
 */
export function useRealtimeDocument<T = DocumentData>(
  collectionName: string,
  documentId: string | null,
  transform?: (data: DocumentData) => T
): UseRealtimeResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = collection(db, collectionName);
      const q = query(docRef, where('__name__', '==', documentId));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: T[] = [];
          
          snapshot.forEach((doc) => {
            const docData = { id: doc.id, ...doc.data() };
            items.push(transform ? transform(docData) : (docData as T));
          });

          setData(items);
          setLoading(false);
        },
        (err) => {
          setError(err as Error);
          setLoading(false);
          
          captureException(err as Error, {
            tags: { collection: collectionName, documentId },
          });
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [collectionName, documentId]);

  return { data, loading, error, refetch: () => {} };
}
