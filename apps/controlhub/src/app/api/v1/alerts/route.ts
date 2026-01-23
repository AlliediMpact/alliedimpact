import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Alert, ApiRequest } from '@/types/events';
import { validateApiToken, extractAppId, apiError, apiSuccess } from '@/lib/api-auth';
import { isValidAppId } from '@/config/apps';

/**
 * POST /api/v1/alerts
 * 
 * Apps send security/system/compliance alerts
 * Retention: 365 days
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ApiRequest<Alert> = await request.json();
    
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
    
    // Validate alert data
    const alert = body.data;
    if (!alert || !alert.severity || !alert.title || !alert.category) {
      return apiError('INVALID_ALERT', 'Missing required fields', 400);
    }
    
    // Store in Firestore: controlhub_alerts (collection)
    const alertsRef = collection(db, 'controlhub_alerts');
    
    const alertDoc = await addDoc(alertsRef, {
      ...alert,
      receivedAt: serverTimestamp(),
      acknowledged: false,
      resolved: false,
    });
    
    // TODO: Trigger notifications for critical alerts
    if (alert.severity === 'critical') {
      console.log(`🚨 CRITICAL ALERT from ${appId}: ${alert.title}`);
      // Future: Send email/SMS to on-call team
    }
    
    return apiSuccess({ received: true, alertId: alertDoc.id });
    
  } catch (error) {
    console.error('Alert error:', error);
    return apiError('INTERNAL_ERROR', 'Failed to process alert', 500);
  }
}
