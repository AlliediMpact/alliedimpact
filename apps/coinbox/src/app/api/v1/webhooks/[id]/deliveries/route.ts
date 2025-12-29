// GET /api/v1/webhooks/:id/deliveries - Get webhook delivery logs
import { NextRequest } from 'next/server';
import { withApiMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { 
  getWebhookSubscription,
  getWebhookDeliveries
} from '@/lib/webhook-service';

export const GET = withApiMiddleware(
  async (request: NextRequest, context: any, { params }: { params: { id: string } }) => {
    try {
      const subscription = await getWebhookSubscription(params.id);

      if (!subscription) {
        return apiError('Webhook not found', 404);
      }

      // Verify ownership
      if (subscription.userId !== context.apiKey.userId) {
        return apiError('Forbidden', 403);
      }

      const { searchParams } = new URL(request.url);
      const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

      const deliveries = await getWebhookDeliveries(params.id, limit);

      return apiSuccess({ 
        deliveries,
        total: deliveries.length 
      });
    } catch (error) {
      console.error('Error fetching webhook deliveries:', error);
      return apiError('Failed to fetch webhook deliveries', 500);
    }
  },
  ['read:webhooks']
);
