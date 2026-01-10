'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Bell, Check, CheckCheck, Briefcase, MessageCircle, Calendar, UserCheck, Trash2, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useToastHelpers } from '@/components/ui/toast';

interface Notification {
  id: string;
  type: 'application' | 'message' | 'interview' | 'match' | 'offer' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const params = useParams();
  const locale = params?.locale as string || 'en';
  const { success: showSuccess } = useToastHelpers();

  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // TODO: Call API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - expanded list
      setNotifications([
        {
          id: '1',
          type: 'application',
          title: 'Application Status Update',
          description: 'Your application for Senior Software Engineer at Tech Solutions SA has been reviewed',
          timestamp: '2026-01-10T10:30:00Z',
          read: false,
          actionUrl: '/dashboard/individual/applications',
        },
        {
          id: '2',
          type: 'match',
          title: 'New Job Matches',
          description: '3 new jobs match your profile. Check them out now!',
          timestamp: '2026-01-10T09:15:00Z',
          read: false,
          actionUrl: '/dashboard/individual/matches',
        },
        {
          id: '3',
          type: 'message',
          title: 'New Message from Tech Solutions SA',
          description: 'The hiring manager has sent you a message regarding your application',
          timestamp: '2026-01-09T16:45:00Z',
          read: false,
          actionUrl: '/dashboard/individual/messages',
        },
        {
          id: '4',
          type: 'interview',
          title: 'Interview Scheduled',
          description: 'Interview scheduled for Full Stack Developer position on January 15, 2026 at 10:00 AM',
          timestamp: '2026-01-09T14:20:00Z',
          read: true,
          actionUrl: '/dashboard/individual/applications',
        },
        {
          id: '5',
          type: 'offer',
          title: 'Job Offer Received',
          description: 'Congratulations! StartupCo has extended an offer for the Frontend Developer position',
          timestamp: '2026-01-08T11:30:00Z',
          read: true,
          actionUrl: '/dashboard/individual/applications',
        },
        {
          id: '6',
          type: 'application',
          title: 'Application Received',
          description: 'Your application for DevOps Engineer has been received and is under review',
          timestamp: '2026-01-08T09:00:00Z',
          read: true,
          actionUrl: '/dashboard/individual/applications',
        },
        {
          id: '7',
          type: 'system',
          title: 'Profile Completion',
          description: 'Your profile is 85% complete. Add more details to increase your match rate',
          timestamp: '2026-01-07T15:00:00Z',
          read: true,
          actionUrl: '/profile/individual/edit',
        },
        {
          id: '8',
          type: 'match',
          title: 'Weekly Match Update',
          description: '12 new jobs match your preferences this week',
          timestamp: '2026-01-05T08:00:00Z',
          read: true,
          actionUrl: '/dashboard/individual/matches',
        },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      application: Briefcase,
      message: MessageCircle,
      interview: Calendar,
      match: UserCheck,
      offer: CheckCheck,
      system: Bell,
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
      offer: 'bg-emerald-100 text-emerald-600',
      system: 'bg-gray-100 text-gray-600',
    };
    return colors[type];
  };

  const handleMarkAsRead = async (notificationId: string) => {
    // TODO: Call API
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    // TODO: Call API
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showSuccess('All notifications marked as read');
  };

  const handleDelete = async (notificationId: string) => {
    // TODO: Call API
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    showSuccess('Notification deleted');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesRead =
      filterRead === 'all' ||
      (filterRead === 'unread' && !n.read) ||
      (filterRead === 'read' && n.read);
    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <LoadingSkeleton variant="text" width="200px" height="32px" className="mb-6" />
          <LoadingSkeleton variant="card" height="120px" count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Type Filter */}
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by Type
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterType === 'application' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('application')}
                  >
                    Applications
                  </Button>
                  <Button
                    variant={filterType === 'message' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('message')}
                  >
                    Messages
                  </Button>
                  <Button
                    variant={filterType === 'interview' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('interview')}
                  >
                    Interviews
                  </Button>
                  <Button
                    variant={filterType === 'match' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType('match')}
                  >
                    Matches
                  </Button>
                </div>
              </div>

              {/* Read/Unread Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={filterRead === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterRead('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterRead === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterRead('unread')}
                  >
                    Unread
                  </Button>
                  <Button
                    variant={filterRead === 'read' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterRead('read')}
                  >
                    Read
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You have no notifications matching your filters"
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`${!notification.read ? 'border-l-4 border-l-blue-600 bg-blue-50' : ''} hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{notification.description}</p>
                      <p className="text-sm text-gray-500 mb-3">
                        {formatTimestamp(notification.timestamp)}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {notification.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/${locale}${notification.actionUrl}`}
                          >
                            View Details
                          </Button>
                        )}
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
