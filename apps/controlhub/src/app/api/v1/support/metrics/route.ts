import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { SupportMetrics, ApiRequest } from '@/types/events';
import { validateApiToken, extractAppId, apiError, apiSuccess } from '@/lib/api-auth';
import { isValidAppId } from '@/config/apps';

/**
 * POST /api/v1/support/metrics
 * 
 * Apps send support ticket summaries (high-level metrics only)
 * Retention: 90 days
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ApiRequest<SupportMetrics> = await request.json();
    
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
    
    // Validate metrics data
    const metrics = body.data;
    if (!metrics || !metrics.metrics) {
      return apiError('INVALID_METRICS', 'Missing required fields', 400);
    }
    
    // Store in Firestore: controlhub_support_metrics/{appId}
    const metricsRef = doc(db, 'controlhub_support_metrics', appId);
    
    await setDoc(metricsRef, {
      ...metrics,
      lastUpdated: serverTimestamp(),
      receivedAt: new Date().toISOString(),
    });
    
    return apiSuccess({ received: true });
    
  } catch (error) {
    console.error('Support metrics error:', error);
    return apiError('INTERNAL_ERROR', 'Failed to process support metrics', 500);
  }
}
