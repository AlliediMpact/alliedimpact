# Milestone Dependencies Documentation

## Overview

The Milestone Dependencies system enables teams to define relationships between milestones, visualize dependency flows, automatically cascade date changes, identify critical paths, and prevent circular dependencies. This feature ensures proper project sequencing and intelligent schedule management.

## Features

### ✅ Dependency Management
- Link milestones with predecessor/successor relationships
- Finish-to-start, start-to-start, finish-to-finish, start-to-finish
- Lag time support (positive delay or negative lead)
- Easy add/remove dependencies

### ✅ Circular Dependency Prevention
- Automatic cycle detection
- Prevents invalid relationships
- Clear error messages
- Maintains graph integrity

### ✅ Visual Dependency Graph
- Level-based layout (topological sort)
- Color-coded critical path
- Interactive milestone cards
- Dependency flow visualization
- Slack time display

### ✅ Critical Path Analysis
- Forward/backward pass calculation
- Slack time computation
- Critical path highlighting (orange)
- Zero-slack identification
- Project timeline optimization

### ✅ Auto-Cascading Dates
- Automatic date propagation
- Respects dependency relationships
- Recursive updates
- Duration preservation
- Smart scheduling

### ✅ Dependency Suggestions
- AI-powered recommendations
- Date-based suggestions
- Keyword analysis (design → develop → test)
- Confidence scoring
- One-click application

## Usage

### Adding Dependencies

```typescript
import { addMilestoneDependency } from '@/lib/dependency-manager';

await addMilestoneDependency(
  projectId,
  'milestone_design',    // Predecessor (must complete first)
  'Design Phase',
  'milestone_dev',       // Successor (depends on predecessor)
  'Development Phase',
  'finish-to-start',     // Dependency type
  0,                     // Lag days (0 = immediate start)
  userId
);
```

### Opening Dependency Graph

```typescript
import DependencyGraph from '@/components/DependencyGraph';

const [showGraph, setShowGraph] = useState(false);

<Button onClick={() => setShowGraph(true)}>
  <GitBranch className="h-4 w-4 mr-2" />
  Dependencies
</Button>

{showGraph && (
  <DependencyGraph
    projectId={project.id}
    milestones={milestones}
    currentUserId={userId}
    onClose={() => setShowGraph(false)}
    onRefresh={loadMilestones}
  />
)}
```

### Removing Dependencies

```typescript
import { removeMilestoneDependency } from '@/lib/dependency-manager';

await removeMilestoneDependency(
  'milestone_design',
  'milestone_dev'
);
```

### Building Dependency Graph

```typescript
import { buildDependencyGraph } from '@/lib/dependency-manager';

const nodes = await buildDependencyGraph(projectId, milestones);

// Each node contains:
// - milestone data
// - dependencies array
// - dependents array
// - level (depth in tree)
// - isOnCriticalPath boolean
// - earliestStart/earliestFinish dates
// - latestStart/latestFinish dates
// - slack (days of flexibility)
```

### Calculating Critical Path

```typescript
import { calculateCriticalPath } from '@/lib/dependency-manager';

const criticalPathNodeIds = calculateCriticalPath(graphNodes);

// Returns array of milestone IDs with zero slack
```

## API Reference

### `addMilestoneDependency()`

Creates a dependency link between two milestones.

```typescript
await addMilestoneDependency(
  projectId: string,
  fromMilestoneId: string,
  fromMilestoneName: string,
  toMilestoneId: string,
  toMilestoneName: string,
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish',
  lagDays: number,
  userId: string
): Promise<void>
```

**Checks**:
- Prevents self-dependency
- Detects circular dependencies
- Validates milestone existence

**Side Effects**:
- Updates both milestone documents
- Triggers date cascading
- Logs activity event

### `removeMilestoneDependency()`

Removes a dependency link.

```typescript
await removeMilestoneDependency(
  fromMilestoneId: string,
  toMilestoneId: string
): Promise<void>
```

