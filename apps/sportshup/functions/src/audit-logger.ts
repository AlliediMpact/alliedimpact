/**
 * Audit Logging System for SportsHub
 * Tracks all admin actions for compliance and accountability
 */

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export type AdminAction = 
  | 'create_tournament'
  | 'update_tournament'
  | 'delete_tournament'
  | 'publish_tournament'
  | 'unpublish_tournament'
  | 'close_tournament'
  | 'add_voting_item'
  | 'update_voting_item'
  | 'delete_voting_item'
  | 'create_project'
  | 'update_project'
  | 'delete_project'
  | 'grant_role'
  | 'revoke_role'
  | 'refund_wallet'
  | 'adjust_balance'
  | 'system_action';

export interface AuditLog {
  userId: string;
  userEmail?: string;
  action: AdminAction;
  resourceType: string;
  resourceId: string;
  projectId?: string;
  metadata?: Record<string, any>;
  timestamp: admin.firestore.FieldValue;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an admin action to the audit trail
 */
export async function logAdminAction(
  userId: string,
  action: AdminAction,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, any>,
  projectId?: string
): Promise<void> {
  try {
    // Get user details for logging
    let userEmail: string | undefined;
    try {
      const userRecord = await admin.auth().getUser(userId);
      userEmail = userRecord.email;
    } catch (error) {
      functions.logger.warn('Could not fetch user email for audit log', { userId, error });
    }
    
    const auditLog: AuditLog = {
      userId,
      userEmail,
      action,
      resourceType,
      resourceId,
      projectId,
      metadata,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await admin.firestore().collection('sportshub_admin_logs').add(auditLog);
    
    functions.logger.info('Admin action logged', {
      userId,
      action,
      resourceType,
      resourceId,
    });
  } catch (error) {
    // Don't fail the operation if logging fails
    functions.logger.error('Failed to log admin action', {
      error,
      userId,
      action,
      resourceType,
      resourceId,
    });
  }
}

/**
 * Create audit log middleware for Cloud Functions
 */
export function withAuditLog(
  action: AdminAction,
  resourceType: string,
  getResourceId: (data: any) => string
) {
  return async (
    data: any,
    context: functions.https.CallableContext,
    next: (data: any, context: functions.https.CallableContext) => Promise<any>
  ): Promise<any> => {
    const userId = context.auth?.uid;
    
    if (!userId) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    
    const resourceId = getResourceId(data);
    
    // Execute the operation
    const result = await next(data, context);
    
    // Log after successful operation
    await logAdminAction(
      userId,
      action,
      resourceType,
      resourceId,
      { data, result },
      data.projectId
    );
    
    return result;
  };
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const logsRef = admin.firestore().collection('sportshub_admin_logs');
  
  const snapshot = await logsRef
    .where('resourceType', '==', resourceType)
    .where('resourceId', '==', resourceId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const logsRef = admin.firestore().collection('sportshub_admin_logs');
  
  const snapshot = await logsRef
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}

/**
 * Get recent audit logs (for admin dashboard)
 */
export async function getRecentAuditLogs(limit: number = 20): Promise<AuditLog[]> {
  const logsRef = admin.firestore().collection('sportshub_admin_logs');
  
  const snapshot = await logsRef
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map((doc) => doc.data() as AuditLog);
}

/**
 * Scheduled cleanup of old audit logs (>1 year)
 */
export const cleanupOldAuditLogs = functions.pubsub
  .schedule('every 7 days')
  .onRun(async () => {
    const oneYearAgo = admin.firestore.Timestamp.fromMillis(
      Date.now() - 365 * 24 * 60 * 60 * 1000
    );
    
    const logsRef = admin.firestore().collection('sportshub_admin_logs');
    const snapshot = await logsRef
      .where('timestamp', '<', oneYearAgo)
      .limit(500)
      .get();
    
    if (snapshot.empty) {
      functions.logger.info('No old audit logs to clean up');
      return;
    }
    
    const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);
    
    functions.logger.info('Old audit logs cleaned up', { count: snapshot.size });
  });
