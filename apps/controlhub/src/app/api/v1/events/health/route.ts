import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { HealthEvent, ApiRequest } from '@/types/events';
import { validateApiToken, extractAppId, apiError, apiSuccess } from '@/lib/api-auth';
import { isValidAppId } from '@/config/apps';

/**
 * POST /api/v1/events/health
 * 
 * Apps send health status pings (every 60 seconds)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ApiRequest<HealthEvent> = await request.json();
    
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
    if (!event || !event.status || !event.environment) {
      return apiError('INVALID_EVENT', 'Missing required fields', 400);
    }
    
    // Store in Firestore: controlhub_app_health/{appId}
    const healthRef = doc(db, 'controlhub_app_health', appId);
    
    await setDoc(healthRef, {
      ...event,
      lastUpdated: serverTimestamp(),
      receivedAt: new Date().toISOString(),
    });
    
    return apiSuccess({ received: true });
    
  } catch (error) {
    console.error('Health event error:', error);
    return apiError('INTERNAL_ERROR', 'Failed to process health event', 500);
  }
}
