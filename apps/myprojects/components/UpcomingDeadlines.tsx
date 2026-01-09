'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertCircle, AlertTriangle, Bell, BellOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@allied-impact/ui';
import { Button } from '@allied-impact/ui';
import { useRouter } from 'next/navigation';

interface DeadlineItem {
  id: string;
  type: 'milestone' | 'deliverable';
  name: string;
  dueDate: Date;
  status: string;
  projectId: string;
  projectName: string;
  daysUntilDue: number;
  snoozedUntil?: Date;
}

interface UpcomingDeadlinesProps {
  projectId?: string;
  maxItems?: number;
  showSnooze?: boolean;
}

export default function UpcomingDeadlines({ projectId, maxItems = 5, showSnooze = true }: UpcomingDeadlinesProps) {
  const router = useRouter();
  const [items, setItems] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [snoozeDurations] = useState([
    { label: '1 hour', value: 1 * 60 * 60 * 1000 },
    { label: '3 hours', value: 3 * 60 * 60 * 1000 },
    { label: '1 day', value: 24 * 60 * 60 * 1000 },
    { label: '3 days', value: 3 * 24 * 60 * 60 * 1000 },
  ]);

  useEffect(() => {
    loadUpcomingDeadlines();
  }, [projectId]);

  const loadUpcomingDeadlines = async () => {
    try {
      setLoading(true);
      const { getFirestore, collection, query, where, getDocs, Timestamp } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const deadlineItems: DeadlineItem[] = [];

      // Build base query
      const baseConditions = projectId ? [where('projectId', '==', projectId)] : [];

      // Load milestones with deadlines
      const milestonesQuery = query(
        collection(db, 'milestones'),
        ...baseConditions,
        where('status', '!=', 'completed')
      );
      const milestonesSnapshot = await getDocs(milestonesQuery);
      
      milestonesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.dueDate) {
          const dueDate = data.dueDate.toDate();
          if (dueDate <= sevenDaysFromNow) {
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
            deadlineItems.push({
              id: doc.id,
              type: 'milestone',
              name: data.name,
              dueDate,
              status: data.status,
              projectId: data.projectId,
              projectName: data.projectName || 'Unknown Project',
              daysUntilDue,
            });
          }
        }
      });

      // Load deliverables with deadlines
      const deliverablesQuery = query(
        collection(db, 'deliverables'),
        ...baseConditions,
        where('status', '!=', 'approved')
      );
      const deliverablesSnapshot = await getDocs(deliverablesQuery);
      
      deliverablesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.dueDate) {
          const dueDate = data.dueDate.toDate();
          if (dueDate <= sevenDaysFromNow) {
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
            deadlineItems.push({
              id: doc.id,
              type: 'deliverable',
              name: data.name,
              dueDate,
              status: data.status,
              projectId: data.projectId,
              projectName: data.projectName || 'Unknown Project',
              daysUntilDue,
            });
          }
        }
      });

      // Sort by due date (earliest first)
      deadlineItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

      // Limit results
      setItems(deadlineItems.slice(0, maxItems));
      setLoading(false);
    } catch (error) {
      console.error('Failed to load upcoming deadlines:', error);
      setLoading(false);
    }
  };

  const snoozeDeadline = async (itemId: string, duration: number) => {
    try {
      const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      
      const db = getFirestore(getApp());
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const snoozedUntil = new Date(Date.now() + duration);
      const collection = item.type === 'milestone' ? 'milestones' : 'deliverables';
      
      await updateDoc(doc(db, collection, itemId), {
        snoozedUntil: Timestamp.fromDate(snoozedUntil),
      });

      // Remove from list temporarily
      setItems(items.filter(i => i.id !== itemId));
    } catch (error) {
      console.error('Failed to snooze deadline:', error);
      alert('Failed to snooze reminder');
    }
  };

  const getUrgencyLevel = (daysUntilDue: number): 'overdue' | 'critical' | 'warning' | 'normal' => {
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue === 0) return 'critical';
    if (daysUntilDue <= 1) return 'warning';
    return 'normal';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
        return 'border-l-4 border-l-red-600 bg-red-50 dark:bg-red-950/20';
      case 'critical':
        return 'border-l-4 border-l-orange-600 bg-orange-50 dark:bg-orange-950/20';
      case 'warning':
        return 'border-l-4 border-l-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
      default:
        return 'border-l-4 border-l-blue-600 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'overdue':
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const formatDeadlineText = (daysUntilDue: number): string => {
    if (daysUntilDue < 0) {
      const daysOverdue = Math.abs(daysUntilDue);
      return `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`;
    }
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const handleItemClick = (item: DeadlineItem) => {
    const path = item.type === 'milestone' ? '/milestones' : '/deliverables';
    router.push(path);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
        <CardDescription>
          Items due within the next 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
            <p className="text-muted-foreground">No upcoming deadlines</p>
            <p className="text-sm text-muted-foreground mt-1">
              All items are on track!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const urgency = getUrgencyLevel(item.daysUntilDue);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg cursor-pointer hover:shadow-sm transition-all ${getUrgencyColor(urgency)}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getUrgencyIcon(urgency)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span className="capitalize">{item.type}</span>
                            {!projectId && (
                              <>
                                <span>•</span>
                                <span className="truncate">{item.projectName}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Deadline Badge */}
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          urgency === 'overdue' ? 'bg-red-600 text-white' :
                          urgency === 'critical' ? 'bg-orange-600 text-white' :
                          urgency === 'warning' ? 'bg-yellow-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {formatDeadlineText(item.daysUntilDue)}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="mt-2 text-xs text-muted-foreground">
                        Due: {item.dueDate.toLocaleDateString()} at {item.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {/* Snooze Options */}
                      {showSnooze && (
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Show snooze dropdown
                            }}
                          >
                            <BellOff className="h-3 w-3 mr-1" />
                            Snooze
                          </Button>
                          {snoozeDurations.map(duration => (
                            <button
                              key={duration.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                snoozeDeadline(item.id, duration.value);
                              }}
                              className="text-xs text-primary hover:underline"
                            >
                              {duration.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for deadline badge on cards
interface DeadlineBadgeProps {
  dueDate: Date;
  status?: string;
}

export function DeadlineBadge({ dueDate, status }: DeadlineBadgeProps) {
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  // Don't show if completed
  if (status === 'completed' || status === 'approved') return null;

  const isOverdue = daysUntilDue < 0;
  const isDueToday = daysUntilDue === 0;
  const isDueSoon = daysUntilDue > 0 && daysUntilDue <= 3;

  if (!isOverdue && !isDueToday && !isDueSoon) return null;

  const badgeColor = isOverdue
    ? 'bg-red-100 text-red-700 border-red-200'
    : isDueToday
    ? 'bg-orange-100 text-orange-700 border-orange-200'
    : 'bg-yellow-100 text-yellow-700 border-yellow-200';

  const Icon = isOverdue ? AlertCircle : isDueToday ? AlertTriangle : Clock;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badgeColor}`}>
      <Icon className="h-3 w-3" />
      {isOverdue && `${Math.abs(daysUntilDue)}d overdue`}
      {isDueToday && 'Due today'}
      {isDueSoon && `${daysUntilDue}d left`}
    </div>
  );
}
