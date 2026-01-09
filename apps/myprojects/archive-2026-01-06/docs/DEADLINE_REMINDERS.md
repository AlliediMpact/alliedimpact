# Deadline Reminders Documentation

## Overview

The Deadline Reminders system helps teams stay on track by providing visual indicators, notifications, and a dashboard widget for items with upcoming or overdue deadlines.

## Features

- **Dashboard Widget**: Shows next 5 upcoming deadlines
- **Urgency Levels**: Color-coded indicators (overdue, critical, warning, normal)
- **Snooze Reminders**: Temporarily dismiss reminders (1h, 3h, 1d, 3d)
- **Deadline Badges**: Visual indicators on milestone and deliverable cards
- **Email Reminders**: Configurable email notifications (via Cloud Functions)
- **7-Day Lookahead**: Shows items due within the next week
- **Real-time Updates**: Automatically updates as deadlines approach

## Urgency Levels

| Level | Days Until Due | Color | Icon | Usage |
|-------|----------------|-------|------|-------|
| **Overdue** | < 0 (past due) | Red | AlertCircle | Immediate action required |
| **Critical** | 0 (due today) | Orange | AlertCircle | Due today, urgent |
| **Warning** | 1 (due tomorrow) | Yellow | AlertTriangle | Due soon, prepare |
| **Normal** | 2-7 days | Blue | Clock | Upcoming, not urgent |

## User Interface

### Dashboard Widget

**Location**: Main dashboard, after Recent Activity

**Components**:
- Widget title: "Upcoming Deadlines"
- Description: "Items due within the next 7 days"
- List of deadline items (max 5)
- Each item shows:
  - Urgency icon and color bar
  - Item name
  - Type (milestone/deliverable)
  - Project name (if multi-project view)
  - Deadline badge (e.g., "Due in 2 days")
  - Due date and time
  - Snooze options

### Deadline Item Card

**Layout**:
```
┌─────────────────────────────────────────┐
│ [Icon] Item Name        [Due in 2 days] │
│        Type • Project                    │
│        Due: Jan 15, 2026 at 5:00 PM     │
│        [Snooze] 1h 3h 1d 3d              │
└─────────────────────────────────────────┘
```

**Color Coding**:
- **Red**: Overdue items (past deadline)
- **Orange**: Due today
- **Yellow**: Due within 1 day
- **Blue**: Due within 2-7 days

### Deadline Badges

Small badges that appear on milestone and deliverable cards:

```tsx
<DeadlineBadge dueDate={item.dueDate} status={item.status} />
```

**Examples**:
- `🔴 3d overdue` - Red, overdue
- `🟠 Due today` - Orange, due today
- `🟡 2d left` - Yellow, due soon

## Developer Guide

### Using Upcoming Deadlines Widget

```typescript
import UpcomingDeadlines from '@/components/UpcomingDeadlines';

// Dashboard usage
<UpcomingDeadlines 
  projectId={selectedProject.id} 
  maxItems={5} 
  showSnooze={true} 
/>

// All projects view
<UpcomingDeadlines 
  maxItems={10} 
  showSnooze={false} 
/>
```

### Using Deadline Badge

```typescript
import { DeadlineBadge } from '@/components/UpcomingDeadlines';

// On milestone/deliverable card
<DeadlineBadge 
  dueDate={milestone.dueDate} 
  status={milestone.status} 
/>
```

### Deadline Item Structure

```typescript
interface DeadlineItem {
  id: string;
  type: 'milestone' | 'deliverable';
  name: string;
  dueDate: Date;
  status: string;
  projectId: string;
  projectName: string;
  daysUntilDue: number;
  snoozedUntil?: Date;
}
```

## Snooze Functionality

### Snooze Durations

| Duration | Value | Use Case |
|----------|-------|----------|
| 1 hour | 3600000 ms | Quick postpone |
| 3 hours | 10800000 ms | Mid-day delay |
| 1 day | 86400000 ms | Delay to tomorrow |
| 3 days | 259200000 ms | Significant postpone |

### Implementation

