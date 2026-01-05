'use client';

import { useState } from 'react';
import { Button } from '@allied-impact/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@allied-impact/ui';
import { X, Upload, Check, FileText, AlertCircle, Clock, Download } from 'lucide-react';
import { createDeliverable, Deliverable, DeliverableStatus } from '@allied-impact/projects';

interface DeliverableModalProps {
  projectId: string;
  milestoneId?: string;
  deliverable?: Deliverable;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeliverableModal({ projectId, milestoneId, deliverable, onClose, onSuccess }: DeliverableModalProps) {
  const [formData, setFormData] = useState({
    name: deliverable?.name || '',
    description: deliverable?.description || '',
    type: deliverable?.type || 'document',
    dueDate: deliverable?.dueDate ? new Date(deliverable.dueDate).toISOString().split('T')[0] : '',
    notes: deliverable?.notes || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!deliverable) {
        // Create new deliverable
        await createDeliverable({
          projectId,
          milestoneId: milestoneId || '',
          name: formData.name,
          description: formData.description,
          type: formData.type,
          status: DeliverableStatus.PENDING,
          dueDate: new Date(formData.dueDate),
          fileUrls: [],
          notes: formData.notes
        });
      }
      // TODO: Add update functionality when needed

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save deliverable:', error);
      alert('Failed to save deliverable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{deliverable ? 'Edit Deliverable' : 'Add Deliverable'}</CardTitle>
          <button onClick={onClose} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Deliverable Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., UI Mockups"
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
                placeholder="Describe the deliverable..."
                className="w-full px-4 py-2 border rounded-lg min-h-24"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="document">Document</option>
                <option value="code">Code</option>
                <option value="design">Design</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium mb-2">Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or requirements..."
                className="w-full px-4 py-2 border rounded-lg min-h-16"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Saving...' : 'Add Deliverable'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface DeliverableCardProps {
  deliverable: Deliverable;
  onStatusUpdate: (id: string, status: DeliverableStatus) => void;
}

export function DeliverableCard({ deliverable, onStatusUpdate }: DeliverableCardProps) {
  const getStatusColor = (status: DeliverableStatus) => {
    const colors = {
      [DeliverableStatus.PENDING]: 'bg-gray-100 text-gray-700',
      [DeliverableStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
      [DeliverableStatus.DELIVERED]: 'bg-purple-100 text-purple-700',
      [DeliverableStatus.APPROVED]: 'bg-green-100 text-green-700',
      [DeliverableStatus.REVISION_REQUESTED]: 'bg-orange-100 text-orange-700'
    };
    return colors[status];
  };

  const getStatusIcon = (status: DeliverableStatus) => {
    if (status === DeliverableStatus.APPROVED) return <Check className="h-4 w-4" />;
    if (status === DeliverableStatus.REVISION_REQUESTED) return <AlertCircle className="h-4 w-4" />;
    if (status === DeliverableStatus.DELIVERED) return <Upload className="h-4 w-4" />;
    if (status === DeliverableStatus.IN_PROGRESS) return <Clock className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = new Date(deliverable.dueDate) < new Date() && 
    deliverable.status !== DeliverableStatus.APPROVED;

  return (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-orange-300' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-gray-400" />
              <h4 className="font-semibold">{deliverable.name}</h4>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{deliverable.description}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ml-2 ${getStatusColor(deliverable.status)}`}>
            {getStatusIcon(deliverable.status)}
            {deliverable.status.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="space-y-2">
          {/* Type Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
              {deliverable.type}
            </span>
            <span className="text-sm text-gray-600">
              Due: {formatDate(deliverable.dueDate)}
            </span>
            {isOverdue && (
              <span className="text-orange-600 font-medium text-xs">(Overdue)</span>
            )}
          </div>

          {/* File Download Links */}
          {deliverable.fileUrls && deliverable.fileUrls.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-600 mb-2">Attached Files:</p>
              <div className="flex flex-wrap gap-2">
                {deliverable.fileUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    File {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Status Actions */}
          {deliverable.status === DeliverableStatus.DELIVERED && (
            <div className="mt-3 pt-3 border-t flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusUpdate(deliverable.id, DeliverableStatus.REVISION_REQUESTED)}
                className="flex-1 text-xs"
              >
                Request Revision
              </Button>
              <Button
                size="sm"
                onClick={() => onStatusUpdate(deliverable.id, DeliverableStatus.APPROVED)}
                className="flex-1 text-xs bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
