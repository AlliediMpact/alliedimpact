// Webhook Service - Manage webhook subscriptions and deliveries
import { db } from './firebase';
import crypto from 'crypto';

export type WebhookEvent = 
  | 'loan.created'
  | 'loan.approved'
  | 'loan.rejected'
  | 'loan.disbursed'
  | 'loan.payment_received'
  | 'loan.completed'
  | 'investment.created'
  | 'investment.completed'
  | 'investment.dividend_paid'
  | 'transaction.created'
  | 'transaction.completed'
  | 'transaction.failed'
  | 'crypto.order_created'
  | 'crypto.order_filled'
  | 'crypto.order_cancelled'
  | 'user.kyc_completed'
  | 'user.kyc_rejected';

export interface WebhookSubscription {
  id?: string;
  userId: string;
  apiKeyId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  status: 'active' | 'inactive' | 'failed';
  failureCount: number;
  lastFailureAt?: string;
  lastSuccessAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface WebhookDelivery {
  id?: string;
  subscriptionId: string;
  userId: string;
  event: WebhookEvent;
  payload: any;
  status: 'pending' | 'delivered' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  createdAt: string;
  deliveredAt?: string;
}

/**
 * Create a new webhook subscription
 */
export async function createWebhookSubscription(
  userId: string,
  apiKeyId: string,
  url: string,
  events: WebhookEvent[],
  metadata?: Record<string, any>
): Promise<WebhookSubscription> {
  // Validate URL
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid webhook URL');
  }

  // Validate events
  if (!events || events.length === 0) {
    throw new Error('At least one event must be specified');
  }

  // Generate webhook secret
  const secret = `whsec_${crypto.randomBytes(32).toString('hex')}`;

  const subscription: WebhookSubscription = {
    userId,
    apiKeyId,
    url,
    events,
    secret,
    status: 'active',
    failureCount: 0,
    createdAt: new Date().toISOString(),
    metadata: metadata || {},
  };

  const docRef = await db.collection('webhookSubscriptions').add(subscription);
  subscription.id = docRef.id;

  // Log creation
  await db.collection('webhookEvents').add({
    subscriptionId: docRef.id,
    userId,
    event: 'subscription_created',
    timestamp: new Date().toISOString(),
  });

  return subscription;
}

/**
 * List webhook subscriptions for a user
 */
export async function listWebhookSubscriptions(
  userId: string,
  includeInactive = false
): Promise<WebhookSubscription[]> {
  let query = db.collection('webhookSubscriptions')
    .where('userId', '==', userId);

  if (!includeInactive) {
    query = query.where('status', '==', 'active');
  }

  const snapshot = await query.get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as WebhookSubscription[];
}

/**
 * Get a specific webhook subscription
 */
export async function getWebhookSubscription(
  subscriptionId: string
): Promise<WebhookSubscription | null> {
  const doc = await db.collection('webhookSubscriptions').doc(subscriptionId).get();
  
  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as WebhookSubscription;
}

/**
 * Update webhook subscription
 */