### `checkCircularDependency()`

Checks if adding a dependency would create a cycle.

```typescript
const wouldCreateCycle = await checkCircularDependency(
  projectId: string,
  fromMilestoneId: string,
  toMilestoneId: string
): Promise<boolean>
```

**Algorithm**: Breadth-first search from `toMilestone` to see if `fromMilestone` is reachable.

### `buildDependencyGraph()`

Constructs a complete dependency graph with levels and critical path.

```typescript
const nodes = await buildDependencyGraph(
  projectId: string,
  milestones: Milestone[]
): Promise<DependencyGraphNode[]>
```

**Returns**: Array of nodes with:
- Topological levels
- Critical path markers
- Slack calculations
- Earliest/latest dates

### `calculateCriticalPath()`

Calculates the critical path using CPM (Critical Path Method).

```typescript
const criticalNodeIds = calculateCriticalPath(
  nodes: DependencyGraphNode[]
): string[]
```

**Algorithm**:
1. Forward pass: Calculate earliest start/finish
2. Backward pass: Calculate latest start/finish
3. Compute slack (latest - earliest)
4. Critical path = nodes with zero slack

### `cascadeDateChanges()`

Automatically updates dependent milestone dates when a predecessor changes.

```typescript
await cascadeDateChanges(
  projectId: string,
  changedMilestoneId: string
): Promise<void>
```

**Behavior**:
- Recursive propagation
- Preserves milestone duration
- Only pushes dates forward (no automatic pull-back)
- Marks milestones as auto-updated

### `suggestDependencies()`

Generates intelligent dependency suggestions.

```typescript
const suggestions = suggestDependencies(
  milestones: Milestone[]
): Array<{
  from: Milestone;
  to: Milestone;
  reason: string;
  confidence: number;
}>
```

**Suggestion Logic**:
- **Date proximity**: Milestones ending within 30 days of another starting
- **Keyword sequences**: design → develop → test → deploy
- **Confidence scoring**: 0.0 to 1.0

## Data Model

### MilestoneDependency Interface

```typescript
interface MilestoneDependency {
  id: string;                    // "milestone_a_milestone_b"
  fromMilestoneId: string;       // Predecessor
  fromMilestoneName: string;
  toMilestoneId: string;         // Successor
  toMilestoneName: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lagDays?: number;              // Optional delay
  createdAt: Date;
  createdBy: string;
}
```

### DependencyGraphNode Interface

```typescript
interface DependencyGraphNode {
  id: string;
  name: string;
  milestone: Milestone;
  dependencies: string[];        // Predecessors
  dependents: string[];          // Successors
  level: number;                 // 0, 1, 2, 3... (topological depth)
  isOnCriticalPath: boolean;
  earliestStart: Date;
  earliestFinish: Date;
  latestStart: Date;
  latestFinish: Date;
  slack: number;                 // Days of flexibility
}
```

### Firestore Schema

```javascript
// Milestone document
{
  id: "milestone_123",
  name: "Development Phase",
  // ... other milestone fields
  
  // Dependency tracking
  dependencies: ["milestone_design", "milestone_planning"],  // Predecessors
  dependents: ["milestone_testing"],                         // Successors
  
  // Full dependency objects
  dependencyDetails: [
    {
      id: "milestone_design_milestone_123",
      fromMilestoneId: "milestone_design",
      fromMilestoneName: "Design Phase",
      toMilestoneId: "milestone_123",
      toMilestoneName: "Development Phase",
      type: "finish-to-start",
      lagDays: 0,
      createdAt: Timestamp,
      createdBy: "user_456"
    }
  ],
  
  // Auto-update tracking
  autoUpdated: true,              // Set when dates cascaded automatically
  lastCascadeUpdate: Timestamp
}
```

## Dependency Types

### Finish-to-Start (FS) - Default

Successor starts after predecessor finishes.

```
Milestone A: [====]
Milestone B:        [====]
```

