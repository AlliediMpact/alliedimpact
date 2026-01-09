import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Milestone } from '@allied-impact/projects';

export interface MilestoneDependency {
  id: string;
  fromMilestoneId: string;      // Predecessor (must complete first)
  fromMilestoneName: string;
  toMilestoneId: string;        // Successor (depends on predecessor)
  toMilestoneName: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lagDays?: number;             // Optional delay (can be negative for lead time)
  createdAt: Date;
  createdBy: string;
}

export interface DependencyGraphNode {
  id: string;
  name: string;
  milestone: Milestone;
  dependencies: string[];       // IDs of milestones this depends on
  dependents: string[];         // IDs of milestones that depend on this
  level: number;                // Depth in dependency tree (0 = no dependencies)
  isOnCriticalPath: boolean;
  earliestStart: Date;
  earliestFinish: Date;
  latestStart: Date;
  latestFinish: Date;
  slack: number;                // Days of slack (0 = critical path)
}

/**
 * Add a dependency between two milestones
 */
export async function addMilestoneDependency(
  projectId: string,
  fromMilestoneId: string,
  fromMilestoneName: string,
  toMilestoneId: string,
  toMilestoneName: string,
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish' = 'finish-to-start',
  lagDays: number = 0,
  userId: string
): Promise<void> {
  // Prevent self-dependency
  if (fromMilestoneId === toMilestoneId) {
    throw new Error('A milestone cannot depend on itself');
  }

  // Check for circular dependencies
  const wouldCreateCycle = await checkCircularDependency(projectId, fromMilestoneId, toMilestoneId);
  if (wouldCreateCycle) {
    throw new Error('This dependency would create a circular relationship');
  }

  const dependency: MilestoneDependency = {
    id: `${fromMilestoneId}_${toMilestoneId}`,
    fromMilestoneId,
    fromMilestoneName,
    toMilestoneId,
    toMilestoneName,
    type,
    lagDays,
    createdAt: new Date(),
    createdBy: userId,
  };

  // Update both milestones
  const fromRef = doc(db, 'milestones', fromMilestoneId);
  const toRef = doc(db, 'milestones', toMilestoneId);

  await Promise.all([
    updateDoc(fromRef, {
      dependents: arrayUnion(toMilestoneId),
      dependencies: arrayUnion(dependency),
    }),
    updateDoc(toRef, {
      dependencies: arrayUnion(fromMilestoneId),
      dependencyDetails: arrayUnion(dependency),
    }),
  ]);

  // Auto-update cascading dates
  await cascadeDateChanges(projectId, fromMilestoneId);
}

/**
 * Remove a dependency
 */
export async function removeMilestoneDependency(
  fromMilestoneId: string,
  toMilestoneId: string
): Promise<void> {
  const fromRef = doc(db, 'milestones', fromMilestoneId);
  const toRef = doc(db, 'milestones', toMilestoneId);

  await Promise.all([
    updateDoc(fromRef, {
      dependents: arrayRemove(toMilestoneId),
    }),
    updateDoc(toRef, {
      dependencies: arrayRemove(fromMilestoneId),
    }),
  ]);
}

/**
 * Check if adding a dependency would create a circular relationship
 */
export async function checkCircularDependency(
  projectId: string,
  fromMilestoneId: string,
  toMilestoneId: string
): Promise<boolean> {
  // Check if toMilestone is already a predecessor of fromMilestone
  const visited = new Set<string>();
  const queue: string[] = [toMilestoneId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    
    if (currentId === fromMilestoneId) {
      return true; // Found a cycle
    }

    if (visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);

    // Get dependencies of current milestone
    const milestoneRef = doc(db, 'milestones', currentId);
    const milestoneSnap = await getDoc(milestoneRef);
    
    if (milestoneSnap.exists()) {
      const data = milestoneSnap.data();
      const dependencies = data.dependencies || [];
      queue.push(...dependencies.filter((id: string) => !visited.has(id)));
    }
  }

  return false; // No cycle detected
}

/**
 * Get all dependencies for a project
 */
