/**
 * In-App Notification System for SportsHub
 * Provides real-time notifications for user actions
 */

import { collection, addDoc, query, where, orderBy, limit, onSnapshot, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export type NotificationType = 
  | 'vote_confirmed'
  | 'tournament_published'
  | 'wallet_topup'
  | 'tournament_closed'
  | 'winner_announced'
  | 'admin_action';

export interface Notification {
  notificationId?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Create a new notification for a user
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  metadata?: Record<string, any>
): Promise<string> {
  try {
    const notificationsRef = collection(db, 'sportshub_notifications');
    
    const notification: Omit<Notification, 'notificationId' | 'createdAt'> = {
      userId,
      type,
      title,
      message,
      link,
      read: false,
      metadata,
    };

    const docRef = await addDoc(notificationsRef, {
      ...notification,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Subscribe to user's notifications in real-time
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
  limitCount: number = 20
) {
  const notificationsRef = collection(db, 'sportshub_notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        notificationId: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
        read: data.read,
        createdAt: data.createdAt?.toDate() || new Date(),
        metadata: data.metadata,
      };
    });

    callback(notifications);
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'sportshub_notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, 'sportshub_notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map((doc) => 
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const notificationsRef = collection(db, 'sportshub_notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Notification Templates - Pre-built notification messages
 */
export const NotificationTemplates = {
  voteConfirmed: (tournamentName: string, voteCount: number, cost: string) => ({
    title: 'Vote Confirmed! ✅',
    message: `Your ${voteCount} vote${voteCount > 1 ? 's' : ''} for "${tournamentName}" have been recorded. ${cost} deducted from your wallet.`,
    type: 'vote_confirmed' as NotificationType,
  }),

  tournamentPublished: (tournamentName: string, tournamentId: string) => ({
    title: 'New Tournament Published! 🏆',
    message: `"${tournamentName}" is now live! Cast your votes and support your favorites.`,
    type: 'tournament_published' as NotificationType,
    link: `/tournaments/${tournamentId}`,
  }),

  walletTopup: (amount: string) => ({
    title: 'Wallet Top-Up Successful 💰',
    message: `${amount} has been added to your wallet. You're ready to vote!`,
    type: 'wallet_topup' as NotificationType,
    link: '/wallet',
  }),

  tournamentClosed: (tournamentName: string, tournamentId: string) => ({
    title: 'Tournament Closed 🔒',
    message: `"${tournamentName}" voting has ended. Check out the results!`,
    type: 'tournament_closed' as NotificationType,
    link: `/tournaments/${tournamentId}/results`,
  }),

  winnerAnnounced: (tournamentName: string, winner: string, tournamentId: string) => ({
    title: 'Winner Announced! 🎉',
    message: `"${winner}" won in "${tournamentName}"! View full results.`,
    type: 'winner_announced' as NotificationType,
    link: `/tournaments/${tournamentId}/results`,
  }),
};
