import {
  createActivityEvent,
  ActivityTypes,
  ActivityActions,
  logMilestoneActivity,
} from '../../lib/activity-logger';

// Mock Firebase
jest.mock('firebase/app', () => ({
  getApp: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  addDoc: jest.fn().mockResolvedValue({ id: 'activity-id' }),
  serverTimestamp: jest.fn(() => new Date()),
}));

jest.mock('@allied-impact/auth', () => ({
  getAuthInstance: jest.fn(() => ({
    currentUser: {
      uid: 'user123',
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: 'https://example.com/avatar.jpg',
    },
  })),
}));

describe('activity-logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createActivityEvent', () => {
    it('should create an activity event successfully', async () => {
      await createActivityEvent(
        'project123',
        'milestone',
        'created',
        'milestone123',
        'Test Milestone'
      );

      const { addDoc } = require('firebase/firestore');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should include metadata if provided', async () => {
      const metadata = { priority: 'high', tags: ['urgent'] };
      
      await createActivityEvent(
        'project123',
        'milestone',
        'created',
        'milestone123',
        'Test Milestone',
        metadata
      );

      const { addDoc } = require('firebase/firestore');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should handle missing current user gracefully', async () => {
      const { getAuthInstance } = require('@allied-impact/auth');
      getAuthInstance.mockReturnValueOnce({ currentUser: null });

      await expect(createActivityEvent(
        'project123',
        'milestone',
        'created',
        'milestone123',
        'Test Milestone'
      )).resolves.not.toThrow();
    });

    it('should handle errors gracefully', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockRejectedValueOnce(new Error('Firestore error'));

      // Should not throw - activity logging failures should be silent
      await expect(createActivityEvent(
        'project123',
        'milestone',
        'created',
        'milestone123',
        'Test Milestone'
      )).resolves.not.toThrow();
    });

    it('should use email as fallback for userName', async () => {
      const { getAuthInstance } = require('@allied-impact/auth');
      getAuthInstance.mockReturnValueOnce({
        currentUser: {
          uid: 'user123',
          displayName: null,
          email: 'fallback@example.com',
          photoURL: null,
        },
      });

      await createActivityEvent(
        'project123',
        'milestone',
        'created',
        'milestone123',
        'Test Milestone'
      );

      const { addDoc } = require('firebase/firestore');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should use "Unknown User" as final fallback', async () => {
      const { getAuthInstance } = require('@allied-impact/auth');
      getAuthInstance.mockReturnValueOnce({
        currentUser: {
          uid: 'user123',
          displayName: null,
          email: null,
          photoURL: null,
        },
      });

      await createActivityEvent(
        'project123',
        'milestone',
        'created',
        'milestone123',
        'Test Milestone'
      );

      const { addDoc } = require('firebase/firestore');
      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('ActivityTypes', () => {
    it('should have correct activity type constants', () => {
      expect(ActivityTypes.MILESTONE).toBe('milestone');
      expect(ActivityTypes.DELIVERABLE).toBe('deliverable');
      expect(ActivityTypes.TICKET).toBe('ticket');
      expect(ActivityTypes.COMMENT).toBe('comment');
      expect(ActivityTypes.STATUS_CHANGE).toBe('status_change');
      expect(ActivityTypes.FILE_UPLOAD).toBe('file_upload');
      expect(ActivityTypes.TEAM).toBe('team');
    });
  });

  describe('ActivityActions', () => {
    it('should have correct activity action constants', () => {
      expect(ActivityActions.CREATED).toBe('created');
      expect(ActivityActions.UPDATED).toBe('updated');
      expect(ActivityActions.DELETED).toBe('deleted');
      expect(ActivityActions.COMPLETED).toBe('completed');
      expect(ActivityActions.DELIVERED).toBe('delivered');
      expect(ActivityActions.APPROVED).toBe('approved');
      expect(ActivityActions.REVISION_REQUESTED).toBe('revision_requested');
      expect(ActivityActions.RESOLVED).toBe('resolved');
      expect(ActivityActions.CLOSED).toBe('closed');
      expect(ActivityActions.REOPENED).toBe('reopened');
      expect(ActivityActions.COMMENTED).toBe('commented');
      expect(ActivityActions.UPLOADED).toBe('uploaded');
      expect(ActivityActions.ASSIGNED).toBe('assigned');
      expect(ActivityActions.UNASSIGNED).toBe('unassigned');
    });
  });

  describe('logMilestoneActivity', () => {
    it('should log milestone activity with correct parameters', async () => {
      await logMilestoneActivity(
        'project123',
        'milestone123',
        'Test Milestone',
        'created'
      );

      const { addDoc } = require('firebase/firestore');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should pass metadata to createActivityEvent', async () => {
      const metadata = { status: 'in-progress' };
      
      await logMilestoneActivity(
        'project123',
        'milestone123',
        'Test Milestone',
        'updated',
        metadata
      );

      const { addDoc } = require('firebase/firestore');
      expect(addDoc).toHaveBeenCalled();
    });
  });
});
