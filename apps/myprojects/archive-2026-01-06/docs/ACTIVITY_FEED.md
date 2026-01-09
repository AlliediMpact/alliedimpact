# Activity Feed Documentation

## Overview

The Activity Feed feature provides a real-time chronological timeline of all actions and events within a project. It helps teams stay informed about project updates and maintains a complete audit trail of all activities.

## Features

- **Real-time Updates**: Activity feed updates automatically as events occur
- **Filtering**: Filter activities by type (milestones, deliverables, tickets, comments, etc.)
- **Export**: Export activity log to CSV for reporting and compliance
- **Dashboard Widget**: Recent activity widget on the main dashboard
- **Grouped by Date**: Activities are grouped by date for better readability
- **Relative Timestamps**: Shows "2h ago", "Yesterday", etc.

## Activity Types

| Type | Description | Icon |
|------|-------------|------|
| `milestone` | Milestone creation, updates, completion | Flag (Purple) |
| `deliverable` | Deliverable uploads, approvals, revisions | Package (Blue) |
| `ticket` | Ticket creation, resolution, closure | Message Square (Orange) |
| `comment` | Comments on any entity | Message Square (Gray) |
| `status_change` | Status transitions | Check Circle (Green) |
| `file_upload` | File uploads | File Text (Indigo) |
| `team` | Team member additions/removals | Users |

## Usage

### Viewing Activity Feed

1. Navigate to **Activity** in the sidebar
2. View chronological timeline of all project activities
3. Use filters to narrow down by activity type
4. Export activities to CSV using the Export button

### Dashboard Widget

The dashboard displays the last 10 activities in a compact widget with a "View All" link.

## Developer Guide

### Logging Activities

Use the helper functions from `lib/activity-logger.ts`:

```typescript
import { 
  logMilestoneActivity, 
  logDeliverableActivity,
  logTicketActivity,
  logCommentActivity,
  logStatusChange,
  logFileUpload,
  ActivityActions
} from '@/lib/activity-logger';

// Log milestone creation
await logMilestoneActivity(
  projectId,
  milestone.id,
  milestone.name,
  ActivityActions.CREATED
);

// Log status change
await logStatusChange(
  projectId,
  deliverable.id,
  deliverable.name,
  'deliverable',
  'pending',
  'approved'
);

// Log comment
await logCommentActivity(
  projectId,
  ticket.id,
  ticket.title,
  'This looks great!'
);

// Log file upload
await logFileUpload(
  projectId,
  deliverable.id,
  deliverable.name,
  3 // number of files
);
```

### Activity Event Structure

```typescript
interface ActivityEvent {
  id: string;
  type: 'milestone' | 'deliverable' | 'ticket' | 'comment' | 'status_change' | 'file_upload' | 'team';
  action: string; // 'created', 'updated', 'completed', 'approved', etc.
  entityId: string; // ID of the related entity
  entityName: string; // Display name of the entity
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    fileCount?: number;
    commentText?: string;
    [key: string]: any;
  };
}
```

### Firestore Structure

```
activities/
  {activityId}/
    projectId: string
    type: string
    action: string
    entityId: string
    entityName: string
    userId: string
    userName: string
    userAvatar?: string
    timestamp: timestamp
    metadata: object
```

### Security Rules

Activities can only be created by authenticated users and read by project members:

```javascript
match /activities/{activityId} {
  allow read: if request.auth != null && 
    resource.data.projectId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.projectIds;
  allow create: if request.auth != null;
  allow update, delete: if false; // Activities are immutable
}
```

## Integration Points

### Milestone Manager
- Create milestone → log activity
- Update milestone → log activity
- Complete milestone → log activity

### Deliverable Manager
- Upload deliverable → log activity + file upload
- Approve deliverable → log activity
- Request revision → log activity
- Status change → log status change activity

### Ticket Manager
- Create ticket → log activity
- Update ticket status → log status change activity
- Close/resolve ticket → log activity
- Add comment → log comment activity

### File Uploads
- Any file upload triggers activity logging with file count

## Performance Considerations

- Activities are loaded with pagination (default 50 items)
- Real-time listener uses `limit()` to prevent over-fetching
- Activities are ordered by timestamp descending (newest first)
- Failed activity logging doesn't break the main application flow

## Future Enhancements

- [ ] User mentions (@username) in activities
- [ ] Activity notifications (bell icon integration)
- [ ] Activity search functionality
- [ ] More granular filtering (by user, date range)
- [ ] Activity analytics and insights
- [ ] Webhooks for activity events
- [ ] Activity digest emails

## Testing

### Manual Testing

1. **Create Milestone**
   - Create a new milestone
   - Check Activity page shows "created milestone" event
   - Verify correct timestamp and user

2. **Update Status**
   - Change deliverable status from Pending → Approved
   - Check Activity shows status change with old/new values

3. **Filter Activities**
   - Apply filters for specific activity types
   - Verify correct activities shown
   - Clear filters and verify all activities return

4. **Export Activities**
   - Click Export button
   - Verify CSV file downloads with correct data

5. **Real-time Updates**
   - Open Activity page in two browser tabs
   - Create activity in one tab
   - Verify it appears in the other tab without refresh

### Automated Testing

```typescript
// Example test case
describe('Activity Feed', () => {
  it('should log milestone creation activity', async () => {
    const milestone = await createMilestone({ name: 'Test' });
    const activities = await getActivities(projectId);
    expect(activities[0]).toMatchObject({
      type: 'milestone',
      action: 'created',
      entityName: 'Test'
    });
  });
});
```

## Troubleshooting

### Activities Not Showing
- Check Firestore rules allow read access
- Verify user is authenticated
- Check browser console for errors
- Confirm `projectId` matches selected project

### Real-time Not Working
- Check Firestore connection
- Verify listener is properly set up
- Check for JavaScript errors in console

### Export Not Working
- Check browser allows downloads
- Verify activities data is loaded
- Check for CSV generation errors in console
