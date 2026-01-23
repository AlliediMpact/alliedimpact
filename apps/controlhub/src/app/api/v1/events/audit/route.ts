import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AuditEvent, ApiRequest } from '@/types/events';
import { validateApiToken, extractAppId, apiError, apiSuccess } from '@/lib/api-auth';
import { isValidAppId } from '@/config/apps';

/**
 * POST /api/v1/events/audit
 * 
 * Apps send audit log entries (admin actions, critical operations)
 * Retention: 7 years (2555 days) - IMMUTABLE
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ApiRequest<AuditEvent> = await request.json();
    
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
    if (!event || !event.action || !event.actor || !event.timestamp) {
      return apiError('INVALID_EVENT', 'Missing required fields', 400);
    }
    
    // Store in Firestore: controlhub_audit_logs (collection)
    // IMPORTANT: Firestore rules must prevent updates/deletes (immutable)
    const auditLogsRef = collection(db, 'controlhub_audit_logs');
    
    await addDoc(auditLogsRef, {
      ...event,
      receivedAt: serverTimestamp(),
      immutable: true, // Flag to prevent modifications
      // 7-year retention handled by compliance policy
    });
    
    return apiSuccess({ received: true, immutable: true });
    
  } catch (error) {
    console.error('Audit event error:', error);
    return apiError('INTERNAL_ERROR', 'Failed to process audit event', 500);
  }
}
