/**
 * Notification Service
 * Handles push notifications, in-app notifications, and email triggers
 */

import { addDoc, collection, query, where, getDocs, updateDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { captureException } from '@/lib/monitoring';

export type NotificationType = 
  | 'course_enrolled'
  | 'lesson_completed'
  | 'course_completed'
  | 'trial_expiring'
  | 'subscription_activated'
  | 'forum_reply'
  | 'facilitator_note'
  | 'class_reminder'
  | 'achievement_earned';

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  actionUrl?: string;
  createdAt: Timestamp;
  readAt?: Timestamp;
}

const notificationsRef = collection(db, 'edutech_notifications');

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    data?: Record<string, any>;
    actionUrl?: string;
    sendPush?: boolean;
    sendEmail?: boolean;
  }
): Promise<string> {
  try {
    const notification: Omit<Notification, 'notificationId'> = {
      userId,
      type,
      title,
      message,
      data: options?.data,
      actionUrl: options?.actionUrl,
      read: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(notificationsRef, notification);

    // Send push notification if requested
    if (options?.sendPush) {
      await sendPushNotification(userId, title, message, options.actionUrl);
    }

    // Send email if requested
    if (options?.sendEmail) {
      await sendEmailNotification(userId, title, message, options.actionUrl);
    }

    return docRef.id;
  } catch (error) {
    captureException(error as Error, {
      tags: { service: 'notifications' },
      extra: { userId, type, title },
    });
    throw error;
  }
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limitCount?: number;
  }
): Promise<Notification[]> {
  try {
    let q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (options?.unreadOnly) {
      q = query(q, where('read', '==', false));
    }

    if (options?.limitCount) {
      q = query(q, limit(options.limitCount));
    }

    const snapshot = await getDocs(q);
    const notifications: Notification[] = [];

    snapshot.forEach((doc) => {
      notifications.push({
        notificationId: doc.id,
        ...doc.data(),
      } as Notification);
    });

    return notifications;
  } catch (error) {
    captureException(error as Error, {
      tags: { service: 'notifications' },
      extra: { userId },
    });
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationDoc = doc(notificationsRef, notificationId);
    await updateDoc(notificationDoc, {
      read: true,
      readAt: Timestamp.now(),
    });
  } catch (error) {
    captureException(error as Error, {
      tags: { service: 'notifications' },
      extra: { notificationId },
    });
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        read: true,
        readAt: Timestamp.now(),
      })
    );

    await Promise.all(updates);
  } catch (error) {
    captureException(error as Error, {
      tags: { service: 'notifications' },
      extra: { userId },
    });
    throw error;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    captureException(error as Error, {
      tags: { service: 'notifications' },
      extra: { userId },
    });
    throw error;
  }
}

/**
 * Send push notification (requires service worker)
 */
async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  url?: string
): Promise<void> {
  try {
    // In a real implementation, this would:
    // 1. Get user's push subscription from Firestore
    // 2. Use Web Push API to send notification
    // 3. Handle errors and retry logic

    console.log('📲 Push notification:', { userId, title, body, url });

    // Placeholder for future implementation
    // await fetch('/api/notifications/push', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, title, body, url }),
    // });
  } catch (error) {
    console.error('Push notification failed:', error);
    // Don't throw - push notifications are optional
  }
}

/**
 * Send email notification (triggers Cloud Function or external service)
 */
async function sendEmailNotification(
  userId: string,
  subject: string,
  content: string,
  actionUrl?: string
): Promise<void> {
  try {
    console.log('📧 Email notification:', { userId, subject, actionUrl });

    // Placeholder for future implementation
    // await fetch('/api/notifications/email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, subject, content, actionUrl }),
    // });
  } catch (error) {
    console.error('Email notification failed:', error);
    // Don't throw - email notifications are optional
  }
}

/**
 * Predefined notification templates
 */
export const NotificationTemplates = {
  courseEnrolled: (courseName: string, courseId: string) => ({
    type: 'course_enrolled' as NotificationType,
    title: 'Course Enrolled!',
    message: `You've successfully enrolled in ${courseName}. Start learning now!`,
    actionUrl: `/en/courses/${courseId}`,
  }),

  lessonCompleted: (lessonName: string, courseId: string) => ({
    type: 'lesson_completed' as NotificationType,
    title: 'Lesson Completed! 🎉',
    message: `Great job completing "${lessonName}"! Keep up the momentum.`,
    actionUrl: `/en/courses/${courseId}`,
  }),

  courseCompleted: (courseName: string, certificateId: string) => ({
    type: 'course_completed' as NotificationType,
    title: 'Course Completed! 🏆',
    message: `Congratulations! You've completed ${courseName}. View your certificate.`,
    actionUrl: `/en/certificates/${certificateId}`,
  }),

  trialExpiring: (daysRemaining: number) => ({
    type: 'trial_expiring' as NotificationType,
    title: 'Trial Ending Soon',
    message: `Your 30-day trial expires in ${daysRemaining} days. Subscribe now to continue learning!`,
    actionUrl: '/en/pricing',
  }),

  forumReply: (postTitle: string, postId: string) => ({
    type: 'forum_reply' as NotificationType,
    title: 'New Forum Reply',
    message: `Someone replied to your post "${postTitle}"`,
    actionUrl: `/en/forum/post/${postId}`,
  }),

  facilitatorNote: (facilitatorName: string, classId: string) => ({
    type: 'facilitator_note' as NotificationType,
    title: 'Facilitator Note Added',
    message: `${facilitatorName} added a performance note for you.`,
    actionUrl: `/en/classes/${classId}`,
  }),

  classReminder: (className: string, time: string) => ({
    type: 'class_reminder' as NotificationType,
    title: 'Class Reminder',
    message: `${className} starts in ${time}. Don't forget to attend!`,
    actionUrl: '/en/dashboard',
  }),
};
