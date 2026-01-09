import {
  createDeliverableVersion,
  getDeliverableVersions,
  getDeliverableVersion,
  rollbackToVersion,
  compareVersions,
  getTextDiff,
  formatVersionComment,
  canRollback,
  DeliverableVersion,
  VersionChange,
} from '@/lib/version-control';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore');
jest.mock('@/config/firebase', () => ({
  db: {},
}));

const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockArrayUnion = arrayUnion as jest.MockedFunction<typeof arrayUnion>;
const mockTimestamp = Timestamp as jest.Mocked<typeof Timestamp>;

describe('version-control', () => {
  const mockVersion1: DeliverableVersion = {
    id: 'v1',
    versionNumber: 1,
    name: 'Design Mockups',
    description: 'Initial design mockups',
    notes: 'First draft',
    fileUrls: ['file1.pdf'],
    createdAt: new Date('2026-01-01'),
    createdBy: 'user1',
    createdByName: 'User One',
    comment: 'Initial version',
    status: 'draft',
    type: 'design',
  };

  const mockVersion2: DeliverableVersion = {
    id: 'v2',
    versionNumber: 2,
    name: 'Design Mockups v2',
    description: 'Updated design mockups with feedback',
    notes: 'Incorporated client feedback',
    fileUrls: ['file1.pdf', 'file2.pdf'],
    createdAt: new Date('2026-01-10'),
    createdBy: 'user1',
    createdByName: 'User One',
    comment: 'Added new screens',
    status: 'in_review',
    type: 'design',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockReturnValue({} as any);
    mockArrayUnion.mockImplementation((...args) => args as any);
    mockTimestamp.now = jest.fn().mockReturnValue({ seconds: 1234567890 } as any);
  });

  describe('createDeliverableVersion', () => {
    it('should create a new version successfully', async () => {
      const mockData = {
        versions: [mockVersion1],
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockData,
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined as any);

      const currentData = {
        name: 'Design Mockups v2',
        description: 'Updated design',
        notes: 'New notes',
        fileUrls: ['file2.pdf'],
        status: 'in_review',
        type: 'design',
      };

      const versionNumber = await createDeliverableVersion(
        'deliverable1',
        currentData,
        'user1',
        'User One',
        'Version 2 comment'
      );

      expect(versionNumber).toBe(2);
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    });

    it('should create first version when no versions exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ versions: [] }),
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined as any);

      const currentData = {
        name: 'Initial Design',
        description: 'First version',
        notes: '',
        fileUrls: [],
        status: 'draft',
        type: 'design',
      };

      const versionNumber = await createDeliverableVersion(
        'deliverable1',
        currentData,
        'user1',
        'User One',
        'Initial version'
      );

      expect(versionNumber).toBe(1);
    });

    it('should throw error when deliverable not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const currentData = {
        name: 'Test',
        description: 'Test',
        notes: '',
        fileUrls: [],
        status: 'draft',
        type: 'design',
      };

      await expect(
        createDeliverableVersion('invalid', currentData, 'user1', 'User One', 'Comment')
      ).rejects.toThrow('Deliverable not found');
    });

    it('should handle missing optional fields', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ versions: [] }),
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined as any);

      const currentData = {
        name: 'Design',
        description: 'Description',
        status: 'draft',
        type: 'design',
      };

      await createDeliverableVersion(
        'deliverable1',
        currentData,
        'user1',
        'User One',
        'Comment'
      );

      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should handle Firestore errors gracefully', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const currentData = {
        name: 'Test',
        description: 'Test',
        notes: '',
        fileUrls: [],
        status: 'draft',
        type: 'design',
      };

      await expect(
        createDeliverableVersion('deliverable1', currentData, 'user1', 'User One', 'Comment')
      ).rejects.toThrow('Firestore error');
    });
  });

  describe('getDeliverableVersions', () => {
    it('should return all versions', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ versions: [mockVersion1, mockVersion2] }),
      } as any);

      const versions = await getDeliverableVersions('deliverable1');

      expect(versions).toHaveLength(2);
      expect(versions[0]).toEqual(mockVersion1);
      expect(versions[1]).toEqual(mockVersion2);
    });

    it('should return empty array when deliverable not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      } as any);

      const versions = await getDeliverableVersions('invalid');

      expect(versions).toEqual([]);
    });

    it('should return empty array when no versions exist', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({}),
      } as any);

      const versions = await getDeliverableVersions('deliverable1');

      expect(versions).toEqual([]);
    });

    it('should handle Firestore errors and return empty array', async () => {
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const versions = await getDeliverableVersions('deliverable1');

      expect(versions).toEqual([]);
    });
  });

  describe('getDeliverableVersion', () => {
    it('should return specific version', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ versions: [mockVersion1, mockVersion2] }),
      } as any);

      const version = await getDeliverableVersion('deliverable1', 2);

      expect(version).toEqual(mockVersion2);
    });

    it('should return null when version not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ versions: [mockVersion1] }),
      } as any);

      const version = await getDeliverableVersion('deliverable1', 99);

      expect(version).toBeNull();
    });

    it('should handle errors and return null', async () => {
      mockGetDoc.mockRejectedValue(new Error('Error'));

      const version = await getDeliverableVersion('deliverable1', 1);

      expect(version).toBeNull();
    });
  });

  describe('rollbackToVersion', () => {
    it('should rollback to previous version', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ versions: [mockVersion1, mockVersion2] }),
      } as any);

      mockUpdateDoc.mockResolvedValue(undefined as any);

      await rollbackToVersion('deliverable1', 1, 'user2', 'User Two');

      expect(mockUpdateDoc).toHaveBeenCalledTimes(2); // Once for creating new version, once for updating data
    });

    it('should throw error when version not found', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ versions: [mockVersion1] }),
      } as any);

      await expect(
        rollbackToVersion('deliverable1', 99, 'user2', 'User Two')
      ).rejects.toThrow('Version not found');
    });

    it('should handle Firestore errors', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ versions: [mockVersion1] }),
      } as any);

      mockUpdateDoc.mockRejectedValue(new Error('Update failed'));

      await expect(
        rollbackToVersion('deliverable1', 1, 'user2', 'User Two')
      ).rejects.toThrow();
    });
  });

  describe('compareVersions', () => {
    it('should detect name changes', () => {
      const changes = compareVersions(mockVersion1, mockVersion2);

      const nameChange = changes.find(c => c.field === 'Name');
      expect(nameChange).toBeDefined();
      expect(nameChange?.type).toBe('modified');
      expect(nameChange?.oldValue).toBe('Design Mockups');
      expect(nameChange?.newValue).toBe('Design Mockups v2');
    });

    it('should detect description changes', () => {
      const changes = compareVersions(mockVersion1, mockVersion2);

      const descChange = changes.find(c => c.field === 'Description');
      expect(descChange).toBeDefined();
      expect(descChange?.type).toBe('modified');
    });

    it('should detect notes changes', () => {
      const changes = compareVersions(mockVersion1, mockVersion2);

      const notesChange = changes.find(c => c.field === 'Notes');
      expect(notesChange).toBeDefined();
      expect(notesChange?.type).toBe('modified');
    });

    it('should detect status changes', () => {
      const changes = compareVersions(mockVersion1, mockVersion2);

      const statusChange = changes.find(c => c.field === 'Status');
      expect(statusChange).toBeDefined();
      expect(statusChange?.oldValue).toBe('draft');
      expect(statusChange?.newValue).toBe('in_review');
    });

    it('should detect added files', () => {
      const changes = compareVersions(mockVersion1, mockVersion2);

      const addedFiles = changes.filter(c => c.field === 'Files' && c.type === 'added');
      expect(addedFiles).toHaveLength(1);
      expect(addedFiles[0].newValue).toBe('file2.pdf');
    });

    it('should detect removed files', () => {
      const v1 = { ...mockVersion1, fileUrls: ['file1.pdf', 'file2.pdf'] };
      const v2 = { ...mockVersion2, fileUrls: ['file2.pdf'] };

      const changes = compareVersions(v1, v2);

      const removedFiles = changes.filter(c => c.field === 'Files' && c.type === 'removed');
      expect(removedFiles).toHaveLength(1);
      expect(removedFiles[0].oldValue).toBe('file1.pdf');
    });

    it('should return empty array when versions are identical', () => {
      const changes = compareVersions(mockVersion1, mockVersion1);

      expect(changes).toHaveLength(0);
    });
  });

  describe('getTextDiff', () => {
    it('should detect added lines', () => {
      const oldText = 'Line 1\nLine 2';
      const newText = 'Line 1\nLine 2\nLine 3';

      const diff = getTextDiff(oldText, newText);

      expect(diff.added).toContain('Line 3');
      expect(diff.removed).toHaveLength(0);
      expect(diff.unchanged).toContain('Line 1');
      expect(diff.unchanged).toContain('Line 2');
    });

    it('should detect removed lines', () => {
      const oldText = 'Line 1\nLine 2\nLine 3';
      const newText = 'Line 1\nLine 3';

      const diff = getTextDiff(oldText, newText);

      expect(diff.removed).toContain('Line 2');
      expect(diff.added).toHaveLength(0);
    });

    it('should detect modified lines', () => {
      const oldText = 'Line 1\nLine 2\nLine 3';
      const newText = 'Line 1\nLine 2 Modified\nLine 3';

      const diff = getTextDiff(oldText, newText);

      expect(diff.removed).toContain('Line 2');
      expect(diff.added).toContain('Line 2 Modified');
    });

    it('should handle empty old text', () => {
      const oldText = '';
      const newText = 'Line 1\nLine 2';

      const diff = getTextDiff(oldText, newText);

      expect(diff.added).toHaveLength(2);
      expect(diff.removed).toHaveLength(0);
    });

    it('should handle empty new text', () => {
      const oldText = 'Line 1\nLine 2';
      const newText = '';

      const diff = getTextDiff(oldText, newText);

      expect(diff.removed).toHaveLength(2);
      expect(diff.added).toHaveLength(0);
    });

    it('should handle identical text', () => {
      const text = 'Line 1\nLine 2\nLine 3';

      const diff = getTextDiff(text, text);

      expect(diff.unchanged).toHaveLength(3);
      expect(diff.added).toHaveLength(0);
      expect(diff.removed).toHaveLength(0);
    });
  });

  describe('formatVersionComment', () => {
    it('should return existing comment', () => {
      const comment = formatVersionComment(mockVersion1);

      expect(comment).toBe('Initial version');
    });

    it('should generate default comment when none exists', () => {
      const versionNoComment = { ...mockVersion1, comment: '' };

      const comment = formatVersionComment(versionNoComment);

      expect(comment).toBe('Version 1 created');
    });

    it('should handle undefined comment', () => {
      const versionNoComment = { ...mockVersion1, comment: undefined as any };

      const comment = formatVersionComment(versionNoComment);

      expect(comment).toBe('Version 1 created');
    });
  });

  describe('canRollback', () => {
    it('should allow admin to rollback', () => {
      expect(canRollback('admin')).toBe(true);
      expect(canRollback('Admin')).toBe(true);
      expect(canRollback('ADMIN')).toBe(true);
    });

    it('should allow pm to rollback', () => {
      expect(canRollback('pm')).toBe(true);
      expect(canRollback('PM')).toBe(true);
    });

    it('should allow developer to rollback', () => {
      expect(canRollback('developer')).toBe(true);
      expect(canRollback('Developer')).toBe(true);
    });

    it('should not allow viewer to rollback', () => {
      expect(canRollback('viewer')).toBe(false);
    });

    it('should not allow guest to rollback', () => {
      expect(canRollback('guest')).toBe(false);
    });

    it('should not allow unknown roles to rollback', () => {
      expect(canRollback('unknown')).toBe(false);
      expect(canRollback('')).toBe(false);
    });
  });
});
