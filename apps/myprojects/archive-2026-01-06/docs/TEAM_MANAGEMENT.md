# Team Members Management Documentation

## Overview

The Team Members Management system enables project collaboration by allowing project owners and administrators to invite team members, assign roles, manage permissions, and track team activity.

## Features

- **Team Member List**: View all project team members with avatars
- **Role Assignment**: 6 role types with color-coded badges
- **Permission Management**: Granular permission control per member
- **Add/Remove Members**: Invite by email, remove members
- **Activity Tracking**: View activity count per member
- **@Mentions**: Mention team members in comments with autocomplete
- **Member Search**: Find members by name or email

## User Roles

| Role | Badge Color | Typical Permissions | Use Case |
|------|-------------|---------------------|----------|
| **Client** | Purple | View-only, comment, approve deliverables | Project stakeholders |
| **Developer** | Blue | Full access except team management | Engineering team |
| **Designer** | Pink | Create/edit deliverables, milestones | Design team |
| **Project Manager** | Green | Full access including team management | PM, Team leads |
| **QA Engineer** | Orange | Ticket management, testing | Quality assurance |
| **Admin** | Red | All permissions | System administrators |

## Permissions

Each team member can have the following permissions:

- **Can Edit Milestones**: Create, update, and complete milestones
- **Can Approve Deliverables**: Approve or request revisions for deliverables
- **Can Manage Tickets**: Create, assign, and resolve support tickets
- **Can Manage Team**: Add/remove team members, change roles and permissions

## User Interface

### Team Page

Navigate to **Team** in the sidebar to access team management.

**Components**:
- Team member count header
- "Add Member" button
- Grid of member cards showing:
  - Avatar (or initials if no photo)
  - Name and email
  - Role badge
  - Permission badges
  - Added date
  - "View Activity" link
  - Remove button (for admins)

### Add Member Modal

**Fields**:
1. **Email Address**: User's email (must be registered)
2. **Role**: Select from 6 role types
3. **Permissions**: 4 checkboxes for granular permissions

**Validation**:
- Email must exist in users collection
- User cannot already be a team member
- Must be logged in to add members

### Member Cards

Each card displays:
- **Avatar**: Photo or initials in colored circle
- **Name**: Display name
- **Email**: Contact email with mail icon
- **Role Badge**: Color-coded role label
- **Permission Badges**: Active permissions shown
- **Meta**: Added date and activity link
- **Remove Button**: Delete icon (hidden for current user)

## Developer Guide

### Using Team Members Manager

```typescript
import TeamMembersManager from '@/components/TeamMembersManager';

// In your component
<TeamMembersManager projectId={project.id} />
```

### Team Member Structure

```typescript
interface TeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: 'client' | 'developer' | 'designer' | 'pm' | 'qa' | 'admin';
  addedAt: Date;
  addedBy: string;
  permissions: {
    canEditMilestones: boolean;
    canApproveDeliverables: boolean;
    canManageTickets: boolean;
    canManageTeam: boolean;
  };
}
```

### Firestore Structure

```
projectMembers/
  {memberId}/
    projectId: string
    userId: string
    userName: string
    userEmail: string
    userAvatar: string
    role: string
    permissions: {
      canEditMilestones: boolean
      canApproveDeliverables: boolean
      canManageTickets: boolean
      canManageTeam: boolean
    }
    addedBy: string
    addedAt: timestamp
```

### Security Rules

```javascript
match /projectMembers/{memberId} {
  // Anyone can read team members of their projects
  allow read: if request.auth != null;
  
  // Only admins can add team members
  allow create: if request.auth != null && 
    hasTeamManagePermission(request.resource.data.projectId);
  
  // Only admins can remove team members
  allow delete: if request.auth != null && 
    hasTeamManagePermission(resource.data.projectId);
  
  // Can update own role/permissions if admin
  allow update: if request.auth != null && 
    hasTeamManagePermission(resource.data.projectId);
}

function hasTeamManagePermission(projectId) {
  let member = getTeamMember(projectId, request.auth.uid);
  return member != null && member.permissions.canManageTeam == true;
}
```

## @Mention System

### MentionInput Component

Use the `MentionInput` component for comments and text fields that support mentions:

```typescript
import MentionInput from '@/components/MentionInput';

const [comment, setComment] = useState('');

<MentionInput
  projectId={projectId}
  value={comment}
  onChange={setComment}
  placeholder="Type @ to mention someone..."
  rows={4}
/>
```

### Features

- **@ Trigger**: Type `@` to show team member suggestions
- **Autocomplete**: Filter by name or email as you type
- **Keyboard Navigation**: Arrow keys to select, Enter/Tab to insert
- **Smart Filtering**: Closes on space or newline after @
- **Visual Feedback**: Highlights selected suggestion

### Extract Mentions

```typescript
import { extractMentions, isUserMentioned } from '@/components/MentionInput';

// Get all mentions from text
const mentions = extractMentions(comment);
// Returns: ["John Doe", "Jane Smith"]

// Check if specific user is mentioned
if (isUserMentioned(comment, currentUser.name)) {
  // Send notification to user
}
```

