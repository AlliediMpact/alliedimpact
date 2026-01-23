import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AuthEvent, ApiRequest } from '@/types/events';
import { validateApiToken, extractAppId, apiError, apiSuccess } from '@/lib/api-auth';
import { isValidAppId } from '@/config/apps';

/**
 * POST /api/v1/events/auth
 * 
 * Apps send authentication events (login/logout/mfa)
 * Retention: 90 days
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ApiRequest<AuthEvent> = await request.json();
    
    // Extract and validate appId
    const appId = extractAppId(body);
    if (!appId || !isValidAppId(appId)) {
      return apiError('INVALID_APP_ID', 'Invalid or missing appId', 400);
    }
    
    // Validate API token
    const authHeader = request.headers.get('Authorization');
    if (!validateApiToken(authHeader, appId)) {
      return apiError('UNAUTHORIZED', 'Invalid or missing API token', 401);
    }
    
    // Validate event data
    const event = body.data;
    if (!event || !event.event || !event.timestamp) {
      return apiError('INVALID_EVENT', 'Missing required fields', 400);
    }
    
    // Store in Firestore: controlhub_auth_events (collection)
    const authEventsRef = collection(db, 'controlhub_auth_events');
    
    await addDoc(authEventsRef, {
      ...event,
      receivedAt: serverTimestamp(),
      // Retention handled by Firebase Functions (scheduled cleanup)
    });
    
    return apiSuccess({ received: true });
    
  } catch (error) {
    console.error('Auth event error:', error);
    return apiError('INTERNAL_ERROR', 'Failed to process auth event', 500);
  }
}