**Use Case**: Design must finish before development starts

### Start-to-Start (SS)

Both milestones start at the same time.

```
Milestone A: [========]
Milestone B: [====]
```

**Use Case**: Testing starts when development starts

### Finish-to-Finish (FF)

Both milestones finish at the same time.

```
Milestone A: [====]
Milestone B:   [====]
```

**Use Case**: Documentation finishes when development finishes

### Start-to-Finish (SF) - Rare

Successor finishes when predecessor starts.

```
Milestone A:     [====]
Milestone B: [====]
```

**Use Case**: Old system decommissioned when new system starts

## Critical Path Method (CPM)

### Forward Pass

Calculate earliest start and finish times.

```
For each milestone (in topological order):
  If no predecessors:
    ES = project start date
  Else:
    ES = max(EF of all predecessors)
  EF = ES + duration
```

### Backward Pass

Calculate latest start and finish times.

```
For each milestone (in reverse topological order):
  If no successors:
    LF = project end date (or EF)
  Else:
    LF = min(LS of all successors)
  LS = LF - duration
```

### Slack Calculation

```
Slack = LS - ES = LF - EF
```

- **Zero slack**: On critical path
- **Positive slack**: Can be delayed without affecting project
- **Negative slack**: Project is behind schedule

### Critical Path Identification

```typescript
const criticalPath = nodes.filter(node => node.slack === 0);
```

## UI Components

### DependencyGraph Component

**Features**:
- Full-screen modal view
- Level-grouped layout
- Critical path highlighting (orange)
- Interactive milestone cards
- Add/remove dependencies
- Dependency suggestions panel
- Statistics header

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Milestone Dependencies    [Suggestions] [Add] [×]   │
│ 8 milestones • 3 on critical path                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ⚠ Critical Path: Design → Development → Testing    │
│                                                      │
│ Level 0 ─────────────────────────────────────       │
│ [Planning]        [Research]                        │
│                                                      │
│ Level 1 ─────────────────────────────────────       │
│ [Design] ⚠       [Content]                         │
│ Depends on: Planning                                │
│ Blocks: Development                                 │
│                                                      │
│ Level 2 ─────────────────────────────────────       │
│ [Development] ⚠  [Testing]                          │
│ Depends on: Design                                  │
│ 5 days slack                                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Interactions**:
- Click milestone to select
- Click "Add Dependency" to link milestones
- Click trash icon to remove dependency
- Click "Suggestions" to see AI recommendations
- Critical path items have orange background

### Milestone Card in Graph

```typescript
<div className={node.isOnCriticalPath ? 'border-orange-300 bg-orange-50' : 'border-border'}>
  <h5>{node.name}</h5>
  {node.slack > 0 && <p>{node.slack} days slack</p>}
  
  {/* Dependencies */}
  <div>Depends on: {dependencies}</div>
  
  {/* Dependents */}
  <div>Blocks: {dependents}</div>
</div>
```

## Circular Dependency Detection

### Algorithm

Breadth-First Search (BFS) from potential successor to check if predecessor is reachable.

```typescript
function checkCircularDependency(from, to) {
  visited = new Set();
  queue = [to];  // Start from successor
  
  while (queue.length > 0) {
    current = queue.shift();
    
    if (current === from) {
      return true;  // Cycle detected!
    }
    
    if (visited.has(current)) continue;
    visited.add(current);
    
    // Add dependencies of current to queue
    queue.push(...getDependencies(current));
  }
  
  return false;  // No cycle
}
```

### Examples

**Valid**:
```
A → B → C  ✅
```

**Invalid (Self-dependency)**:
```
A → A  ❌
```

**Invalid (Circular)**:
```
A → B → C → A  ❌
```

**Valid (Diamond)**:
```
    A
   / \
  B   C
   \ /
    D  ✅
```

## Date Cascading

### Trigger Events

Dates cascade when:
- Predecessor due date changes
- Dependency is added
- Manual date adjustment
- Milestone status changes to completed

