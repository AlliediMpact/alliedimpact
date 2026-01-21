'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subscribeToNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && notification.notificationId) {
      await markNotificationAsRead(notification.notificationId);
    }
    
    if (notification.link) {
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (currentUser) {
      await markAllNotificationsAsRead(currentUser.uid);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-hidden shadow-lg z-50">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {notification.link ? (
                      <Link href={notification.link} className="block">
                        <NotificationItem notification={notification} />
                      </Link>
                    ) : (
                      <NotificationItem notification={notification} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const getIcon = () => {
    switch (notification.type) {
      case 'vote_confirmed':
        return '✅';
      case 'tournament_published':
        return '🏆';
      case 'wallet_topup':
        return '💰';
      case 'tournament_closed':
        return '🔒';
      case 'winner_announced':
        return '🎉';
      default:
        return '📢';
    }
  };

  return (
    <div className="flex gap-3">
      <div className="text-2xl">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm">{notification.title}</p>
          {!notification.read && (
            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-2">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
