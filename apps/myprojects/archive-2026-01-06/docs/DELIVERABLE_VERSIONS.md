# Deliverable Versions Documentation

## Overview

The Deliverable Versions system provides comprehensive version control for deliverables, allowing teams to track changes, compare versions, and rollback to previous states. This feature ensures accountability, enables collaboration, and maintains a complete audit trail of deliverable evolution.

## Features

### ✅ Version History
- Automatic version creation on save
- Version numbers (v1, v2, v3...)
- Version comments explaining changes
- Creator and timestamp tracking
- Timeline visualization

### ✅ Version Comparison
- Side-by-side comparison
- Unified diff view
- Visual diff highlighting
- Field-level change tracking
- File additions/removals

### ✅ Rollback Functionality
- Restore previous versions
- Permission-based access
- Confirmation dialogs
- Creates new version on rollback
- Preserves history

### ✅ Version Comments
- Mandatory comments on save
- Explains what changed and why
- Searchable history
- Communication tool

## Usage

### Creating a Version

When editing a deliverable, add a version comment:

```typescript
// In DeliverableModal
<div>
  <label>Version Comment</label>
  <input
    value={formData.versionComment}
    onChange={(e) => setFormData({ ...formData, versionComment: e.target.value })}
    placeholder="Describe what changed in this version..."
  />
</div>
```

### Viewing Version History

Click the "History" button on any deliverable:

```typescript
import VersionHistory from '@/components/VersionHistory';

<Button onClick={() => setShowVersionHistory(true)}>
  <History className="h-4 w-4 mr-2" />
  Version History
</Button>

{showVersionHistory && (
  <VersionHistory
    deliverableId={deliverable.id}
    deliverableName={deliverable.name}
    currentUserId={userId}
    currentUserName={userName}
    userRole={userRole}
    onClose={() => setShowVersionHistory(false)}
    onCompare={(v1, v2) => setShowVersionCompare({ v1, v2 })}
  />
)}
```

### Comparing Versions

Select two versions and click "Compare":

```typescript
import VersionCompare from '@/components/VersionCompare';

{showVersionCompare && (
  <VersionCompare
    deliverableId={deliverable.id}
    version1Number={showVersionCompare.v1}
    version2Number={showVersionCompare.v2}
    onClose={() => setShowVersionCompare(null)}
  />
)}
```

### Rolling Back

Click "Rollback" on any previous version:

```typescript
import { rollbackToVersion } from '@/lib/version-control';

await rollbackToVersion(
  deliverableId,
  versionNumber,
  userId,
  userName
);
```

## API Reference

### `createDeliverableVersion()`

Creates a new version of a deliverable.

```typescript
await createDeliverableVersion(
  deliverableId: string,
  currentData: any,
  userId: string,
  userName: string,
  versionComment: string
): Promise<number>
```

**Parameters**:
- `deliverableId`: ID of the deliverable
- `currentData`: Current deliverable data to save
- `userId`: User creating the version
- `userName`: User's display name
- `versionComment`: Description of changes

**Returns**: Version number created

### `getDeliverableVersions()`

Retrieves all versions of a deliverable.

```typescript
await getDeliverableVersions(
  deliverableId: string
): Promise<DeliverableVersion[]>
```

### `getDeliverableVersion()`

Gets a specific version.

```typescript
await getDeliverableVersion(
  deliverableId: string,
  versionNumber: number
): Promise<DeliverableVersion | null>
```

### `rollbackToVersion()`

Rolls back to a previous version.

```typescript
await rollbackToVersion(
  deliverableId: string,
  versionNumber: number,
  userId: string,
  userName: string
): Promise<void>
```

### `compareVersions()`

Compares two versions and returns differences.

```typescript
compareVersions(
  version1: DeliverableVersion,
  version2: DeliverableVersion
): VersionChange[]
```

### `getTextDiff()`

Gets line-by-line text differences.

```typescript
getTextDiff(
  oldText: string,
  newText: string
): {
  added: string[];
  removed: string[];
  unchanged: string[];
}
```

## Data Model

### DeliverableVersion Interface