### Cascading Rules

1. **Forward Only**: Dates only push forward, never pull back
2. **Duration Preserved**: Each milestone keeps its original duration
3. **Recursive**: Cascades through entire dependency chain
4. **Smart Update**: Only updates if new date is later than current

### Example

```
Initial:
  Design:      Jan 1 - Jan 10
  Development: Jan 5 - Jan 20  (overlapping)
  Testing:     Jan 15 - Jan 25

After Design extends to Jan 15:
  Design:      Jan 1 - Jan 15 (changed)
  Development: Jan 16 - Jan 31 (cascaded, +11 days)
  Testing:     Jan 26 - Feb 5  (cascaded, +11 days)
```

### Implementation

```typescript
async function cascadeDateChanges(changedMilestoneId) {
  milestone = await getMilestone(changedMilestoneId);
  dependents = milestone.dependents;
  
  for (dependent of dependents) {
    newStartDate = milestone.dueDate + 1 day;
    
    if (newStartDate > dependent.createdAt) {
      duration = dependent.dueDate - dependent.createdAt;
      newDueDate = newStartDate + duration;
      
      await updateMilestone(dependent.id, {
        createdAt: newStartDate,
        dueDate: newDueDate,
        autoUpdated: true
      });
      
      // Cascade further
      await cascadeDateChanges(dependent.id);
    }
  }
}
```

## Dependency Suggestions

### Suggestion Engine

```typescript
function suggestDependencies(milestones) {
  suggestions = [];
  
  // Date-based suggestions
  for each pair (m1, m2) where m1.dueDate < m2.createdAt {
    daysDiff = m2.createdAt - m1.dueDate;
    if (daysDiff <= 30 days) {
      confidence = 1 - (daysDiff / 30);
      suggestions.push({
        from: m1,
        to: m2,
        reason: `${m1.name} ends ${daysDiff} days before ${m2.name}`,
        confidence
      });
    }
  }
  
  // Keyword-based suggestions
  keywords = ['design', 'develop', 'test', 'deploy'];
  for each sequential pair (keyword1, keyword2) {
    if (m1.name.includes(keyword1) && m2.name.includes(keyword2)) {
      suggestions.push({
        from: m1,
        to: m2,
        reason: `Sequential workflow: ${keyword1} → ${keyword2}`,
        confidence: 0.8
      });
    }
  }
  
  return suggestions.sort(by confidence descending);
}
```

### Suggestion UI

```
┌──────────────────────────────────────────────────┐
│ 💡 Suggested Dependencies                        │
│                                                   │
│ Design Phase → Development Phase                 │
│ Design ends 2 days before Development starts     │
│ Confidence: ████████░░ 80%        [Add]          │
│                                                   │
│ Testing → Deployment                             │
│ Sequential workflow: test → deploy               │
│ Confidence: ████████░░ 80%        [Add]          │
└──────────────────────────────────────────────────┘
```

## Best Practices

### 1. Dependency Structure

**✅ Good**:
- Linear chains for sequential work
- Parallel paths for independent work
- Minimal dependencies for flexibility
- Clear predecessor/successor relationships

**❌ Bad**:
- Everything depends on everything
- Circular dependencies
- Unnecessary dependencies
- Over-constraining the schedule

### 2. Critical Path Management

**Monitor**:
- Milestones on critical path (zero slack)
- Watch for delays in critical activities
- Prioritize critical path work
- Buffer non-critical work

**Optimize**:
- Reduce critical path duration (fast-tracking)
- Add resources to critical tasks (crashing)
- Parallelize when possible
- Remove unnecessary dependencies

### 3. Date Management

**Manual Updates**:
- Review cascaded dates before accepting
- Verify resource availability
- Check for conflicts
- Communicate changes to team

**Auto-Cascading**:
- Let system handle date propagation
- Review auto-updated flag
- Adjust manually if needed
- Document reasoning for changes

