# Notifications System Documentation

## Overview

The Notifications System provides real-time in-app notifications for important project events, helping team members stay informed about updates, deadlines, and mentions.

## Features

- **Real-time Notifications**: Instant notification delivery with live updates
- **Unread Badge**: Visual indicator showing unread notification count
- **Notification Panel**: Slide-out panel with all notifications
- **Filtering**: Filter by All/Unread notifications
- **Mark as Read**: Individual and bulk mark-as-read functionality
- **Delete Notifications**: Remove unwanted notifications
- **Action URLs**: Click notifications to navigate to related content
- **Email Integration**: Notification preferences configured in Settings

## Notification Types

| Type | Description | Trigger |
|------|-------------|---------|
| `comment` | New comment added | Someone comments on an item you're involved with |
| `approval` | Deliverable approved | Your deliverable is approved |
| `milestone` | Milestone updates | Milestone completed or updated |
| `deadline` | Deadline reminders | Item due soon or overdue |
| `status_change` | Status transitions | Item status changes |
| `assignment` | Task assignments | You're assigned to an item |
| `mention` | User mentions | Someone mentions you with @username |

## User Interface

### Notification Bell

- Located in the app header (top right)
- Red badge shows unread count
- Click to open notifications panel

### Notifications Panel

- Slide-out panel from right side
- Shows all notifications in reverse chronological order
- Unread notifications have accent background and blue dot indicator
- Each notification shows:
  - Title
  - Message
  - Relative timestamp ("2h ago")
  - Action buttons (mark read, delete)

### Notification Actions

- **Click notification**: Navigate to related content and mark as read
- **Mark as read icon**: Mark single notification as read
- **Mark all read**: Mark all unread notifications as read (top bar)
- **Delete icon**: Delete individual notification
- **Filter tabs**: Switch between All and Unread views

## Developer Guide

### Sending Notifications

Use helper functions from `lib/notification-helpers.ts`:

```typescript
import { 
  notifyNewComment,
  notifyDeliverableApproval,
  notifyMilestoneCompleted,
  notifyUpcomingDeadline,
  notifyAssignment,
  notifyMention,
  notifyStatusChange
} from '@/lib/notification-helpers';

// Notify about new comment
await notifyNewComment(
  userId, // recipient
  projectId,
  projectName,
  'John Doe', // commenter
  'ticket',
  'Bug in login page',
  'I can reproduce this issue',
  '/tickets/123' // action URL
);

// Notify team about milestone completion
const teamMemberIds = await getProjectTeamMemberIds(projectId);
await notifyMilestoneCompleted(
  teamMemberIds,
  projectId,
  projectName,
  'MVP Launch',
  '/milestones/456'
);

// Notify about upcoming deadline
await notifyUpcomingDeadline(
  userId,
  projectId,
  projectName,
  'Deliverable',
  'Homepage Design',
  2, // days left
  '/deliverables/789'
);

// Notify about assignment
await notifyAssignment(
  userId,
  projectId,
  projectName,
  'ticket',
  'Fix navigation bug',
  'Jane Smith', // assigner
  '/tickets/321'
);
```

### Notification Structure

```typescript
interface Notification {
  id: string;
  userId: string; // recipient
  projectId: string;
  projectName: string;
  type: 'comment' | 'approval' | 'milestone' | 'deadline' | 'status_change' | 'assignment' | 'mention';
  title: string; // "New Comment", "Milestone Completed", etc.
  message: string; // detailed message
  read: boolean;
  actionUrl?: string; // where to navigate when clicked
  createdAt: Date;
  metadata?: {
    entityId?: string;
    entityType?: string;
    [key: string]: any;
  };
}
```

### Firestore Structure

```
notifications/
  {notificationId}/
    userId: string
    projectId: string
    projectName: string
    type: string
    title: string
    message: string
    read: boolean
    actionUrl: string
    metadata: object
    createdAt: timestamp
```

### Security Rules

```javascript
match /notifications/{notificationId} {
  // Users can only read their own notifications
  allow read: if request.auth != null && 
    resource.data.userId == request.auth.uid;
  
  // Authenticated users can create notifications
  allow create: if request.auth != null;
  
  // Users can update (mark read) and delete their own notifications
  allow update, delete: if request.auth != null && 
    resource.data.userId == request.auth.uid;
}
```

## Integration Points

### Comments
When a comment is added:
```typescript
// After adding comment
await notifyNewComment(
  entityOwnerId,
  projectId,
  projectName,
  currentUserName,
  'ticket',
  ticketTitle,
  commentText,
  `/tickets/${ticketId}`
);

// Check for mentions
const mentions = extractMentions(commentText); // Parse @username
for (const mentionedUserId of mentions) {
  await notifyMention(
    mentionedUserId,
    projectId,
    projectName,
    currentUserName,
    'ticket',
    ticketTitle,
    commentText,
    `/tickets/${ticketId}`
  );
}
```