### Mention Notifications

When a comment with mentions is posted:

```typescript
import { notifyMention } from '@/lib/notification-helpers';

// After posting comment
const mentions = extractMentions(commentText);
const teamMembers = await getTeamMembersForMentions(projectId);

for (const mentionName of mentions) {
  const member = teamMembers.find(m => 
    m.name.toLowerCase() === mentionName.toLowerCase()
  );
  
  if (member) {
    await notifyMention(
      member.id,
      projectId,
      projectName,
      currentUserName,
      'ticket',
      ticketTitle,
      commentText,
      `/tickets/${ticketId}`
    );
  }
}
```

## Permission Checks

### Client-Side

```typescript
// Check if current user can edit milestones
function canEditMilestones(projectId: string, userId: string): Promise<boolean> {
  const member = await getProjectMember(projectId, userId);
  return member?.permissions.canEditMilestones || false;
}

// Usage
if (await canEditMilestones(projectId, currentUser.uid)) {
  // Show edit button
}
```

### Server-Side (Cloud Functions)

```typescript
// Verify permission before action
export const updateMilestone = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new Error('Not authenticated');
  
  const member = await getProjectMember(data.projectId, context.auth.uid);
  if (!member?.permissions.canEditMilestones) {
    throw new Error('Permission denied');
  }
  
  // Proceed with update
});
```

## Integration with Other Features

### Ticket Assignment

```typescript
import { getTeamMembersForMentions } from '@/components/TeamMembersManager';
import { notifyAssignment } from '@/lib/notification-helpers';

// Get team members for assignment dropdown
const members = await getTeamMembersForMentions(projectId);

// After assigning ticket
await notifyAssignment(
  assignedUserId,
  projectId,
  projectName,
  'ticket',
  ticketTitle,
  currentUserName,
  `/tickets/${ticketId}`
);
```

### Activity Feed

Team member names are displayed in activity events:

```typescript
// Activity automatically shows team member who performed action
{
  userName: "John Doe",
  userAvatar: "https://...",
  action: "completed milestone"
}
```

### Comments

Use MentionInput for all comment fields:

```typescript
<MentionInput
  projectId={projectId}
  value={newComment}
  onChange={setNewComment}
  placeholder="Add a comment... (use @ to mention team members)"
/>
```

## Best Practices

1. **Least Privilege**: Assign minimum necessary permissions
2. **Role-Based**: Use roles as templates, adjust permissions as needed
3. **Client Access**: Give clients view and comment permissions only
4. **PM Full Access**: Project Managers should have team management permissions
5. **Remove Inactive**: Remove team members who leave the project
6. **Audit Trail**: Activity feed tracks all team member actions
7. **Mentions**: Encourage @mentions for important updates

## Future Enhancements

- [ ] Bulk permission updates
- [ ] Team member groups/departments
- [ ] Custom role creation
- [ ] Team activity dashboard
- [ ] Member onboarding checklist
- [ ] Role-based email digests
- [ ] Member availability status
- [ ] Team chat/messaging
- [ ] Workload balancing
- [ ] Performance metrics per member

## Testing

### Manual Testing

1. **Add Team Member**
   - Click "Add Member"
   - Enter existing user email
   - Select role and permissions
   - Verify member appears in list
   - Check role badge color
   - Verify permissions badges

2. **Remove Team Member**
   - Click delete icon
   - Confirm removal
   - Verify member removed from list
   - Check cannot remove self

3. **@Mentions**
   - Open comment field
   - Type `@`
   - Verify suggestions appear
   - Type to filter suggestions
   - Use arrow keys to navigate
   - Press Enter to insert
   - Verify mention appears in text

4. **Permission Checks**
   - Login as member with limited permissions
   - Verify restricted actions hidden/disabled
   - Login as admin
   - Verify all actions available

### Automated Testing

```typescript
describe('Team Management', () => {
  it('should add team member', async () => {
    await addTeamMember(projectId, userEmail, 'developer', permissions);
    const members = await getProjectMembers(projectId);
    expect(members).toContainEqual(
      expect.objectContaining({
        userEmail,
        role: 'developer'
      })
    );
  });

  it('should extract mentions from text', () => {
    const text = 'Hey @John Doe, can you review @Jane Smith feedback?';
    const mentions = extractMentions(text);
    expect(mentions).toEqual(['John Doe', 'Jane Smith']);
  });
});
```

## Troubleshooting

### Member Not Found
- Verify user has signed up
- Check email is correct
- Ensure user exists in users collection

### Cannot Remove Member
- Check you're not trying to remove yourself
- Verify you have team management permission
- Check Firestore security rules

### Mentions Not Working
- Verify team members loaded
- Check MentionInput component is used
- Ensure @ symbol triggers suggestions
- Check keyboard event handlers

### Permission Denied
- Verify user is team member
- Check permissions object
- Confirm Firestore rules allow operation
- Check client and server-side permission checks match