## Examples

### Example 1: Simple Chain

```typescript
// Create milestones
const design = await createMilestone({
  name: 'Design Phase',
  dueDate: '2026-02-01'
});

const dev = await createMilestone({
  name: 'Development Phase',
  dueDate: '2026-03-01'
});

const test = await createMilestone({
  name: 'Testing Phase',
  dueDate: '2026-03-15'
});

// Link them
await addMilestoneDependency(
  projectId,
  design.id, 'Design Phase',
  dev.id, 'Development Phase',
  'finish-to-start', 0, userId
);

await addMilestoneDependency(
  projectId,
  dev.id, 'Development Phase',
  test.id, 'Testing Phase',
  'finish-to-start', 0, userId
);

// Result: Design → Development → Testing
```

### Example 2: Parallel Work

```typescript
// Design can happen in parallel with Research
const design = await createMilestone({ name: 'UI Design' });
const research = await createMilestone({ name: 'Market Research' });

// Both feed into Development
await addMilestoneDependency(
  projectId,
  design.id, 'UI Design',
  dev.id, 'Development',
  'finish-to-start', 0, userId
);

await addMilestoneDependency(
  projectId,
  research.id, 'Market Research',
  dev.id, 'Development',
  'finish-to-start', 0, userId
);

// Result: Development starts when BOTH Design AND Research finish
```

### Example 3: Using Graph Data

```typescript
const nodes = await buildDependencyGraph(projectId, milestones);

// Find critical path
const critical = nodes.filter(n => n.isOnCriticalPath);
console.log('Critical milestones:', critical.map(n => n.name));

// Find milestones with most slack
const flexible = nodes
  .filter(n => n.slack > 0)
  .sort((a, b) => b.slack - a.slack);
console.log('Most flexible:', flexible[0].name, `${flexible[0].slack} days`);

// Find bottlenecks (many dependents)
const bottlenecks = nodes
  .filter(n => n.dependents.length > 2)
  .sort((a, b) => b.dependents.length - a.dependents.length);
console.log('Bottleneck:', bottlenecks[0].name, 
  `blocks ${bottlenecks[0].dependents.length} milestones`);
```

## Integration

### Activity Feed

```typescript
// Log dependency creation
await createActivityEvent({
  type: 'dependency_added',
  description: `Linked ${fromMilestone.name} → ${toMilestone.name}`,
  metadata: { type: 'finish-to-start' }
});
```

### Notifications

```typescript
// Notify on date cascade
await sendNotification({
  recipientIds: assignedUserIds,
  type: 'milestone_date_changed',
  message: `${milestoneName} dates auto-updated due to dependency`
});
```

### Dashboard Widget

```typescript
// Show critical path widget
<CriticalPathWidget milestones={criticalPathMilestones} />
```

## Troubleshooting

### Circular Dependency Error

**Symptom**: "This dependency would create a circular relationship"

**Solution**:
1. Review existing dependencies
2. Identify the cycle
3. Remove conflicting dependency
4. Restructure dependency chain

### Dates Not Cascading

**Symptom**: Dependent dates unchanged after predecessor update

**Solution**:
1. Check if new date is later than current
2. Verify dependency exists in Firestore
3. Check `dependents` array populated
4. Manually trigger `cascadeDateChanges()`

### Critical Path Incorrect

**Symptom**: Wrong milestones marked as critical

**Solution**:
1. Verify all dependencies added
2. Check milestone dates are correct
3. Recalculate graph
4. Review forward/backward pass logic

## Future Enhancements

- [ ] Visual graph with SVG/Canvas rendering
- [ ] Drag-and-drop dependency creation
- [ ] Gantt chart integration
- [ ] Resource leveling
- [ ] What-if scenario analysis
- [ ] Export to MS Project / Primavera
- [ ] Dependency types visualization
- [ ] Lag time editing UI
- [ ] Bulk dependency operations
- [ ] Dependency templates

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
