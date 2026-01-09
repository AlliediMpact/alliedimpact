'use client';

import { useState, useEffect } from 'react';
import { Clock, Filter, Download, User, CheckCircle, FileText, MessageSquare, AlertCircle, Flag, Package } from 'lucide-react';
import { Button } from '@allied-impact/ui';

export interface ActivityEvent {
  id: string;
  type: 'milestone' | 'deliverable' | 'ticket' | 'comment' | 'status_change' | 'file_upload' | 'team';
  action: string;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: Date;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    fileCount?: number;
    commentText?: string;
    [key: string]: any;
  };
}

interface ActivityFeedProps {
  projectId: string;
  maxItems?: number;
  showFilters?: boolean;
}

export default function ActivityFeed({ projectId, maxItems = 50, showFilters = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredActivities, setFilteredActivities] = useState<ActivityEvent[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const activityTypes = [
    { value: 'milestone', label: 'Milestones', icon: Flag },
    { value: 'deliverable', label: 'Deliverables', icon: Package },
    { value: 'ticket', label: 'Tickets', icon: MessageSquare },
    { value: 'comment', label: 'Comments', icon: MessageSquare },
    { value: 'status_change', label: 'Status Changes', icon: CheckCircle },
    { value: 'file_upload', label: 'File Uploads', icon: FileText },
  ];

  useEffect(() => {
    loadActivities();
  }, [projectId]);

  useEffect(() => {
    if (selectedTypes.length === 0) {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(a => selectedTypes.includes(a.type)));
    }
  }, [activities, selectedTypes]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const { getFirestore, collection, query, where, orderBy, limit, onSnapshot } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('projectId', '==', projectId),
        orderBy('timestamp', 'desc'),
        limit(maxItems)
      );

      const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
        const events = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp.toDate(),
          } as ActivityEvent;
        });
        
        setActivities(events);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to load activities:', error);
      setLoading(false);
    }
  };

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const exportActivities = () => {
    const csv = [
      ['Timestamp', 'Type', 'Action', 'User', 'Entity'].join(','),
      ...filteredActivities.map(a =>
        [
          a.timestamp.toISOString(),
          a.type,
          a.action,
          a.userName,
          a.entityName
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Flag className="h-4 w-4 text-purple-600" />;
      case 'deliverable':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'ticket':
        return <MessageSquare className="h-4 w-4 text-orange-600" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'file_upload':
        return <FileText className="h-4 w-4 text-indigo-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
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

  const renderActivityMessage = (activity: ActivityEvent) => {
    const { action, entityName, metadata } = activity;

    switch (activity.type) {
      case 'milestone':
        if (action === 'created') return `created milestone "${entityName}"`;
        if (action === 'completed') return `completed milestone "${entityName}"`;
        if (action === 'updated') return `updated milestone "${entityName}"`;
        break;
      case 'deliverable':
        if (action === 'created') return `created deliverable "${entityName}"`;
        if (action === 'delivered') return `marked deliverable "${entityName}" as delivered`;
        if (action === 'approved') return `approved deliverable "${entityName}"`;
        if (action === 'revision_requested') return `requested revision for "${entityName}"`;
        break;
      case 'ticket':
        if (action === 'created') return `created ticket "${entityName}"`;
        if (action === 'resolved') return `resolved ticket "${entityName}"`;
        if (action === 'closed') return `closed ticket "${entityName}"`;
        break;
      case 'comment':
        return `commented on "${entityName}"`;
      case 'status_change':
        return `changed status of "${entityName}" from ${metadata?.oldValue} to ${metadata?.newValue}`;
      case 'file_upload':
        const count = metadata?.fileCount || 1;
        return `uploaded ${count} file${count > 1 ? 's' : ''} to "${entityName}"`;
    }

    return action;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-3 p-3 border rounded-lg animate-pulse">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded"></div>
              <div className="h-3 w-1/2 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Activity Feed</h2>
          <span className="text-sm text-muted-foreground">
            ({filteredActivities.length} {selectedTypes.length > 0 ? 'filtered' : 'total'})
          </span>
        </div>

        {showFilters && (
          <div className="flex gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {selectedTypes.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                    {selectedTypes.length}
                  </span>
                )}
              </Button>

              {showFilterMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowFilterMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-background border rounded-lg shadow-lg z-50 p-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium mb-2">Activity Types</div>
                      {activityTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <label
                            key={type.value}
                            className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTypes.includes(type.value)}
                              onChange={() => toggleTypeFilter(type.value)}
                              className="rounded"
                            />
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{type.label}</span>
                          </label>
                        );
                      })}
                      {selectedTypes.length > 0 && (
                        <button
                          onClick={() => setSelectedTypes([])}
                          className="w-full text-sm text-muted-foreground hover:text-foreground pt-2 border-t"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportActivities}
              disabled={filteredActivities.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-1">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No activity to show</p>
            {selectedTypes.length > 0 && (
              <button
                onClick={() => setSelectedTypes([])}
                className="text-primary hover:underline text-sm mt-2"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredActivities.map((activity, index) => {
            const isNewDay = index === 0 || 
              activity.timestamp.toDateString() !== filteredActivities[index - 1].timestamp.toDateString();

            return (
              <div key={activity.id}>
                {/* Day Separator */}
                {isNewDay && (
                  <div className="flex items-center gap-3 py-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      {activity.timestamp.toDateString() === new Date().toDateString()
                        ? 'Today'
                        : activity.timestamp.toDateString() === new Date(Date.now() - 86400000).toDateString()
                        ? 'Yesterday'
                        : activity.timestamp.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'short', 
                            day: 'numeric'
                          })}
                    </div>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                )}

                {/* Activity Item */}
                <div className="flex gap-3 p-3 hover:bg-accent/5 rounded-lg transition-colors group">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">
                        <span className="font-medium">{activity.userName}</span>
                        {' '}
                        <span className="text-muted-foreground">
                          {renderActivityMessage(activity)}
                        </span>
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>

                    {/* Metadata */}
                    {activity.metadata?.commentText && (
                      <div className="mt-2 text-sm text-muted-foreground italic pl-4 border-l-2 border-border">
                        {activity.metadata.commentText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Helper function to create activity events (call this from other components)
export async function createActivityEvent(
  projectId: string,
  type: ActivityEvent['type'],
  action: string,
  entityId: string,
  entityName: string,
  metadata?: ActivityEvent['metadata']
) {
  try {
    const { getAuthInstance } = await import('@allied-impact/auth');
    const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { getApp } = await import('firebase/app');
    
    const auth = getAuthInstance();
    if (!auth.currentUser) return;

    const db = getFirestore(getApp());
    await addDoc(collection(db, 'activities'), {
      projectId,
      type,
      action,
      entityId,
      entityName,
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Unknown User',
      userAvatar: auth.currentUser.photoURL,
      timestamp: serverTimestamp(),
      metadata: metadata || {}
    });
  } catch (error) {
    console.error('Failed to create activity event:', error);
  }
}
