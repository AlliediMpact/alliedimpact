'use client';

import { useState } from 'react';
import { Button } from '@allied-impact/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@allied-impact/ui';
import { X, AlertCircle, CheckCircle, Clock, MessageCircle, Send, Paperclip } from 'lucide-react';
import { 
  createTicket, 
  addTicketComment, 
  Ticket, 
  TicketPriority, 
  TicketStatus, 
  TicketComment 
} from '@allied-impact/projects';

interface TicketModalProps {
  projectId: string;
  ticket?: Ticket;
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function TicketModal({ projectId, ticket, userId, userName, onClose, onSuccess }: TicketModalProps) {
  const [formData, setFormData] = useState({
    title: ticket?.title || '',
    description: ticket?.description || '',
    priority: ticket?.priority || TicketPriority.MEDIUM,
    type: ticket?.type || 'question'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!ticket) {
        // Create new ticket
        await createTicket({
          projectId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: TicketStatus.OPEN,
          type: formData.type,
          reportedBy: userId,
          reportedByName: userName,
          comments: [],
          attachments: []
        });
      }
      // TODO: Add update functionality when needed

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{ticket ? 'View Ticket' : 'Create Support Ticket'}</CardTitle>
          <button onClick={onClose} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Subject *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of the issue..."
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about the issue or question..."
                className="w-full px-4 py-2 border rounded-lg min-h-32"
                required
              />
            </div>

            {/* Priority & Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value={TicketPriority.LOW}>Low</option>
                  <option value={TicketPriority.MEDIUM}>Medium</option>
                  <option value={TicketPriority.HIGH}>High</option>
                  <option value={TicketPriority.URGENT}>Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'bug' | 'feature' | 'support' | 'question' })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="question">Question</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="support">Support</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface TicketDetailModalProps {
  ticket: Ticket;
  userId: string;
  userName: string;
  onClose: () => void;
  onStatusUpdate: (ticketId: string, status: TicketStatus) => void;
}

export function TicketDetailModal({ ticket, userId, userName, onClose, onStatusUpdate }: TicketDetailModalProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addTicketComment(ticket.id, {
        userId,
        userName,
        content: comment.trim()
      });
      setComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex-1">
            <CardTitle>{ticket.title}</CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
              <span className="text-sm text-gray-500">
                #{ticket.id.slice(-6)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600">{ticket.description}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Reported By</p>
              <p className="font-medium">{ticket.reportedByName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="font-medium">{formatDate(ticket.createdAt)}</p>
            </div>
            {ticket.assignedToName && (
              <div>
                <p className="text-xs text-gray-500">Assigned To</p>
                <p className="font-medium">{ticket.assignedToName}</p>
              </div>
            )}
            {ticket.resolvedAt && (
              <div>
                <p className="text-xs text-gray-500">Resolved</p>
                <p className="font-medium">{formatDate(ticket.resolvedAt)}</p>
              </div>
            )}
          </div>

          {/* Status Actions */}
          {ticket.status !== TicketStatus.CLOSED && (
            <div className="flex gap-2 mb-6">
              {ticket.status === TicketStatus.OPEN && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS)}
                >
                  Start Work
                </Button>
              )}
              {ticket.status === TicketStatus.IN_PROGRESS && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusUpdate(ticket.id, TicketStatus.RESOLVED)}
                  className="bg-green-50"
                >
                  Mark as Resolved
                </Button>
              )}
              {ticket.status === TicketStatus.RESOLVED && (
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(ticket.id, TicketStatus.CLOSED)}
                >
                  Close Ticket
                </Button>
              )}
            </div>
          )}

          {/* Comments Thread */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({ticket.comments?.length || 0})
            </h4>

            <div className="space-y-4 mb-6">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm">{comment.userName}</p>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
              )}
            </div>

            {/* Add Comment Form */}
            {ticket.status !== TicketStatus.CLOSED && (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <Button type="submit" disabled={isSubmitting || !comment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick(ticket)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{ticket.title}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
          
          {ticket.comments && ticket.comments.length > 0 && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {ticket.comments.length}
            </span>
          )}

          <span className="text-xs text-gray-500 ml-auto">
            {formatDate(ticket.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const config = {
    [TicketStatus.OPEN]: {
      color: 'bg-blue-100 text-blue-700',
      icon: <AlertCircle className="h-3 w-3" />
    },
    [TicketStatus.IN_PROGRESS]: {
      color: 'bg-purple-100 text-purple-700',
      icon: <Clock className="h-3 w-3" />
    },
    [TicketStatus.RESOLVED]: {
      color: 'bg-green-100 text-green-700',
      icon: <CheckCircle className="h-3 w-3" />
    },
    [TicketStatus.CLOSED]: {
      color: 'bg-gray-100 text-gray-700',
      icon: <CheckCircle className="h-3 w-3" />
    },
    [TicketStatus.WAITING]: {
      color: 'bg-yellow-100 text-yellow-700',
      icon: <Clock className="h-3 w-3" />
    }
  };

  const { color, icon } = config[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${color}`}>
      {icon}
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = {
    [TicketPriority.LOW]: 'bg-gray-100 text-gray-700',
    [TicketPriority.MEDIUM]: 'bg-blue-100 text-blue-700',
    [TicketPriority.HIGH]: 'bg-orange-100 text-orange-700',
    [TicketPriority.URGENT]: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${config[priority]}`}>
      {priority}
    </span>
  );
}
