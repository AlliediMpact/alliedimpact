'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '../lib/dashboard-context';
import { Card } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { 
  Bell, 
  BellOff, 
  Check, 
  Trash2, 
  Filter,
  Info,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
  Award,
  X
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'payment' | 'social' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationsCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const notificationIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  payment: DollarSign,
  social: Users,
  achievement: Award,
};

const notificationColors = {
  info: 'text-blue-600 bg-blue-100',
  success: 'text-green-600 bg-green-100',
  warning: 'text-yellow-600 bg-yellow-100',
  payment: 'text-purple-600 bg-purple-100',
  social: 'text-pink-600 bg-pink-100',
  achievement: 'text-orange-600 bg-orange-100',
};

export function NotificationsCenter({ isOpen = true, onClose }: NotificationsCenterProps) {
  const { platformUser } = useDashboard();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (platformUser) {
      loadNotifications();
    }
  }, [platformUser]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Implement notifications endpoints from @allied-impact/notifications
      // For now, showing mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'payment',
          title: 'Payment Successful',
          message: 'Your subscription to Coin Box Professional has been activated.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          actionUrl: '/subscriptions',
          actionLabel: 'View Subscription',
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Course Completed! 🎉',
          message: 'You have completed "Financial Literacy 101" and earned a certificate.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          actionUrl: '/(learner)',
          actionLabel: 'View Certificate',
        },
        {
          id: '3',
          type: 'social',
          title: 'New Team Member',
          message: 'John Doe has joined your organization as an admin.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          read: true,
          actionUrl: '/(organization)',
          actionLabel: 'View Team',
        },
        {
          id: '4',
          type: 'info',
          title: 'Project Milestone Reached',
          message: 'Website Redesign milestone 3 has been completed ahead of schedule.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          actionUrl: '/(client)',
          actionLabel: 'View Project',
        },
        {
          id: '5',
          type: 'success',
          title: 'Impact Report Ready',
          message: 'Q4 2025 impact report for Ubuntu Foundation is now available.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          read: true,
          actionUrl: '/(sponsor)',
          actionLabel: 'View Report',
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getRelativeTime = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotifications.map(notification => {
                const Icon = notificationIcons[notification.type];
                const colorClasses = notificationColors[notification.type];
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 mb-2 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                      !notification.read ? 'bg-primary/5 border-primary/20' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-sm">{notification.title}</h3>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {getRelativeTime(notification.timestamp)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {notification.actionUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Navigate to actionUrl
                                  window.location.href = notification.actionUrl;
                                }}
                              >
                                {notification.actionLabel}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" onClick={clearAll}>
              Clear All Notifications
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

export default NotificationsCenter;