### Deliverable Approval
```typescript
// When deliverable is approved
await notifyDeliverableApproval(
  deliverable.uploadedBy,
  projectId,
  projectName,
  deliverable.name,
  currentUserName,
  `/deliverables/${deliverable.id}`
);
```

### Deadline Reminders
Set up a scheduled function (Cloud Function or cron job):
```typescript
// Run daily
async function checkDeadlines() {
  const upcomingDeadlines = await getItemsDueSoon(3); // 3 days
  
  for (const item of upcomingDeadlines) {
    await notifyUpcomingDeadline(
      item.assignedUserId,
      item.projectId,
      item.projectName,
      item.type,
      item.name,
      item.daysUntilDue,
      `/${item.type}s/${item.id}`
    );
  }
}
```

### Status Changes
```typescript
// When status changes
await notifyStatusChange(
  userId,
  projectId,
  projectName,
  'milestone',
  milestoneName,
  'in_progress',
  'completed',
  `/milestones/${milestoneId}`
);
```

## Email Notifications

Email preferences are managed in [Settings > Notifications](../app/settings/notifications/page.tsx):

- **Email Frequency**: Instant, Hourly Digest, Daily Digest
- **Event Types**: Comments, Approvals, Mentions, Deadlines, Status Changes
- **Email Delivery**: Configure via Firebase Cloud Functions (not yet implemented)

### Implementing Email Delivery

1. **Create Cloud Function**:
```typescript
// functions/src/notifications.ts
export const sendNotificationEmail = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const userPrefs = await getUserNotificationPreferences(notification.userId);
    
    if (userPrefs.emailEnabled && shouldSendEmail(userPrefs, notification.type)) {
      await sendEmail({
        to: notification.userEmail,
        subject: notification.title,
        body: notification.message,
        actionUrl: notification.actionUrl
      });
    }
  });
```

2. **Use Email Service** (SendGrid, AWS SES, etc.)

3. **Digest Emails**: Aggregate notifications and send on schedule

## Performance Considerations

- Notifications query limited to 50 most recent
- Real-time listener only for current user's notifications
- Unread count uses separate optimized query
- Failed notification delivery doesn't break main flow
- Notification creation is non-blocking (fire-and-forget)

## Best Practices

1. **Don't Over-Notify**: Only send notifications for important events
2. **Actionable Messages**: Include clear call-to-action and navigation
3. **Exclude Current User**: Don't notify user about their own actions
4. **Batch Notifications**: Use `sendNotificationToMultiple()` for team notifications
5. **Error Handling**: Notification failures should be logged but not block operations
6. **Rate Limiting**: Prevent notification spam with throttling

## Future Enhancements

- [ ] Push notifications (browser, mobile)
- [ ] Notification preferences per project
- [ ] Snooze notifications
- [ ] Notification grouping (collapse similar notifications)
- [ ] Custom notification sounds
- [ ] Desktop notifications API
- [ ] Notification analytics
- [ ] Smart notification timing
- [ ] @mention autocomplete
- [ ] Notification templates

## Testing

### Manual Testing

1. **Create Notification**
   - Add comment on ticket
   - Verify notification appears in panel
   - Check unread badge increments

2. **Mark as Read**
   - Click notification
   - Verify it navigates to correct page
   - Check notification marked as read
   - Verify badge count decrements

3. **Delete Notification**
   - Click delete icon
   - Verify notification removed
   - Check badge count updates

4. **Filter Notifications**
   - Switch to "Unread" tab
   - Verify only unread shown
   - Mark all as read
   - Verify "Unread" tab empty

5. **Real-time Updates**
   - Open app in two tabs
   - Create notification trigger in tab 1
   - Verify notification appears in tab 2

### Automated Testing

```typescript
describe('Notifications System', () => {
  it('should create notification for new comment', async () => {
    await notifyNewComment(userId, projectId, projectName, 'John', 'ticket', 'Test', 'Comment text', '/tickets/1');
    const notifications = await getNotifications(userId);
    expect(notifications[0]).toMatchObject({
      type: 'comment',
      title: 'New Comment',
      read: false
    });
  });

  it('should mark notification as read', async () => {
    const notifId = await createTestNotification();
    await markNotificationAsRead(notifId);
    const notif = await getNotification(notifId);
    expect(notif.read).toBe(true);
  });
});
```

## Troubleshooting

### Notifications Not Appearing
- Check Firestore rules allow read access
- Verify user is authenticated
- Check userId matches in notification document
- Inspect browser console for errors

### Unread Count Incorrect
- Check Firestore query for unread notifications
- Verify listener is active
- Check for duplicate listeners

### Navigation Not Working
- Verify actionUrl is correct
- Check router is configured properly
- Ensure pages/routes exist

### Email Notifications Not Sending
- Check Cloud Functions deployed
- Verify email service credentials
- Check user email preferences
- Inspect function logs for errors
