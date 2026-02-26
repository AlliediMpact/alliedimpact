'use client';

import { useEffect, useRef } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useToast } from '@/components/realtime/NotificationToast';

interface NotificationData {
  id: string;
  userId: string;
  type: 'vote_received' | 'tournament_starting' | 'tournament_ending' | 'refund' | 'announcement';
  title: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
  metadata?: Record<string, any>;
}

export function useRealtimeNotifications(userId: string | null) {
  const { showToast } = useToast();
  const lastNotificationTime = useRef<Date>(new Date());

  useEffect(() => {
    if (!userId) return;

    // Subscribe to new notifications
    const notificationsRef = collection(db, 'sportshub_notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const notification = {
              id: change.doc.id,
              ...change.doc.data()
            } as NotificationData;

            // Only show toast for new notifications (not initial load)
            const notificationTime = notification.timestamp.toDate();
            if (notificationTime > lastNotificationTime.current) {
              const toastType = getToastType(notification.type);
              showToast({
                type: toastType,
                title: notification.title,
                message: notification.message,
                duration: 6000
              });
            }
          }
        });

        // Update last notification time
        if (!snapshot.empty) {
          lastNotificationTime.current = new Date();
        }
      },
      (error) => {
        console.error('Error subscribing to notifications:', error);
      }
    );

    return () => unsubscribe();
  }, [userId, showToast]);
}

function getToastType(notificationType: string): 'success' | 'info' | 'warning' | 'error' {
  switch (notificationType) {
    case 'vote_received':
      return 'success';
    case 'refund':
      return 'info';
    case 'tournament_starting':
      return 'info';
    case 'tournament_ending':
      return 'warning';
    case 'announcement':
      return 'info';
    default:
      return 'info';
  }
}
