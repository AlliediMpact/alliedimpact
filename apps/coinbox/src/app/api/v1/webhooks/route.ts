// GET /api/v1/webhooks - List webhook subscriptions
// POST /api/v1/webhooks - Create webhook subscription
import { NextRequest } from 'next/server';
import { withApiMiddleware, apiSuccess, apiError } from '@/lib/api-middleware';
import { 
  createWebhookSubscription, 
  listWebhookSubscriptions,
  WebhookEvent 
} from '@/lib/webhook-service';

export const GET = withApiMiddleware(
  async (request: NextRequest, context: any) => {
    try {
      const { searchParams } = new URL(request.url);
      const includeInactive = searchParams.get('includeInactive') === 'true';

      const subscriptions = await listWebhookSubscriptions(
        context.apiKey.userId,
        includeInactive
      );

      // Don't expose secrets
      const sanitized = subscriptions.map(sub => ({
        id: sub.id,
        url: sub.url,
        events: sub.events,
        status: sub.status,
        failureCount: sub.failureCount,
        lastFailureAt: sub.lastFailureAt,
        lastSuccessAt: sub.lastSuccessAt,
        createdAt: sub.createdAt,
        metadata: sub.metadata,
      }));

      return apiSuccess({ webhooks: sanitized });
    } catch (error) {
      console.error('Error listing webhooks:', error);
      return apiError('Failed to list webhooks', 500);
    }
  },
  ['read:webhooks']
);

export const POST = withApiMiddleware(
  async (request: NextRequest, context: any) => {
    try {
      const body = await request.json();
      const { url, events, metadata } = body;

      if (!url || !events) {
        return apiError('Missing required fields: url, events', 400);
      }

      if (!Array.isArray(events) || events.length === 0) {
        return apiError('Events must be a non-empty array', 400);
      }

      // Validate events
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
        return apiError(
          `Invalid events: ${invalidEvents.join(', ')}. Valid events: ${validEvents.join(', ')}`,
          400
        );
      }

      const subscription = await createWebhookSubscription(
        context.apiKey.userId,
        context.apiKey.id,
        url,
        events,
        metadata
      );

      return apiSuccess(
        {
          webhook: {
            id: subscription.id,
            url: subscription.url,
            events: subscription.events,
            secret: subscription.secret, // Only returned on creation!
            status: subscription.status,
            createdAt: subscription.createdAt,
          },
          message: 'Webhook created successfully',
          warning: 'Store the webhook secret securely. It will not be shown again.',
        },
        201
      );
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      return apiError(error.message || 'Failed to create webhook', 500);
    }
  },
  ['write:webhooks']
);
