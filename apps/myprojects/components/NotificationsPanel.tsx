'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, Trash2, Filter } from 'lucide-react';
import { Button } from '@allied-impact/ui';
import { getActivityIcon } from './ActivityFeed';

export interface Notification {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  type: 'comment' | 'approval' | 'milestone' | 'deadline' | 'status_change' | 'assignment' | 'mention';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  metadata?: {
    entityId?: string;
    entityType?: string;
    [key: string]: any;
  };
}

interface NotificationsPanelProps {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { getAuthInstance } = await import('@allied-impact/auth');
      const { getFirestore, collection, query, where, orderBy, limit, onSnapshot } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const auth = getAuthInstance();
      if (!auth.currentUser) return;

      const db = getFirestore(getApp());
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notifs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
          } as Notification;
        });
        
        setNotifications(notifs);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { getFirestore, doc, updateDoc, writeBatch } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      const batch = writeBatch(db);

      const unreadNotifs = notifications.filter(n => !n.read);
      unreadNotifs.forEach(notif => {
        batch.update(doc(db, 'notifications', notif.id), { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    onClose();
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      comment: 'message-square',
      approval: 'check-circle',
      milestone: 'flag',
      deadline: 'clock',
      status_change: 'refresh-cw',
      assignment: 'user-plus',
      mention: 'at-sign'
    };
    return iconMap[type] || 'bell';
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-background border-l shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters & Actions */}
        <div className="p-4 border-b flex items-center justify-between gap-2">
          <div className="flex gap-2">
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
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 border rounded-lg animate-pulse">
                  <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-1/2 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              {filter === 'unread' && (
                <button
                  onClick={() => setFilter('all')}
                  className="text-primary hover:underline text-sm mt-2"
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent/5 cursor-pointer transition-colors relative group ${
                    !notification.read ? 'bg-accent/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                  )}

                  <div className="flex gap-3 pl-4">
                    {/* Icon would go here - simplified for now */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">{notification.title}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1 hover:bg-accent rounded"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 hover:bg-destructive/10 text-destructive rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Helper function to create notifications
export async function createNotification(
  userId: string,
  projectId: string,
  projectName: string,
  type: Notification['type'],
  title: string,
  message: string,
  actionUrl?: string,
  metadata?: Notification['metadata']
): Promise<void> {
  try {
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    
    const db = getFirestore(getApp());
    await addDoc(collection(db, 'notifications'), {
      userId,
      projectId,
      projectName,
      type,
      title,
      message,
      actionUrl,
      metadata: metadata || {},
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
