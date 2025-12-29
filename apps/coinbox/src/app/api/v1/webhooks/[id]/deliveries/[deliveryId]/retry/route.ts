// POST /api/v1/webhooks/:id/deliveries/:deliveryId/retry - Retry failed webhook
import { NextRequest } from 'next/server';
import { withApiMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { 
  getWebhookSubscription,
  retryWebhookDelivery
} from '@/lib/webhook-service';
import { db } from '@/lib/firebase';

export const POST = withApiMiddleware(
  async (
    request: NextRequest, 
    context: any, 
    { params }: { params: { id: string; deliveryId: string } }
  ) => {
    try {
      const subscription = await getWebhookSubscription(params.id);

      if (!subscription) {
        return apiError('Webhook not found', 404);
      }

      // Verify ownership
      if (subscription.userId !== context.apiKey.userId) {
        return apiError('Forbidden', 403);
      }

      // Verify delivery belongs to this subscription
      const deliveryDoc = await db.collection('webhookDeliveries').doc(params.deliveryId).get();
      
      if (!deliveryDoc.exists) {
        return apiError('Delivery not found', 404);
      }

      const delivery = deliveryDoc.data();
      if (delivery?.subscriptionId !== params.id) {
        return apiError('Delivery does not belong to this webhook', 400);
      }

      await retryWebhookDelivery(params.deliveryId);

      return apiSuccess({ message: 'Webhook delivery retry initiated' });
    } catch (error: any) {
      console.error('Error retrying webhook delivery:', error);
      return apiError(error.message || 'Failed to retry webhook delivery', 500);
    }
  },
  ['write:webhooks']
);
