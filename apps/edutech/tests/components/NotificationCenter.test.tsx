/**
 * Tests for NotificationCenter component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from '../../src/components/notifications/NotificationCenter';

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/notificationService', () => ({
  getUserNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
  getUnreadCount: jest.fn(),
}));

jest.mock('@/hooks/useRealtime', () => ({
  useRealtime: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

const { useAuth } = require('@/contexts/AuthContext');
const { useRealtime } = require('@/hooks/useRealtime');
const notificationService = require('@/services/notificationService');

describe('NotificationCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering without user', () => {
    it('should not render when user is not authenticated', () => {
      useAuth.mockReturnValue({ user: null });
      useRealtime.mockReturnValue({ data: [], loading: false });

      const { container } = render(<NotificationCenter />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('rendering with authenticated user', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
        },
      });
      notificationService.getUnreadCount.mockResolvedValue(3);
    });

    it('should render bell icon', () => {
      useRealtime.mockReturnValue({ data: [], loading: false });

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toBeInTheDocument();
    });

    it('should show unread count badge when there are unread notifications', async () => {
      useRealtime.mockReturnValue({ data: [], loading: false });

      render(<NotificationCenter />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should not show badge when no unread notifications', async () => {
      useRealtime.mockReturnValue({ data: [], loading: false });
      notificationService.getUnreadCount.mockResolvedValue(0);

      render(<NotificationCenter />);

      await waitFor(() => {
        expect(screen.queryByText('3')).not.toBeInTheDocument();
      });
    });

    it('should toggle notification panel when bell clicked', () => {
      useRealtime.mockReturnValue({ data: [], loading: false });

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });

      // Open panel
      fireEvent.click(bellButton);
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();

      // Close panel
      fireEvent.click(bellButton);
      expect(screen.queryByText(/mark all as read/i)).not.toBeInTheDocument();
    });
  });

  describe('notification list', () => {
    const mockNotifications = [
      {
        id: 'notif1',
        userId: 'user123',
        title: 'New Course Available',
        message: 'Check out the new React course',
        type: 'course',
        read: false,
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'notif2',
        userId: 'user123',
        title: 'Assignment Graded',
        message: 'Your assignment has been graded',
        type: 'grade',
        read: false,
        createdAt: new Date('2024-01-14T10:00:00Z'),
      },
      {
        id: 'notif3',
        userId: 'user123',
        title: 'Forum Reply',
        message: 'Someone replied to your post',
        type: 'forum',
        read: true,
        createdAt: new Date('2024-01-13T10:00:00Z'),
      },
    ];

    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
        },
      });
      notificationService.getUnreadCount.mockResolvedValue(2);
    });

    it('should display all notifications', () => {
      useRealtime.mockReturnValue({ data: mockNotifications, loading: false });

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      expect(screen.getByText('New Course Available')).toBeInTheDocument();
      expect(screen.getByText('Assignment Graded')).toBeInTheDocument();
      expect(screen.getByText('Forum Reply')).toBeInTheDocument();
    });

    it('should show loading state while fetching notifications', () => {
      useRealtime.mockReturnValue({ data: [], loading: true });

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show empty state when no notifications', () => {
      useRealtime.mockReturnValue({ data: [], loading: false });

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
    });

    it('should display notification timestamps', () => {
      useRealtime.mockReturnValue({ data: mockNotifications, loading: false });

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      // Should show relative times
      const timestamps = screen.getAllByText(/ago|just now/i);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('should visually distinguish unread notifications', () => {
      useRealtime.mockReturnValue({ data: mockNotifications, loading: false });

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      // Unread notifications should have different styling
      const unreadNotification = screen.getByText('New Course Available').closest('div');
      expect(unreadNotification).toHaveClass(/unread|font-semibold/);
    });
  });

  describe('mark as read functionality', () => {
    const mockNotifications = [
      {
        id: 'notif1',
        userId: 'user123',
        title: 'New Course',
        message: 'Check out the new course',
        type: 'course',
        read: false,
        createdAt: new Date(),
      },
    ];

    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
        },
      });
      useRealtime.mockReturnValue({ data: mockNotifications, loading: false });
      notificationService.getUnreadCount.mockResolvedValue(1);
      notificationService.markNotificationAsRead.mockResolvedValue(undefined);
    });

    it('should mark notification as read when clicked', async () => {
      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      const notification = screen.getByText('New Course');
      fireEvent.click(notification);

      await waitFor(() => {
        expect(notificationService.markNotificationAsRead).toHaveBeenCalledWith('notif1');
      });
    });

    it('should decrease unread count when notification marked as read', async () => {
      const { rerender } = render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      const notification = screen.getByText('New Course');
      fireEvent.click(notification);

      await waitFor(() => {
        expect(notificationService.markNotificationAsRead).toHaveBeenCalled();
      });

      // Badge should disappear (count reduced to 0)
      notificationService.getUnreadCount.mockResolvedValue(0);
      rerender(<NotificationCenter />);

      await waitFor(() => {
        expect(screen.queryByText('1')).not.toBeInTheDocument();
      });
    });
  });

  describe('mark all as read functionality', () => {
    const mockNotifications = [
      {
        id: 'notif1',
        userId: 'user123',
        title: 'Notification 1',
        message: 'Message 1',
        type: 'course',
        read: false,
        createdAt: new Date(),
      },
      {
        id: 'notif2',
        userId: 'user123',
        title: 'Notification 2',
        message: 'Message 2',
        type: 'grade',
        read: false,
        createdAt: new Date(),
      },
    ];

    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
        },
      });
      useRealtime.mockReturnValue({ data: mockNotifications, loading: false });
      notificationService.getUnreadCount.mockResolvedValue(2);
      notificationService.markAllNotificationsAsRead.mockResolvedValue(undefined);
    });

    it('should show mark all as read button', () => {
      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      expect(screen.getByRole('button', { name: /mark all as read/i })).toBeInTheDocument();
    });

    it('should mark all notifications as read when button clicked', async () => {
      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      const markAllButton = screen.getByRole('button', { name: /mark all as read/i });
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(notificationService.markAllNotificationsAsRead).toHaveBeenCalledWith('user123');
      });
    });

    it('should reset unread count to zero after marking all as read', async () => {
      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      // Initially shows 2 unread
      expect(screen.getByText('2')).toBeInTheDocument();

      const markAllButton = screen.getByRole('button', { name: /mark all as read/i });
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(screen.queryByText('2')).not.toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
        },
      });
      useRealtime.mockReturnValue({ data: [], loading: false });
    });

    it('should handle getUnreadCount errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      notificationService.getUnreadCount.mockRejectedValue(new Error('Network error'));

      render(<NotificationCenter />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should handle markNotificationAsRead errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockNotifications = [
        {
          id: 'notif1',
          userId: 'user123',
          title: 'Test',
          message: 'Test message',
          type: 'course',
          read: false,
          createdAt: new Date(),
        },
      ];
      
      useRealtime.mockReturnValue({ data: mockNotifications, loading: false });
      notificationService.getUnreadCount.mockResolvedValue(1);
      notificationService.markNotificationAsRead.mockRejectedValue(new Error('Update failed'));

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      const notification = screen.getByText('Test');
      fireEvent.click(notification);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should handle markAllNotificationsAsRead errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      useRealtime.mockReturnValue({ data: [], loading: false });
      notificationService.getUnreadCount.mockResolvedValue(2);
      notificationService.markAllNotificationsAsRead.mockRejectedValue(
        new Error('Batch update failed')
      );

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      const markAllButton = screen.getByRole('button', { name: /mark all as read/i });
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        user: {
          userId: 'user123',
          email: 'user@example.com',
        },
      });
      useRealtime.mockReturnValue({ data: [], loading: false });
      notificationService.getUnreadCount.mockResolvedValue(0);
    });

    it('should have accessible bell button with aria-label', () => {
      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toHaveAttribute('aria-label');
    });

    it('should have aria-expanded attribute on bell button', () => {
      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(bellButton);
      expect(bellButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have accessible notification items', () => {
      const mockNotifications = [
        {
          id: 'notif1',
          userId: 'user123',
          title: 'Test Notification',
          message: 'Test message',
          type: 'course',
          read: false,
          createdAt: new Date(),
        },
      ];

      useRealtime.mockReturnValue({ data: mockNotifications, loading: false });

      render(<NotificationCenter />);

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(bellButton);

      const notification = screen.getByText('Test Notification');
      expect(notification).toBeInTheDocument();
    });
  });
});