export async function getProjectDependencies(projectId: string): Promise<MilestoneDependency[]> {
  const milestonesQuery = query(
    collection(db, 'milestones'),
    where('projectId', '==', projectId)
  );

  const snapshot = await getDocs(milestonesQuery);
  const dependencies: MilestoneDependency[] = [];

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.dependencies && Array.isArray(data.dependencies)) {
      data.dependencies.forEach((dep: any) => {
        if (dep.id && dep.fromMilestoneId && dep.toMilestoneId) {
          dependencies.push(dep as MilestoneDependency);
        }
      });
    }
  });

  // Remove duplicates
  const uniqueDeps = dependencies.filter((dep, index, self) =>
    index === self.findIndex(d => d.id === dep.id)
  );

  return uniqueDeps;
}

/**
 * Build dependency graph for visualization
 */
export async function buildDependencyGraph(
  projectId: string,
  milestones: Milestone[]
): Promise<DependencyGraphNode[]> {
  const dependencies = await getProjectDependencies(projectId);
  const nodes: Map<string, DependencyGraphNode> = new Map();

  // Initialize nodes
  milestones.forEach(milestone => {
    nodes.set(milestone.id, {
      id: milestone.id,
      name: milestone.name,
      milestone,
      dependencies: [],
      dependents: [],
      level: 0,
      isOnCriticalPath: false,
      earliestStart: new Date(milestone.createdAt),
      earliestFinish: new Date(milestone.dueDate),
      latestStart: new Date(milestone.dueDate),
      latestFinish: new Date(milestone.dueDate),
      slack: 0,
    });
  });

  // Add dependency relationships
  dependencies.forEach(dep => {
    const fromNode = nodes.get(dep.fromMilestoneId);
    const toNode = nodes.get(dep.toMilestoneId);

    if (fromNode && toNode) {
      fromNode.dependents.push(dep.toMilestoneId);
      toNode.dependencies.push(dep.fromMilestoneId);
    }
  });

  // Calculate levels (topological sort)
  const calculateLevels = () => {
    const inDegree = new Map<string, number>();
    nodes.forEach((node, id) => {
      inDegree.set(id, node.dependencies.length);
    });

    const queue: string[] = [];
    nodes.forEach((node, id) => {
      if (inDegree.get(id) === 0) {
        queue.push(id);
        node.level = 0;
      }
    });

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = nodes.get(currentId)!;

      currentNode.dependents.forEach(dependentId => {
        const degree = inDegree.get(dependentId)! - 1;
        inDegree.set(dependentId, degree);

        const dependentNode = nodes.get(dependentId)!;
        dependentNode.level = Math.max(dependentNode.level, currentNode.level + 1);

        if (degree === 0) {
          queue.push(dependentId);
        }
      });
    }
  };

  calculateLevels();

  // Calculate critical path
  const criticalPath = calculateCriticalPath(Array.from(nodes.values()));
  criticalPath.forEach(nodeId => {
    const node = nodes.get(nodeId);
    if (node) {
      node.isOnCriticalPath = true;
    }
  });

  return Array.from(nodes.values());
}

/**
 * Calculate critical path using forward and backward pass
 */
