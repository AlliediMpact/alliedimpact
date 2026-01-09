import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface DeliverableVersion {
  id: string;
  versionNumber: number;
  name: string;
  description: string;
  notes: string;
  fileUrls: string[];
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  comment: string; // Version comment explaining changes
  status: string;
  type: string;
}

export interface VersionChange {
  field: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'modified';
}

/**
 * Create a new version of a deliverable
 */
export async function createDeliverableVersion(
  deliverableId: string,
  currentData: any,
  userId: string,
  userName: string,
  versionComment: string
): Promise<number> {
  try {
    const deliverableRef = doc(db, 'deliverables', deliverableId);
    const deliverableSnap = await getDoc(deliverableRef);
    
    if (!deliverableSnap.exists()) {
      throw new Error('Deliverable not found');
    }

    const data = deliverableSnap.data();
    const currentVersions = data.versions || [];
    const newVersionNumber = currentVersions.length + 1;

    const newVersion: DeliverableVersion = {
      id: `v${newVersionNumber}`,
      versionNumber: newVersionNumber,
      name: currentData.name,
      description: currentData.description,
      notes: currentData.notes || '',
      fileUrls: currentData.fileUrls || [],
      createdAt: new Date(),
      createdBy: userId,
      createdByName: userName,
      comment: versionComment,
      status: currentData.status,
      type: currentData.type,
    };

    await updateDoc(deliverableRef, {
      versions: arrayUnion(newVersion),
      currentVersion: newVersionNumber,
      updatedAt: Timestamp.now(),
    });

    return newVersionNumber;
  } catch (error) {
    console.error('Failed to create version:', error);
    throw error;
  }
}

/**
 * Get all versions of a deliverable
 */
export async function getDeliverableVersions(
  deliverableId: string
): Promise<DeliverableVersion[]> {
  try {
    const deliverableRef = doc(db, 'deliverables', deliverableId);
    const deliverableSnap = await getDoc(deliverableRef);
    
    if (!deliverableSnap.exists()) {
      return [];
    }

    const data = deliverableSnap.data();
    return data.versions || [];
  } catch (error) {
    console.error('Failed to get versions:', error);
    return [];
  }
}

/**
 * Get a specific version
 */
export async function getDeliverableVersion(
  deliverableId: string,
  versionNumber: number
): Promise<DeliverableVersion | null> {
  try {
    const versions = await getDeliverableVersions(deliverableId);
    return versions.find(v => v.versionNumber === versionNumber) || null;
  } catch (error) {
    console.error('Failed to get version:', error);
    return null;
  }
}

/**
 * Rollback to a previous version
 */
export async function rollbackToVersion(
  deliverableId: string,
  versionNumber: number,
  userId: string,
  userName: string
): Promise<void> {
  try {
    const version = await getDeliverableVersion(deliverableId, versionNumber);
    
    if (!version) {
      throw new Error('Version not found');
    }

    const deliverableRef = doc(db, 'deliverables', deliverableId);
    
    // Create a new version as a rollback
    await createDeliverableVersion(
      deliverableId,
      version,
      userId,
      userName,
      `Rolled back to version ${versionNumber}`
    );

    // Update current data to match the version
    await updateDoc(deliverableRef, {
      name: version.name,
      description: version.description,
      notes: version.notes,
      fileUrls: version.fileUrls,
      status: version.status,
      type: version.type,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error('Failed to rollback:', error);
    throw error;
  }
}

/**
 * Compare two versions and get differences
 */
export function compareVersions(
  version1: DeliverableVersion,
  version2: DeliverableVersion
): VersionChange[] {
  const changes: VersionChange[] = [];

  // Compare name
  if (version1.name !== version2.name) {
    changes.push({
      field: 'Name',
      oldValue: version1.name,
      newValue: version2.name,
      type: 'modified',
    });
  }

  // Compare description
  if (version1.description !== version2.description) {
    changes.push({
      field: 'Description',
      oldValue: version1.description,
      newValue: version2.description,
      type: 'modified',
    });
  }

  // Compare notes
  if (version1.notes !== version2.notes) {
    changes.push({
      field: 'Notes',
      oldValue: version1.notes,
      newValue: version2.notes,
      type: 'modified',
    });
  }

  // Compare status
  if (version1.status !== version2.status) {
    changes.push({
      field: 'Status',
      oldValue: version1.status,
      newValue: version2.status,
      type: 'modified',
    });
  }

  // Compare type
  if (version1.type !== version2.type) {
    changes.push({
      field: 'Type',
      oldValue: version1.type,
      newValue: version2.type,
      type: 'modified',
    });
  }

  // Compare files
  const files1 = version1.fileUrls || [];
  const files2 = version2.fileUrls || [];
  
  const addedFiles = files2.filter(f => !files1.includes(f));
  const removedFiles = files1.filter(f => !files2.includes(f));

  addedFiles.forEach(file => {
    changes.push({
      field: 'Files',
      oldValue: null,
      newValue: file,
      type: 'added',
    });
  });

  removedFiles.forEach(file => {
    changes.push({
      field: 'Files',
      oldValue: file,
      newValue: null,
      type: 'removed',
    });
  });

  return changes;
}

/**
 * Get visual diff for text fields (description, notes)
 */
export function getTextDiff(oldText: string, newText: string): {
  added: string[];
  removed: string[];
  unchanged: string[];
} {
  // Simple line-by-line diff
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  const added: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];

  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (oldIndex >= oldLines.length) {
      // Remaining lines are added
      added.push(newLines[newIndex]);
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Remaining lines are removed
      removed.push(oldLines[oldIndex]);
      oldIndex++;
    } else if (oldLines[oldIndex] === newLines[newIndex]) {
      // Lines are the same
      unchanged.push(oldLines[oldIndex]);
      oldIndex++;
      newIndex++;
    } else {
      // Lines differ - check if it's an addition or removal
      const oldLineInNew = newLines.indexOf(oldLines[oldIndex], newIndex);
      const newLineInOld = oldLines.indexOf(newLines[newIndex], oldIndex);

      if (oldLineInNew === -1 && newLineInOld === -1) {
        // Both are different - treat as modification
        removed.push(oldLines[oldIndex]);
        added.push(newLines[newIndex]);
        oldIndex++;
        newIndex++;
      } else if (oldLineInNew !== -1) {
        // Old line appears later in new - current new lines are additions
        while (newIndex < oldLineInNew) {
          added.push(newLines[newIndex]);
          newIndex++;
        }
      } else {
        // New line appears later in old - current old lines are removals
        while (oldIndex < newLineInOld) {
          removed.push(oldLines[oldIndex]);
          oldIndex++;
        }
      }
    }
  }

  return { added, removed, unchanged };
}

/**
 * Format version comment for display
 */
export function formatVersionComment(version: DeliverableVersion): string {
  if (version.comment) {
    return version.comment;
  }
  
  // Generate default comment
  return `Version ${version.versionNumber} created`;
}

/**
 * Check if user can rollback (e.g., only certain roles)
 */
export function canRollback(userRole: string): boolean {
  const allowedRoles = ['admin', 'pm', 'developer'];
  return allowedRoles.includes(userRole.toLowerCase());
}
