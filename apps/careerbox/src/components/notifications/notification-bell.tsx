'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell, Check, X, Briefcase, MessageCircle, Calendar, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'application' | 'message' | 'interview' | 'match';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export function NotificationBell() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'en';
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data
      setNotifications([
        {
          id: '1',
          type: 'application',
          title: 'Application Status Update',
          description: 'Your application for Senior Software Engineer has been reviewed',
          timestamp: '2026-01-10T10:30:00Z',
          read: false,
          actionUrl: '/dashboard/individual/applications',
        },
        {
          id: '2',
          type: 'match',
          title: 'New Job Match',
          description: '3 new jobs match your profile',
          timestamp: '2026-01-10T09:15:00Z',
          read: false,
          actionUrl: '/dashboard/individual/matches',
        },
        {
          id: '3',
          type: 'message',
          title: 'New Message',
          description: 'Tech Solutions SA sent you a message',
          timestamp: '2026-01-09T16:45:00Z',
          read: true,
          actionUrl: '/dashboard/individual/messages',
        },
        {
          id: '4',
          type: 'interview',
          title: 'Interview Scheduled',
          description: 'Interview scheduled for Full Stack Developer position',
          timestamp: '2026-01-09T14:20:00Z',
          read: true,
          actionUrl: '/dashboard/individual/applications',
        },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      application: Briefcase,
      message: MessageCircle,
      interview: Calendar,
      match: UserCheck,
    };
    const Icon = icons[type];
    return <Icon className="h-5 w-5" />;
  };

  const getNotificationColor = (type: Notification['type']) => {
    const colors = {
      application: 'bg-blue-100 text-blue-600',
      message: 'bg-green-100 text-green-600',
      interview: 'bg-yellow-100 text-yellow-600',
      match: 'bg-purple-100 text-purple-600',
    };
    return colors[type];
  };

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Call API
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    // TODO: Call API
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id, {} as React.MouseEvent);
    }
    if (notification.actionUrl) {
      router.push(`/${locale}${notification.actionUrl}`);
    }
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  router.push(`/${locale}/notifications`);
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