export function calculateCriticalPath(nodes: DependencyGraphNode[]): string[] {
  // Forward pass - calculate earliest start/finish
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  nodes.sort((a, b) => a.level - b.level);
  
  nodes.forEach(node => {
    const duration = Math.ceil(
      (new Date(node.milestone.dueDate).getTime() - new Date(node.milestone.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (node.dependencies.length === 0) {
      node.earliestStart = new Date(node.milestone.createdAt);
    } else {
      const maxFinish = Math.max(
        ...node.dependencies.map(depId => {
          const depNode = nodeMap.get(depId);
          return depNode ? new Date(depNode.earliestFinish).getTime() : 0;
        })
      );
      node.earliestStart = new Date(maxFinish);
    }
    
    node.earliestFinish = new Date(node.earliestStart.getTime() + duration * 24 * 60 * 60 * 1000);
  });

  // Backward pass - calculate latest start/finish
  nodes.sort((a, b) => b.level - a.level);
  
  nodes.forEach(node => {
    const duration = Math.ceil(
      (new Date(node.milestone.dueDate).getTime() - new Date(node.milestone.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (node.dependents.length === 0) {
      node.latestFinish = node.earliestFinish;
    } else {
      const minStart = Math.min(
        ...node.dependents.map(depId => {
          const depNode = nodeMap.get(depId);
          return depNode ? new Date(depNode.latestStart).getTime() : Infinity;
        })
      );
      node.latestFinish = new Date(minStart);
    }
    
    node.latestStart = new Date(node.latestFinish.getTime() - duration * 24 * 60 * 60 * 1000);
    
    // Calculate slack
    node.slack = Math.ceil(
      (node.latestStart.getTime() - node.earliestStart.getTime()) / (1000 * 60 * 60 * 24)
    );
  });

  // Critical path = nodes with zero slack
  return nodes.filter(n => n.slack === 0).map(n => n.id);
}

/**
 * Auto-update dates when a milestone changes
 */
export async function cascadeDateChanges(
  projectId: string,
  changedMilestoneId: string
): Promise<void> {
  const milestoneRef = doc(db, 'milestones', changedMilestoneId);
  const milestoneSnap = await getDoc(milestoneRef);
  
  if (!milestoneSnap.exists()) return;

  const milestone = milestoneSnap.data();
  const dependents = milestone.dependents || [];

  // Update all dependent milestones
  for (const dependentId of dependents) {
    const dependentRef = doc(db, 'milestones', dependentId);
    const dependentSnap = await getDoc(dependentRef);
    
    if (!dependentSnap.exists()) continue;

    const dependent = dependentSnap.data();
    const newStartDate = new Date(milestone.dueDate);
    newStartDate.setDate(newStartDate.getDate() + 1); // Start day after predecessor ends

    // Only update if the new start date is later than current
    if (newStartDate > new Date(dependent.createdAt)) {
      const duration = Math.ceil(
        (new Date(dependent.dueDate).getTime() - new Date(dependent.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const newDueDate = new Date(newStartDate);
      newDueDate.setDate(newDueDate.getDate() + duration);

      await updateDoc(dependentRef, {
        createdAt: newStartDate,
        dueDate: newDueDate,
        autoUpdated: true,
      });

      // Recursively cascade to dependents of this milestone
      await cascadeDateChanges(projectId, dependentId);
    }
  }
}

/**
 * Get suggested dependencies based on milestone names and dates
 */
export function suggestDependencies(milestones: Milestone[]): Array<{
  from: Milestone;
  to: Milestone;
  reason: string;
  confidence: number;
}> {
  const suggestions: Array<{
    from: Milestone;
    to: Milestone;
    reason: string;
    confidence: number;
  }> = [];

  milestones.forEach((m1, i) => {
    milestones.forEach((m2, j) => {
      if (i >= j) return;

      // Suggest based on dates (earlier milestone might be prerequisite)
      const date1 = new Date(m1.dueDate);
      const date2 = new Date(m2.dueDate);
      
      if (date1 < date2) {
        const daysDiff = Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
        
        // Suggest if dates are close (within 30 days)
        if (daysDiff <= 30) {
          suggestions.push({
            from: m1,
            to: m2,
            reason: `${m1.name} ends ${daysDiff} days before ${m2.name} starts`,
            confidence: Math.max(0.3, 1 - (daysDiff / 30)),
          });
        }
      }

      // Suggest based on keywords in names
      const keywords = ['design', 'develop', 'test', 'deploy', 'plan', 'implement', 'review'];
      keywords.forEach((keyword, idx) => {
        const nextKeyword = keywords[idx + 1];
        if (nextKeyword && m1.name.toLowerCase().includes(keyword) && m2.name.toLowerCase().includes(nextKeyword)) {
          suggestions.push({
            from: m1,
            to: m2,
            reason: `Sequential workflow: ${keyword} → ${nextKeyword}`,
            confidence: 0.8,
          });
        }
      });
    });
  });

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}
