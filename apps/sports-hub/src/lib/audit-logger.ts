import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type AuditAction = 
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.suspend'
  | 'user.activate'
  | 'tournament.create'
  | 'tournament.update'
  | 'tournament.delete'
  | 'wallet.refund'
  | 'wallet.credit'
  | 'wallet.debit'
  | 'settings.update'
  | 'mfa.enable'
  | 'mfa.disable'
  | 'admin.login'
  | 'admin.logout';

export type AuditStatus = 'success' | 'failure' | 'pending';

export interface AuditLogData {
  userId: string;
  userEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: AuditStatus;
  errorMessage?: string;
}

/**
 * Log an audit event to Firestore
 * @param data - Audit log data
 * @returns Promise with the document ID
 */
export async function logAuditEvent(data: AuditLogData): Promise<string> {
  try {
    const logsRef = collection(db, 'sportshub_admin_logs');
    
    const logEntry = {
      ...data,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(logsRef, logEntry);
    return docRef.id;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    throw error;
  }
}

/**
 * Helper function to get client IP address (for API routes)
 * @param request - Next.js request object
 * @returns IP address string
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (real) {
    return real;
  }
  
  return 'unknown';
}

/**
 * Helper function to get user agent
 * @param request - Next.js request object
 * @returns User agent string
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Convenience function for logging successful actions
 */
export async function logSuccess(
  userId: string,
  userEmail: string,
  action: AuditAction,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<string> {
  return logAuditEvent({
    userId,
    userEmail,
    action,
    resource,
    resourceId,
    details,
    status: 'success',
  });
}

/**
 * Convenience function for logging failed actions
 */
export async function logFailure(
  userId: string,
  userEmail: string,
  action: AuditAction,
  resource: string,
  errorMessage: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<string> {
  return logAuditEvent({
    userId,
    userEmail,
    action,
    resource,
    resourceId,
    details,
    status: 'failure',
    errorMessage,
  });
}

/**
 * Example usage in an API route:
 * 
 * import { logAuditEvent, getClientIP, getUserAgent } from '@/lib/audit-logger';
 * 
 * export async function POST(request: Request) {
 *   try {
 *     // Your action here
 *     await suspendUser(userId);
 *     
 *     // Log the action
 *     await logAuditEvent({
 *       userId: currentUser.uid,
 *       userEmail: currentUser.email!,
 *       action: 'user.suspend',
 *       resource: 'users',
 *       resourceId: userId,
 *       ipAddress: getClientIP(request),
 *       userAgent: getUserAgent(request),
 *       status: 'success',
 *       details: { reason: 'Violated terms of service' }
 *     });
 *     
 *     return Response.json({ success: true });
 *   } catch (error: any) {
 *     // Log the failure
 *     await logAuditEvent({
 *       userId: currentUser.uid,
 *       userEmail: currentUser.email!,
 *       action: 'user.suspend',
 *       resource: 'users',
 *       resourceId: userId,
 *       ipAddress: getClientIP(request),
 *       userAgent: getUserAgent(request),
 *       status: 'failure',
 *       errorMessage: error.message
 *     });
 *     
 *     return Response.json({ error: error.message }, { status: 500 });
 *   }
 * }
 */
