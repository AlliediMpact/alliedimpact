/**
 * @allied-impact/notifications
 * 
 * Platform-wide notification service.
 * Handles email, in-app, push, and SMS notifications.
 */

import { createLogger } from '@allied-impact/shared';
import { getFirestore, collection, doc, addDoc, getDoc, updateDoc, query, where, getDocs, orderBy, limit as firestoreLimit, Timestamp } from 'firebase/firestore';
import type { Notification, ProductId, NotificationType, NotificationPriority } from '@allied-impact/types';

const logger = createLogger('notifications');

// Email service configuration (will be expanded with SendGrid/similar)
let emailService: any = null;

/**
 * Initialize email service (e.g., SendGrid, Firebase Email Extension)
 */
export function initializeEmailService(config: any): void {
  emailService = config;
}

/**
 * Send a notification
 */
export async function sendNotification(
  userId: string,
  notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt' | 'readAt'>
): Promise<string> {
  const db = getFirestore();
  const now = new Date();
  
  const notificationData: Omit<Notification, 'id'> = {
    userId,
    ...notification,
    read: false,
    createdAt: now
  };
  
  // Save to Firestore for in-app notifications
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...notificationData,
    createdAt: Timestamp.fromDate(now)
  });
    // Send via appropriate channels
  if (notification.type === 'email' || notification.priority === 'urgent') {
    await sendEmailNotification(userId, {
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl
    });
  }
  
  if (notification.type === 'push') {
    await sendPushNotification(userId, {
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl
    });
  }
  
  if (notification.type === 'sms') {
    await sendSmsNotification(userId, {
      title: notification.title,
      message: notification.message
    });
  }
  
  return docRef.id;
}

/**
 * Send email notification
 */
async function sendEmailNotification(
  userId: string,
  notification: Pick<Notification, 'title' | 'message' | 'actionUrl'>
): Promise<void> {
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, 'platform_users', userId));
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  const email = userData.email;
  
  // TODO: Integrate with email service (SendGrid, Firebase Email Extension, etc.)
  logger.info('Sending email', { 
    recipient: email, 
    title: notification.title 
  });
  
  // Placeholder for actual email sending
  // await emailService.send({
  //   to: email,
  //   subject: notification.title,
  //   html: createEmailTemplate(notification)
  // });
}

/**
 * Send push notification (Firebase Cloud Messaging)
 */
async function sendPushNotification(
  userId: string,
  notification: Pick<Notification, 'title' | 'message' | 'actionUrl'>
): Promise<void> {
  // TODO: Integrate with Firebase Cloud Messaging
  logger.info('Sending push notification', { 
    userId, 
    title: notification.title 
  });
  
  // Placeholder for FCM integration
  // const messaging = getMessaging();
  // await messaging.send({
  //   notification: {
  //     title: notification.title,
  //     body: notification.message
  //   },
  //   token: userDeviceToken
  // });
}

/**
 * Send SMS notification
 */
async function sendSmsNotification(
  userId: string,
  notification: Pick<Notification, 'title' | 'message'>
): Promise<void> {
  const db = getFirestore();
  const userDoc = await getDoc(doc(db, 'platform_users', userId));
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  const phoneNumber = userData.phoneNumber;
  
  if (!phoneNumber) {
    logger.warn('User has no phone number for SMS', { userId });
    return;
  }
  
  // TODO: Integrate with SMS service (Twilio, Africa's Talking, etc.)
  logger.info('Sending SMS', { 
    recipient: phoneNumber, 
    message: notification.message?.substring(0, 50) 
  });
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(
  userId: string,
  options: {
    unreadOnly?: boolean;
    limit?: number;
    productId?: ProductId;
  } = {}
): Promise<Notification[]> {
  const db = getFirestore();
  
  let q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  if (options.unreadOnly) {
    q = query(q, where('read', '==', false));
  }
  
  if (options.productId) {
    q = query(q, where('productId', '==', options.productId));
  }
    if (options.limit) {
    q = query(q, firestoreLimit(options.limit));
  }
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      readAt: data.readAt?.toDate()
    } as Notification;
  });
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const db = getFirestore();
  
  await updateDoc(doc(db, 'notifications', notificationId), {
    read: true,
    readAt: Timestamp.now()
  });
}

/**
 * Mark all user notifications as read
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const notifications = await getUserNotifications(userId, { unreadOnly: true });
  
  const db = getFirestore();
  const batch = notifications.map(notification =>
    updateDoc(doc(db, 'notifications', notification.id), {
      read: true,
      readAt: Timestamp.now()
    })
  );
  
  await Promise.all(batch);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const notifications = await getUserNotifications(userId, { unreadOnly: true });
  return notifications.length;
}

/**
 * Send welcome notification to new user
 */
export async function sendWelcomeNotification(userId: string, userName?: string): Promise<void> {
  await sendNotification(userId, {
    type: 'email',
    priority: 'medium',
    title: 'Welcome to Allied iMpact!',
    message: `Hi ${userName || 'there'}! Welcome to Allied iMpact. Explore our products and start your journey today.`,
    actionUrl: '/dashboard'
  });
}

/**
 * Send product access granted notification
 */
export async function sendProductAccessNotification(
  userId: string,
  productId: ProductId
): Promise<void> {
  const productNames: Record<ProductId, string> = {
    coinbox: 'Coin Box',
    drivemaster: 'Drive Master',
    codetech: 'CodeTech',
    cupfinal: 'Cup Final',
    umkhanyakude: 'uMkhanyakude'
  };
  
  await sendNotification(userId, {
    type: 'in_app',
    priority: 'high',
    productId,
    title: 'Product Access Granted!',
    message: `You now have access to ${productNames[productId]}. Start exploring now!`,
    actionUrl: `/products/${productId}`
  });
}

/**
 * Send payment confirmation notification
 */
export async function sendPaymentConfirmation(
  userId: string,
  productId: ProductId,
  amount: number,
  currency: string
): Promise<void> {
  await sendNotification(userId, {
    type: 'email',
    priority: 'high',
    productId,
    title: 'Payment Confirmed',
    message: `Your payment of ${currency.toUpperCase()} ${amount.toFixed(2)} has been processed successfully.`,
    actionUrl: '/dashboard/billing'
  });
}

/**
 * Send subscription expiry warning
 */
export async function sendSubscriptionExpiryWarning(
  userId: string,
  productId: ProductId,
  daysRemaining: number
): Promise<void> {
  await sendNotification(userId, {
    type: 'email',
    priority: 'urgent',
    productId,
    title: 'Subscription Expiring Soon',
    message: `Your subscription will expire in ${daysRemaining} days. Renew now to continue enjoying our services.`,
    actionUrl: '/dashboard/billing'
  });
}

export default {
  initializeEmailService,
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  sendWelcomeNotification,
  sendProductAccessNotification,
  sendPaymentConfirmation,
  sendSubscriptionExpiryWarning
};
