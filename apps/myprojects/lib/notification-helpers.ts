import { Notification, createNotification } from '@/components/NotificationsPanel';

/**
 * Notification helper functions for common notification patterns
 */

export const NotificationTypes = {
  COMMENT: 'comment' as const,
  APPROVAL: 'approval' as const,
  MILESTONE: 'milestone' as const,
  DEADLINE: 'deadline' as const,
  STATUS_CHANGE: 'status_change' as const,
  ASSIGNMENT: 'assignment' as const,
  MENTION: 'mention' as const,
};

/**
 * Send notification to a specific user
 */
export async function sendNotification(
  userId: string,
  projectId: string,
  projectName: string,
  type: Notification['type'],
  title: string,
  message: string,
  actionUrl?: string,
  metadata?: Notification['metadata']
): Promise<void> {
  await createNotification(userId, projectId, projectName, type, title, message, actionUrl, metadata);
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToMultiple(
  userIds: string[],
  projectId: string,
  projectName: string,
  type: Notification['type'],
  title: string,
  message: string,
  actionUrl?: string,
  metadata?: Notification['metadata']
): Promise<void> {
  await Promise.all(
    userIds.map(userId => 
      createNotification(userId, projectId, projectName, type, title, message, actionUrl, metadata)
    )
  );
}

/**
 * Notify about new comment
 */
export async function notifyNewComment(
  userId: string,
  projectId: string,
  projectName: string,
  commenterName: string,
  entityType: string,
  entityName: string,
  commentText: string,
  actionUrl: string
): Promise<void> {
  await sendNotification(
    userId,
    projectId,
    projectName,
    NotificationTypes.COMMENT,
    'New Comment',
    `${commenterName} commented on ${entityType} "${entityName}": ${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}`,
    actionUrl,
    { entityType, entityName, commenterName }
  );
}

/**
 * Notify about deliverable approval
 */
export async function notifyDeliverableApproval(
  userId: string,
  projectId: string,
  projectName: string,
  deliverableName: string,
  approverName: string,
  actionUrl: string
): Promise<void> {
  await sendNotification(
    userId,
    projectId,
    projectName,
    NotificationTypes.APPROVAL,
    'Deliverable Approved',
    `${approverName} approved deliverable "${deliverableName}"`,
    actionUrl,
    { deliverableName, approverName }
  );
}

/**
 * Notify about deliverable revision request
 */
export async function notifyRevisionRequested(
  userId: string,
  projectId: string,
  projectName: string,
  deliverableName: string,
  requesterName: string,
  notes: string,
  actionUrl: string
): Promise<void> {
  await sendNotification(
    userId,
    projectId,
    projectName,
    NotificationTypes.STATUS_CHANGE,
    'Revision Requested',
    `${requesterName} requested revision for "${deliverableName}": ${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}`,
    actionUrl,
    { deliverableName, requesterName, notes }
  );
}

/**
 * Notify about milestone completion
 */
export async function notifyMilestoneCompleted(
  userIds: string[],
  projectId: string,
  projectName: string,
  milestoneName: string,
  actionUrl: string
): Promise<void> {
  await sendNotificationToMultiple(
    userIds,
    projectId,
    projectName,
    NotificationTypes.MILESTONE,
    'Milestone Completed',
    `Milestone "${milestoneName}" has been completed!`,
    actionUrl,
    { milestoneName }
  );
}

/**
 * Notify about upcoming deadline
 */
export async function notifyUpcomingDeadline(
  userId: string,
  projectId: string,
  projectName: string,
  entityType: string,
  entityName: string,
  daysLeft: number,
  actionUrl: string
): Promise<void> {
  const timeText = daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`;
  
  await sendNotification(
    userId,
    projectId,
    projectName,
    NotificationTypes.DEADLINE,
    'Upcoming Deadline',
    `${entityType} "${entityName}" is due ${timeText}`,
    actionUrl,
    { entityType, entityName, daysLeft }
  );
}

/**
 * Notify about overdue item
 */
export async function notifyOverdue(
  userIds: string[],
  projectId: string,
  projectName: string,
  entityType: string,
  entityName: string,
  actionUrl: string
): Promise<void> {
  await sendNotificationToMultiple(
    userIds,
    projectId,
    projectName,
    NotificationTypes.DEADLINE,
    'Item Overdue',
    `${entityType} "${entityName}" is now overdue`,
    actionUrl,
    { entityType, entityName }
  );
}

/**
 * Notify about assignment
 */
export async function notifyAssignment(
  userId: string,
  projectId: string,
  projectName: string,
  entityType: string,
  entityName: string,
  assignerName: string,
  actionUrl: string
): Promise<void> {
  await sendNotification(
    userId,
    projectId,
    projectName,
    NotificationTypes.ASSIGNMENT,
    'You Were Assigned',
    `${assignerName} assigned you to ${entityType} "${entityName}"`,
    actionUrl,
    { entityType, entityName, assignerName }
  );
}

/**
 * Notify about mention
 */
export async function notifyMention(
  userId: string,
  projectId: string,
  projectName: string,
  mentionerName: string,
  entityType: string,
  entityName: string,
  commentText: string,
  actionUrl: string
): Promise<void> {
  await sendNotification(
    userId,
    projectId,
    projectName,
    NotificationTypes.MENTION,
    'You Were Mentioned',
    `${mentionerName} mentioned you in ${entityType} "${entityName}"`,
    actionUrl,
    { entityType, entityName, mentionerName, commentText }
  );
}

/**
 * Notify about status change
 */
export async function notifyStatusChange(
  userId: string,
  projectId: string,
  projectName: string,
  entityType: string,
  entityName: string,
  oldStatus: string,
  newStatus: string,
  actionUrl: string
): Promise<void> {
  await sendNotification(
    userId,
    projectId,
    projectName,
    NotificationTypes.STATUS_CHANGE,
    'Status Changed',
    `${entityType} "${entityName}" status changed from ${oldStatus} to ${newStatus}`,
    actionUrl,
    { entityType, entityName, oldStatus, newStatus }
  );
}

/**
 * Get project team member IDs (excluding current user)
 */
export async function getProjectTeamMemberIds(projectId: string, excludeUserId?: string): Promise<string[]> {
  try {
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    
    const db = getFirestore(getApp());
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    
    if (!projectDoc.exists()) return [];
    
    const project = projectDoc.data();
    let memberIds: string[] = [];
    
    // Add client ID
    if (project.clientId) {
      memberIds.push(project.clientId);
    }
    
    // Add team member IDs if they exist
    if (project.teamMemberIds && Array.isArray(project.teamMemberIds)) {
      memberIds = [...memberIds, ...project.teamMemberIds];
    }
    
    // Remove duplicates and exclude user
    memberIds = [...new Set(memberIds)];
    if (excludeUserId) {
      memberIds = memberIds.filter(id => id !== excludeUserId);
    }
    
    return memberIds;
  } catch (error) {
    console.error('Failed to get project team members:', error);
    return [];
  }
}