```typescript
interface DeliverableVersion {
  id: string;              // Version ID (v1, v2, v3...)
  versionNumber: number;   // Numeric version
  name: string;            // Deliverable name at this version
  description: string;     // Description at this version
  notes: string;           // Notes at this version
  fileUrls: string[];      // Attached files
  createdAt: Date;         // When version was created
  createdBy: string;       // User ID who created
  createdByName: string;   // User's display name
  comment: string;         // Version comment
  status: string;          // Status at this version
  type: string;            // Type at this version
}
```

### VersionChange Interface

```typescript
interface VersionChange {
  field: string;                        // Field that changed
  oldValue: any;                        // Previous value
  newValue: any;                        // New value
  type: 'added' | 'removed' | 'modified';  // Change type
}
```

## Firestore Schema

### Deliverable Document

```javascript
{
  id: "deliverable_123",
  name: "UI Mockups",
  description: "<p>Current description</p>",
  notes: "<p>Current notes</p>",
  status: "in_progress",
  type: "design",
  fileUrls: ["url1", "url2"],
  currentVersion: 3,  // Latest version number
  versions: [         // Array of all versions
    {
      id: "v1",
      versionNumber: 1,
      name: "UI Mockups",
      description: "<p>Initial version</p>",
      notes: "",
      fileUrls: [],
      createdAt: Timestamp,
      createdBy: "user123",
      createdByName: "John Doe",
      comment: "Initial creation",
      status: "pending",
      type: "design"
    },
    {
      id: "v2",
      versionNumber: 2,
      name: "UI Mockups v2",
      description: "<p>Updated with feedback</p>",
      notes: "<p>Client requested changes</p>",
      fileUrls: ["url1"],
      createdAt: Timestamp,
      createdBy: "user123",
      createdByName: "John Doe",
      comment: "Incorporated client feedback",
      status: "in_progress",
      type: "design"
    },
    {
      id: "v3",
      versionNumber: 3,
      name: "UI Mockups",
      description: "<p>Current description</p>",
      notes: "<p>Current notes</p>",
      fileUrls: ["url1", "url2"],
      createdAt: Timestamp,
      createdBy: "user456",
      createdByName: "Jane Smith",
      comment: "Added additional mockup files",
      status: "in_progress",
      type: "design"
    }
  ],
  updatedAt: Timestamp,
  updatedBy: "user456"
}
```

## UI Components

### VersionHistory Component

**Features**:
- Timeline view of all versions
- Version selection (checkboxes)
- Compare button (when 2 selected)
- Rollback buttons
- Version metadata display
- Empty state handling

**Props**:
```typescript
interface VersionHistoryProps {
  deliverableId: string;
  deliverableName: string;
  currentUserId: string;
  currentUserName: string;
  userRole: string;
  onClose: () => void;
  onCompare?: (version1: number, version2: number) => void;
  onVersionSelect?: (version: DeliverableVersion) => void;
}
```

### VersionCompare Component

**Features**:
- Split view (side-by-side)
- Unified view (single column)
- Color-coded changes (green/red/blue)
- Field-level comparison
- Text diff visualization
- File change tracking

**Props**:
```typescript
interface VersionCompareProps {
  deliverableId: string;
  version1Number: number;
  version2Number: number;
  onClose: () => void;
}
```

## Permissions

### Role-Based Access

```typescript
function canRollback(userRole: string): boolean {
  const allowedRoles = ['admin', 'pm', 'developer'];
  return allowedRoles.includes(userRole.toLowerCase());
}
```

**Permissions**:
- **View History**: All users
- **Compare Versions**: All users
- **Rollback**: Admin, PM, Developer only
- **Create Version**: Users with edit access

## Best Practices

### 1. Version Comments

Always provide meaningful version comments:

**❌ Bad**:
- "Updated"
- "Changes"
- "v2"

**✅ Good**:
- "Added requirements section based on client meeting"
- "Fixed typos in acceptance criteria"
- "Incorporated feedback from design review"
- "Rollback to version 3 due to incorrect requirements"

### 2. When to Create Versions

Create a new version when:
- Making significant changes
- After review feedback
- Before major updates
- When changing status
- Adding/removing files

**Don't** create versions for:
- Minor typo fixes (unless important)
- Formatting changes only
- Test edits

### 3. Comparing Versions

Before rollback, always:
1. Compare current with target version
2. Review all changes
3. Confirm with team
4. Document rollback reason