export async function updateWebhookSubscription(
  subscriptionId: string,
  updates: Partial<Pick<WebhookSubscription, 'url' | 'events' | 'status' | 'metadata'>>
): Promise<void> {
  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.url !== undefined) {
    // Validate URL
    try {
      new URL(updates.url);
      updateData.url = updates.url;
    } catch (error) {
      throw new Error('Invalid webhook URL');
    }
  }

  if (updates.events !== undefined) {
    if (!updates.events || updates.events.length === 0) {
      throw new Error('At least one event must be specified');
    }
    updateData.events = updates.events;
  }

  if (updates.status !== undefined) {
    updateData.status = updates.status;
    if (updates.status === 'active') {
      updateData.failureCount = 0;
      updateData.lastFailureAt = null;
    }
  }

  if (updates.metadata !== undefined) {
    updateData.metadata = updates.metadata;
  }

  await db.collection('webhookSubscriptions').doc(subscriptionId).update(updateData);

  // Log update
  await db.collection('webhookEvents').add({
    subscriptionId,
    event: 'subscription_updated',
    changes: updates,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Delete webhook subscription
 */
export async function deleteWebhookSubscription(subscriptionId: string): Promise<void> {
  await db.collection('webhookSubscriptions').doc(subscriptionId).delete();

  // Log deletion
  await db.collection('webhookEvents').add({
    subscriptionId,
    event: 'subscription_deleted',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Trigger a webhook event
 */
export async function triggerWebhookEvent(
  userId: string,
  event: WebhookEvent,
  payload: any
): Promise<void> {
  // Find all active subscriptions for this user and event
  const subscriptions = await db.collection('webhookSubscriptions')
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .where('events', 'array-contains', event)
    .get();

  if (subscriptions.empty) {
    return; // No subscriptions for this event
  }

  // Create delivery records for each subscription
  const deliveryPromises = subscriptions.docs.map(async (doc) => {
    const subscription = doc.data() as WebhookSubscription;
    
    const delivery: WebhookDelivery = {
      subscriptionId: doc.id,
      userId,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date().toISOString(),
    };

    const deliveryRef = await db.collection('webhookDeliveries').add(delivery);
    
    // Trigger async delivery (don't wait)
    deliverWebhook(deliveryRef.id, doc.id, subscription).catch(err => {
      console.error('Webhook delivery error:', err);
    });
  });

  await Promise.all(deliveryPromises);
}

/**
 * Deliver a webhook (with retries)
 */
async function deliverWebhook(
  deliveryId: string,
  subscriptionId: string,
  subscription: WebhookSubscription,
  retryCount = 0
): Promise<void> {
  const maxRetries = 3;
  const retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s

  try {
    const deliveryDoc = await db.collection('webhookDeliveries').doc(deliveryId).get();
    const delivery = deliveryDoc.data() as WebhookDelivery;

    // Create signature
    const signature = createWebhookSignature(delivery.payload, subscription.secret);

    // Send webhook
    const response = await fetch(subscription.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': delivery.event,
        'X-Webhook-Delivery-ID': deliveryId,
        'User-Agent': 'CoinBox-Webhooks/1.0',
      },
      body: JSON.stringify(delivery.payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    const responseBody = await response.text();

    if (response.ok) {
      // Success
      await db.collection('webhookDeliveries').doc(deliveryId).update({
        status: 'delivered',
        attempts: delivery.attempts + 1,
        lastAttemptAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        responseStatus: response.status,
        responseBody: responseBody.substring(0, 1000), // Limit size
      });

      await db.collection('webhookSubscriptions').doc(subscriptionId).update({
        lastSuccessAt: new Date().toISOString(),
        failureCount: 0,
      });
    } else {
      throw new Error(`HTTP ${response.status}: ${responseBody}`);
    }
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';
    
    await db.collection('webhookDeliveries').doc(deliveryId).update({
      status: 'failed',
      attempts: retryCount + 1,
      lastAttemptAt: new Date().toISOString(),
      error: errorMessage.substring(0, 500),
    });

    // Update subscription failure count
    await db.collection('webhookSubscriptions').doc(subscriptionId).update({
      failureCount: subscription.failureCount + 1,
      lastFailureAt: new Date().toISOString(),
    });

    // Check if we should disable the subscription
    if (subscription.failureCount + 1 >= 10) {
      await db.collection('webhookSubscriptions').doc(subscriptionId).update({
        status: 'failed',
      });
    } else if (retryCount < maxRetries) {
      // Retry
      setTimeout(() => {
        deliverWebhook(deliveryId, subscriptionId, subscription, retryCount + 1);
      }, retryDelays[retryCount]);
    }
  }
}

/**
 * Create webhook signature for verification
 */
export function createWebhookSignature(payload: any, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: any,
  signature: string,
  secret: string,
  tolerance = 300 // 5 minutes
): boolean {
  try {
    const parts = signature.split(',');
    const timestamp = parseInt(parts[0].split('=')[1], 10);
    const receivedSignature = parts[1].split('=')[1];

    // Check timestamp tolerance
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > tolerance) {
      return false;
    }

    // Verify signature
    const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Get webhook delivery logs
 */
export async function getWebhookDeliveries(
  subscriptionId: string,
  limit = 50
): Promise<WebhookDelivery[]> {
  const snapshot = await db.collection('webhookDeliveries')
    .where('subscriptionId', '==', subscriptionId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as WebhookDelivery[];
}

/**
 * Retry a failed webhook delivery
 */
export async function retryWebhookDelivery(deliveryId: string): Promise<void> {
  const deliveryDoc = await db.collection('webhookDeliveries').doc(deliveryId).get();
  
  if (!deliveryDoc.exists) {
    throw new Error('Delivery not found');
  }

  const delivery = deliveryDoc.data() as WebhookDelivery;
  
  if (delivery.status === 'delivered') {
    throw new Error('Cannot retry delivered webhook');
  }

  const subscription = await getWebhookSubscription(delivery.subscriptionId);
  
  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.status !== 'active') {
    throw new Error('Subscription is not active');
  }

  await deliverWebhook(deliveryId, delivery.subscriptionId, subscription);
}