```typescript
const snoozeDeadline = async (itemId: string, duration: number) => {
  const snoozedUntil = new Date(Date.now() + duration);
  
  await updateDoc(doc(db, collection, itemId), {
    snoozedUntil: Timestamp.fromDate(snoozedUntil),
  });
  
  // Remove from current list
  setItems(items.filter(i => i.id !== itemId));
};
```

### Filtering Snoozed Items

```typescript
// When loading deadlines, filter out snoozed items
const now = new Date();
const filteredItems = allItems.filter(item => {
  if (!item.snoozedUntil) return true;
  return item.snoozedUntil <= now; // Show if snooze expired
});
```

## Email Notifications

### Cloud Function Implementation

```typescript
// functions/src/deadlineReminders.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const checkDeadlines = functions.pubsub
  .schedule('0 9 * * *') // Run daily at 9 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const threeDaysFromNow = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    );

    // Find milestones due in 3 days
    const milestones = await admin.firestore()
      .collection('milestones')
      .where('status', '!=', 'completed')
      .where('dueDate', '<=', threeDaysFromNow)
      .where('dueDate', '>=', now)
      .get();

    for (const doc of milestones.docs) {
      const milestone = doc.data();
      const daysUntilDue = Math.ceil(
        (milestone.dueDate.toDate().getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );

      // Send notification
      await notifyUpcomingDeadline(
        milestone.assignedUserId,
        milestone.projectId,
        milestone.projectName,
        'milestone',
        milestone.name,
        daysUntilDue,
        `/milestones#${doc.id}`
      );

      // Send email if user has email notifications enabled
      const userPrefs = await getUserNotificationPreferences(milestone.assignedUserId);
      if (userPrefs.emailEnabled && userPrefs.deadlineReminders) {
        await sendDeadlineEmail(milestone, daysUntilDue);
      }
    }
  });
```

### Email Template

```typescript
async function sendDeadlineEmail(item: any, daysUntilDue: number) {
  const urgency = daysUntilDue === 0 ? 'TODAY' : 
                  daysUntilDue === 1 ? 'TOMORROW' : 
                  `in ${daysUntilDue} days`;
  
  await sendEmail({
    to: item.userEmail,
    subject: `⏰ Deadline Reminder: ${item.name} due ${urgency}`,
    html: `
      <h2>Deadline Reminder</h2>
      <p>This is a reminder that <strong>${item.name}</strong> is due ${urgency}.</p>
      <p><strong>Project:</strong> ${item.projectName}</p>
      <p><strong>Due Date:</strong> ${item.dueDate.toDate().toLocaleDateString()}</p>
      <p><a href="${process.env.APP_URL}/${item.type}s">View ${item.type}</a></p>
    `,
  });
}
```

## Integration with Other Features

### Milestone Cards

Add deadline badge to milestone cards:

```typescript
import { DeadlineBadge } from '@/components/UpcomingDeadlines';

<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>{milestone.name}</CardTitle>
      <DeadlineBadge dueDate={milestone.dueDate} status={milestone.status} />
    </div>
  </CardHeader>
</Card>
```

### Deliverable Cards

Same pattern for deliverable cards:

```typescript
<DeadlineBadge dueDate={deliverable.dueDate} status={deliverable.status} />
```

### Notification Integration

When deadline approaches, send notification:

```typescript
import { notifyUpcomingDeadline } from '@/lib/notification-helpers';

// In Cloud Function or scheduled task
await notifyUpcomingDeadline(
  userId,
  projectId,
  projectName,
  'milestone',
  milestoneName,
  daysLeft,
  `/milestones#${milestoneId}`
);
```

## Visual Design

### Color System

```css
/* Overdue - Red */
.deadline-overdue {
  border-left: 4px solid #dc2626;
  background: #fef2f2;
}

/* Critical - Orange */
.deadline-critical {
  border-left: 4px solid #ea580c;
  background: #fff7ed;
}

/* Warning - Yellow */
.deadline-warning {
  border-left: 4px solid #ca8a04;
  background: #fefce8;
}