### 4. Storage Considerations

- Versions stored as array in document
- Consider Firestore 1MB document limit
- Each version ~5-10KB
- Supports ~100-200 versions per deliverable
- Archive old versions if needed

## Examples

### Example 1: Creating Version on Edit

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (deliverable) {
    // Editing existing deliverable - create version
    await createDeliverableVersion(
      deliverable.id,
      formData,
      currentUserId,
      currentUserName,
      formData.versionComment || 'Updated deliverable'
    );
    
    // Update current data
    await updateDeliverable(deliverable.id, formData);
  } else {
    // Creating new deliverable
    await createDeliverable(formData);
  }
  
  onSuccess();
};
```

### Example 2: Viewing Version Timeline

```typescript
function DeliverableDetail({ deliverable }: Props) {
  const [showHistory, setShowHistory] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setShowHistory(true)}>
        <History className="h-4 w-4 mr-2" />
        Version History ({deliverable.currentVersion || 1})
      </Button>
      
      {showHistory && (
        <VersionHistory
          deliverableId={deliverable.id}
          deliverableName={deliverable.name}
          currentUserId={user.id}
          currentUserName={user.name}
          userRole={user.role}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
```

### Example 3: Comparing Two Versions

```typescript
function VersionHistoryModal() {
  const [compareVersions, setCompareVersions] = useState<number[]>([]);
  
  const handleCompare = () => {
    if (compareVersions.length === 2) {
      const [v1, v2] = compareVersions.sort();
      // Open comparison modal
      setShowCompare({ v1, v2 });
    }
  };
  
  return (
    <div>
      {versions.map(v => (
        <div key={v.id}>
          <input
            type="checkbox"
            checked={compareVersions.includes(v.versionNumber)}
            onChange={() => toggleVersion(v.versionNumber)}
          />
          Version {v.versionNumber}
        </div>
      ))}
      
      {compareVersions.length === 2 && (
        <Button onClick={handleCompare}>
          Compare Selected
        </Button>
      )}
    </div>
  );
}
```

### Example 4: Rollback with Confirmation

```typescript
const handleRollback = async (versionNumber: number) => {
  // Check permission
  if (!canRollback(userRole)) {
    alert('Insufficient permissions');
    return;
  }
  
  // Confirm action
  const confirmed = confirm(
    `Rollback to version ${versionNumber}? This will create a new version with the old content.`
  );
  
  if (!confirmed) return;
  
  try {
    await rollbackToVersion(
      deliverableId,
      versionNumber,
      userId,
      userName
    );
    
    alert('Rollback successful');
    window.location.reload();
  } catch (error) {
    alert('Rollback failed: ' + error.message);
  }
};
```

## Troubleshooting

### Issue: Versions Not Saving

**Symptoms**: Version array empty or not updating

**Solutions**:
1. Check Firestore permissions
2. Verify `arrayUnion` is working
3. Ensure version data is complete
4. Check console for errors

### Issue: Rollback Not Working

**Symptoms**: Rollback button disabled or fails

**Solutions**:
1. Verify user has correct role
2. Check if version exists
3. Ensure deliverable ID is correct
4. Review Firestore security rules

### Issue: Version Comparison Shows No Changes

**Symptoms**: Comparison says "No changes detected"

**Solutions**:
1. Verify versions are different
2. Check field names match
3. Ensure HTML content differs
4. Review comparison logic

### Issue: Performance Slow with Many Versions

**Symptoms**: Loading versions takes long time

**Solutions**:
1. Implement pagination
2. Lazy load version details
3. Archive old versions
4. Use Firestore queries with limits

## Future Enhancements

- [ ] Version branching and merging
- [ ] Automated version creation on triggers
- [ ] Version export (PDF, JSON)
- [ ] Version annotations and highlights
- [ ] Approval workflow for versions
- [ ] Version-based notifications
- [ ] Graphical version tree
- [ ] AI-powered change summaries
- [ ] Conflict resolution for concurrent edits
- [ ] Version templates

## Related Features

- **Activity Feed**: Log version creation events
- **Notifications**: Notify on rollbacks
- **Team Management**: Role-based version access
- **File Preview**: View files from specific versions
- **Search**: Search within version history

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
