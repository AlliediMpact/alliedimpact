/**
 * Notification Center Component
 * Displays in-app notifications with real-time updates
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  type Notification,
} from '@/services/notificationService';
import { useRealtime } from '@/hooks/useRealtime';
import { where, orderBy, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

export function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time notifications
  const { data: notifications, loading } = useRealtime<Notification>({
    collectionName: 'edutech_notifications',
    constraints: user
      ? [
          where('userId', '==', user.userId),
          orderBy('createdAt', 'desc'),
          limit(20),
        ]
      : [],
    enabled: !!user,
  });

  // Update unread count
  useEffect(() => {
    if (user) {
      getUnreadCount(user.userId).then(setUnreadCount).catch(console.error);
    }
  }, [user, notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.userId);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-background border rounded-lg shadow-lg z-50 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-primary-blue hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto flex-1">
              {loading && (
                <div className="p-8 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              )}

              {!loading &&
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.notificationId}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Individual Notification Item
function NotificationItem({
  notification,
  onMarkAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.notificationId);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      className={cn(
        'p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer',
        !notification.read && 'bg-primary-blue/5'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Unread Indicator */}
        {!notification.read && (
          <div className="w-2 h-2 bg-primary-blue rounded-full mt-2 flex-shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">{notification.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(notification.createdAt.toDate())}
          </p>
        </div>

        {/* Mark as Read Button */}
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.notificationId);
            }}
            className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
            aria-label="Mark as read"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
