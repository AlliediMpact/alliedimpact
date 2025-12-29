// GET /api/v1/webhooks/:id - Get webhook details
// PUT /api/v1/webhooks/:id - Update webhook
// DELETE /api/v1/webhooks/:id - Delete webhook
import { NextRequest } from 'next/server';
import { withApiMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { 
  getWebhookSubscription,
  updateWebhookSubscription,
  deleteWebhookSubscription,
  WebhookEvent
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

      // Don't expose secret
      const sanitized = {
        id: subscription.id,
        url: subscription.url,
        events: subscription.events,
        status: subscription.status,
        failureCount: subscription.failureCount,
        lastFailureAt: subscription.lastFailureAt,
        lastSuccessAt: subscription.lastSuccessAt,
        createdAt: subscription.createdAt,
        metadata: subscription.metadata,
      };

      return apiSuccess({ webhook: sanitized });
    } catch (error) {
      console.error('Error fetching webhook:', error);
      return apiError('Failed to fetch webhook', 500);
    }
  },
  ['read:webhooks']
);

export const PUT = withApiMiddleware(
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

      const body = await request.json();
      const { url, events, status, metadata } = body;

      // Validate events if provided
      if (events !== undefined) {
        if (!Array.isArray(events) || events.length === 0) {
          return apiError('Events must be a non-empty array', 400);
        }

        const validEvents: WebhookEvent[] = [
          'loan.created', 'loan.approved', 'loan.rejected', 'loan.disbursed',
          'loan.payment_received', 'loan.completed',
          'investment.created', 'investment.completed', 'investment.dividend_paid',
          'transaction.created', 'transaction.completed', 'transaction.failed',
          'crypto.order_created', 'crypto.order_filled', 'crypto.order_cancelled',
          'user.kyc_completed', 'user.kyc_rejected',
        ];

        const invalidEvents = events.filter(e => !validEvents.includes(e));
        if (invalidEvents.length > 0) {
          return apiError(`Invalid events: ${invalidEvents.join(', ')}`, 400);
        }
      }

      // Validate status if provided
      if (status !== undefined && !['active', 'inactive'].includes(status)) {
        return apiError('Invalid status. Must be active or inactive', 400);
      }

      await updateWebhookSubscription(params.id, {
        url,
        events,
        status,
        metadata,
      });

      return apiSuccess({ message: 'Webhook updated successfully' });
    } catch (error: any) {
      console.error('Error updating webhook:', error);
      return apiError(error.message || 'Failed to update webhook', 500);
    }
  },
  ['write:webhooks']
);

export const DELETE = withApiMiddleware(
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

      await deleteWebhookSubscription(params.id);

      return apiSuccess({ message: 'Webhook deleted successfully' });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      return apiError('Failed to delete webhook', 500);
    }
  },
  ['write:webhooks']
);