/* Normal - Blue */
.deadline-normal {
  border-left: 4px solid #2563eb;
  background: #eff6ff;
}
```

### Icons

- **Overdue/Critical**: `AlertCircle` (red/orange)
- **Warning**: `AlertTriangle` (yellow)
- **Normal**: `Clock` (blue)

## Performance Considerations

### Query Optimization

```typescript
// Only query items due within 7 days
const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const query = firestore
  .collection('milestones')
  .where('dueDate', '<=', sevenDaysFromNow)
  .where('status', '!=', 'completed')
  .orderBy('dueDate', 'asc')
  .limit(maxItems);
```

### Caching

```typescript
// Cache deadline calculations
const [cachedDeadlines, setCachedDeadlines] = useState<Map<string, number>>(new Map());

const getDaysUntilDue = (itemId: string, dueDate: Date): number => {
  if (cachedDeadlines.has(itemId)) {
    return cachedDeadlines.get(itemId)!;
  }
  
  const days = Math.ceil((dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  setCachedDeadlines(new Map(cachedDeadlines.set(itemId, days)));
  return days;
};
```

## Best Practices

1. **Set Realistic Deadlines**: Add buffer time for reviews/approvals
2. **Daily Check**: Review upcoming deadlines each morning
3. **Snooze Wisely**: Don't snooze overdue items
4. **Email Reminders**: Enable for critical deadlines
5. **Team Visibility**: Share deadline status in standup meetings
6. **Update Status**: Mark completed items promptly to clear list
7. **Escalate Risks**: Notify PM/client if deadline at risk

## Future Enhancements

- [ ] Recurring deadlines
- [ ] Deadline templates
- [ ] Auto-extension requests
- [ ] Slack/Teams integration for reminders
- [ ] Deadline analytics (on-time rate, average delay)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Workload balancing (adjust deadlines based on capacity)
- [ ] Deadline dependencies (cascade delays)
- [ ] Custom reminder schedules (7d, 3d, 1d, 1h before)
- [ ] SMS reminders for critical deadlines
- [ ] Deadline heatmap visualization
- [ ] Auto-reassign if overdue

## Testing

### Manual Testing

1. **Create Item with Deadline**
   - Create milestone with due date in 2 days
   - Verify appears in widget
   - Check correct urgency color

2. **Test Snooze**
   - Click snooze on deadline item
   - Select duration (e.g., 1 hour)
   - Verify item disappears
   - Wait for snooze to expire
   - Verify item reappears

3. **Check Urgency Levels**
   - Create items with various due dates
   - Overdue (past date)
   - Due today
   - Due tomorrow
   - Due in 3 days
   - Verify colors and icons

4. **Deadline Badge**
   - View milestone cards
   - Check badge appears if due soon
   - Verify hidden if completed

### Automated Testing

```typescript
describe('Deadline Reminders', () => {
  it('should calculate days until due correctly', () => {
    const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    expect(days).toBe(2);
  });

  it('should determine urgency level', () => {
    expect(getUrgencyLevel(-1)).toBe('overdue');
    expect(getUrgencyLevel(0)).toBe('critical');
    expect(getUrgencyLevel(1)).toBe('warning');
    expect(getUrgencyLevel(3)).toBe('normal');
  });

  it('should snooze deadline', async () => {
    await snoozeDeadline('milestone-123', 3600000); // 1 hour
    const milestone = await getMilestone('milestone-123');
    expect(milestone.snoozedUntil).toBeDefined();
  });
});
```

## Troubleshooting

### Deadlines Not Showing
- Check due date is within 7 days
- Verify item status is not completed/approved
- Inspect Firestore query constraints
- Check snoozedUntil field

### Wrong Urgency Color
- Verify time zone settings
- Check date calculation logic
- Inspect browser time vs server time

### Snooze Not Working
- Check Firestore update permissions
- Verify snoozedUntil timestamp format
- Inspect filtering logic in query

### Email Reminders Not Sent
- Check Cloud Function deployed
- Verify schedule configuration
- Check user notification preferences
- Inspect function logs for errors
- Verify email service credentials
