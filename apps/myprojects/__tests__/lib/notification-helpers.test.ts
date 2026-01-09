import {
  sendNotification,
  sendNotificationToMultiple,
  notifyNewComment,
  notifyDeliverableApproval,
  NotificationTypes,
} from '../../lib/notification-helpers';

// Mock the createNotification function
jest.mock('../../components/NotificationsPanel', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

describe('notification-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('NotificationTypes', () => {
    it('should have correct notification type constants', () => {
      expect(NotificationTypes.COMMENT).toBe('comment');
      expect(NotificationTypes.APPROVAL).toBe('approval');
      expect(NotificationTypes.MILESTONE).toBe('milestone');
      expect(NotificationTypes.DEADLINE).toBe('deadline');
      expect(NotificationTypes.STATUS_CHANGE).toBe('status_change');
      expect(NotificationTypes.ASSIGNMENT).toBe('assignment');
      expect(NotificationTypes.MENTION).toBe('mention');
    });
  });

  describe('sendNotification', () => {
    it('should send notification with all parameters', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      
      await sendNotification(
        'user123',
        'project123',
        'Test Project',
        'milestone',
        'Milestone Created',
        'A new milestone was created',
        '/milestones/123',
        { key: 'value' }
      );

      expect(createNotification).toHaveBeenCalledWith(
        'user123',
        'project123',
        'Test Project',
        'milestone',
        'Milestone Created',
        'A new milestone was created',
        '/milestones/123',
        { key: 'value' }
      );
    });

    it('should send notification without optional parameters', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      
      await sendNotification(
        'user123',
        'project123',
        'Test Project',
        'comment',
        'New Comment',
        'Someone commented on your milestone'
      );

      expect(createNotification).toHaveBeenCalledWith(
        'user123',
        'project123',
        'Test Project',
        'comment',
        'New Comment',
        'Someone commented on your milestone',
        undefined,
        undefined
      );
    });
  });

  describe('sendNotificationToMultiple', () => {
    it('should send notifications to multiple users', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      const userIds = ['user1', 'user2', 'user3'];
      
      await sendNotificationToMultiple(
        userIds,
        'project123',
        'Test Project',
        'milestone',
        'Team Notification',
        'Something important happened'
      );

      expect(createNotification).toHaveBeenCalledTimes(3);
      expect(createNotification).toHaveBeenCalledWith(
        'user1',
        'project123',
        'Test Project',
        'milestone',
        'Team Notification',
        'Something important happened',
        undefined,
        undefined
      );
    });

    it('should handle empty user list', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      
      await sendNotificationToMultiple(
        [],
        'project123',
        'Test Project',
        'milestone',
        'Team Notification',
        'Something important happened'
      );

      expect(createNotification).not.toHaveBeenCalled();
    });

    it('should send notifications with action URL and metadata', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      const userIds = ['user1', 'user2'];
      const metadata = { priority: 'high' };
      
      await sendNotificationToMultiple(
        userIds,
        'project123',
        'Test Project',
        'deadline',
        'Deadline Alert',
        'Deadline approaching',
        '/milestones/123',
        metadata
      );

      expect(createNotification).toHaveBeenCalledTimes(2);
      userIds.forEach(userId => {
        expect(createNotification).toHaveBeenCalledWith(
          userId,
          'project123',
          'Test Project',
          'deadline',
          'Deadline Alert',
          'Deadline approaching',
          '/milestones/123',
          metadata
        );
      });
    });
  });

  describe('notifyNewComment', () => {
    it('should send comment notification with correct format', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      
      await notifyNewComment(
        'user123',
        'project123',
        'Test Project',
        'John Doe',
        'milestone',
        'Phase 1',
        'This is a test comment',
        '/milestones/123'
      );

      expect(createNotification).toHaveBeenCalledWith(
        'user123',
        'project123',
        'Test Project',
        'comment',
        'New Comment',
        'John Doe commented on milestone "Phase 1": This is a test comment',
        '/milestones/123',
        { entityType: 'milestone', entityName: 'Phase 1', commenterName: 'John Doe' }
      );
    });

    it('should truncate long comments', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      const longComment = 'A'.repeat(100);
      
      await notifyNewComment(
        'user123',
        'project123',
        'Test Project',
        'John Doe',
        'deliverable',
        'Design Files',
        longComment,
        '/deliverables/123'
      );

      expect(createNotification).toHaveBeenCalled();
      const callArgs = (createNotification as jest.Mock).mock.calls[0];
      const message = callArgs[5];
      expect(message).toContain('...');
      expect(message.length).toBeLessThan(longComment.length + 50);
    });

    it('should not truncate short comments', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      const shortComment = 'Short comment';
      
      await notifyNewComment(
        'user123',
        'project123',
        'Test Project',
        'Jane Smith',
        'ticket',
        'Bug Report',
        shortComment,
        '/tickets/123'
      );

      expect(createNotification).toHaveBeenCalled();
      const callArgs = (createNotification as jest.Mock).mock.calls[0];
      const message = callArgs[5];
      expect(message).toContain(shortComment);
      expect(message).not.toContain('...');
    });

    it('should handle empty comment text', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      
      await notifyNewComment(
        'user123',
        'project123',
        'Test Project',
        'John Doe',
        'milestone',
        'Phase 1',
        '',
        '/milestones/123'
      );

      expect(createNotification).toHaveBeenCalled();
      const callArgs = (createNotification as jest.Mock).mock.calls[0];
      const message = callArgs[5];
      expect(message).toContain('John Doe commented on milestone "Phase 1":');
    });
  });

  describe('notifyDeliverableApproval', () => {
    it('should send approval notification with correct format', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      
      await notifyDeliverableApproval(
        'user123',
        'project123',
        'Test Project',
        'Design Mockups',
        'Client Name',
        '/deliverables/123'
      );

      expect(createNotification).toHaveBeenCalledWith(
        'user123',
        'project123',
        'Test Project',
        'approval',
        'Deliverable Approved',
        'Client Name approved deliverable "Design Mockups"',
        '/deliverables/123',
        { deliverableName: 'Design Mockups', approverName: 'Client Name' }
      );
    });

    it('should handle special characters in deliverable name', async () => {
      const { createNotification } = require('../../components/NotificationsPanel');
      
      await notifyDeliverableApproval(
        'user123',
        'project123',
        'Test Project',
        'Design "Final" v2.0',
        'Approver Name',
        '/deliverables/123'
      );

      expect(createNotification).toHaveBeenCalled();
      const callArgs = (createNotification as jest.Mock).mock.calls[0];
      const message = callArgs[5];
      expect(message).toContain('Design "Final" v2.0');
    });
  });
});
