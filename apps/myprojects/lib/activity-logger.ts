import { ActivityEvent } from '@/components/ActivityFeed';

/**
 * Create an activity event in Firestore
 * This function logs user actions in the activity timeline
 */
export async function createActivityEvent(
  projectId: string,
  type: ActivityEvent['type'],
  action: string,
  entityId: string,
  entityName: string,
  metadata?: ActivityEvent['metadata']
): Promise<void> {
  try {
    const { getAuthInstance } = await import('@allied-impact/auth');
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    
    const auth = getAuthInstance();
    if (!auth.currentUser) {
      console.warn('No user logged in, skipping activity logging');
      return;
    }

    const db = getFirestore(getApp());
    await addDoc(collection(db, 'activities'), {
      projectId,
      type,
      action,
      entityId,
      entityName,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || auth.currentUser.email || 'Unknown User',
      userAvatar: auth.currentUser.photoURL,
      timestamp: serverTimestamp(),
      metadata: metadata || {}
    });
  } catch (error) {
    // Silently fail - activity logging should not break the main flow
    console.error('Failed to create activity event:', error);
  }
}

/**
 * Activity type definitions for better type safety
 */
export const ActivityTypes = {
  MILESTONE: 'milestone' as const,
  DELIVERABLE: 'deliverable' as const,
  TICKET: 'ticket' as const,
  COMMENT: 'comment' as const,
  STATUS_CHANGE: 'status_change' as const,
  FILE_UPLOAD: 'file_upload' as const,
  TEAM: 'team' as const,
};

/**
 * Common activity actions
 */
export const ActivityActions = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  APPROVED: 'approved',
  REVISION_REQUESTED: 'revision_requested',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened',
  COMMENTED: 'commented',
  UPLOADED: 'uploaded',
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
};

/**
 * Helper functions for common activity patterns
 */

export async function logMilestoneActivity(
  projectId: string,
  milestoneId: string,
  milestoneName: string,
  action: string,
  metadata?: ActivityEvent['metadata']
) {
  await createActivityEvent(
    projectId,
    ActivityTypes.MILESTONE,
    action,
    milestoneId,
    milestoneName,
    metadata
  );
}

export async function logDeliverableActivity(
  projectId: string,
  deliverableId: string,
  deliverableName: string,
  action: string,
  metadata?: ActivityEvent['metadata']
) {
  await createActivityEvent(
    projectId,
    ActivityTypes.DELIVERABLE,
    action,
    deliverableId,
    deliverableName,
    metadata
  );
}

export async function logTicketActivity(
  projectId: string,
  ticketId: string,
  ticketTitle: string,
  action: string,
  metadata?: ActivityEvent['metadata']
) {
  await createActivityEvent(
    projectId,
    ActivityTypes.TICKET,
    action,
    ticketId,
    ticketTitle,
    metadata
  );
}

export async function logCommentActivity(
  projectId: string,
  entityId: string,
  entityName: string,
  commentText?: string
) {
  await createActivityEvent(
    projectId,
    ActivityTypes.COMMENT,
    ActivityActions.COMMENTED,
    entityId,
    entityName,
    { commentText }
  );
}

export async function logStatusChange(
  projectId: string,
  entityId: string,
  entityName: string,
  entityType: ActivityEvent['type'],
  oldStatus: string,
  newStatus: string
) {
  await createActivityEvent(
    projectId,
    ActivityTypes.STATUS_CHANGE,
    'status_changed',
    entityId,
    entityName,
    {
      entityType,
      oldValue: oldStatus,
      newValue: newStatus
    }
  );
}

export async function logFileUpload(
  projectId: string,
  entityId: string,
  entityName: string,
  fileCount: number = 1
) {
  await createActivityEvent(
    projectId,
    ActivityTypes.FILE_UPLOAD,
    ActivityActions.UPLOADED,
    entityId,
    entityName,
    { fileCount }
  );
}
