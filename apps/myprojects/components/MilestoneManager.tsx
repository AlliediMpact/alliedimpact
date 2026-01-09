'use client';

import { useState } from 'react';
import { Button } from '@allied-impact/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@allied-impact/ui';
import { X, Plus, Calendar, Check, AlertCircle, GitBranch } from 'lucide-react';
import { createMilestone, updateMilestone, Milestone, MilestoneStatus } from '@allied-impact/projects';
import RichTextEditor, { RichTextViewer } from './RichTextEditor';
import DependencyGraph from './DependencyGraph';

interface MilestoneModalProps {
  projectId: string;
  milestone?: Milestone;
  onClose: () => void;
  onSuccess: () => void;
}

export function MilestoneModal({ projectId, milestone, onClose, onSuccess }: MilestoneModalProps) {
  const [formData, setFormData] = useState({
    name: milestone?.name || '',
    description: milestone?.description || '',
    dueDate: milestone?.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '',
    status: milestone?.status || MilestoneStatus.PENDING,
    progress: milestone?.progress || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (milestone) {
        // Update existing milestone
        await updateMilestone(milestone.id, {
          name: formData.name,
          description: formData.description,
          dueDate: new Date(formData.dueDate),
          status: formData.status,
          progress: formData.progress
        });
      } else {
        // Create new milestone
        await createMilestone({
          projectId,
          name: formData.name,
          description: formData.description,
          dueDate: new Date(formData.dueDate),
          status: formData.status,
          progress: formData.progress,
          deliverables: []
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save milestone:', error);
      alert('Failed to save milestone. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{milestone ? 'Edit Milestone' : 'Add Milestone'}</CardTitle>
          <button onClick={onClose} className="hover:opacity-70">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Milestone Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Design Phase Complete"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <RichTextEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Describe the milestone objectives, deliverables, and success criteria..."
                minHeight="250px"
              />
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

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MilestoneStatus })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value={MilestoneStatus.PENDING}>Pending</option>
                <option value={MilestoneStatus.IN_PROGRESS}>In Progress</option>
                <option value={MilestoneStatus.COMPLETED}>Completed</option>
                <option value={MilestoneStatus.BLOCKED}>Blocked</option>
                <option value={MilestoneStatus.OVERDUE}>Overdue</option>
              </select>
            </div>

            {/* Progress */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Progress: {formData.progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Saving...' : milestone ? 'Update Milestone' : 'Add Milestone'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface MilestoneCardProps {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

export function MilestoneCard({ milestone, onEdit, isSelected = false, onSelect, showCheckbox = false }: MilestoneCardProps) {
  const getStatusColor = (status: MilestoneStatus) => {
    const colors = {
      [MilestoneStatus.PENDING]: 'bg-gray-100 text-gray-700',
      [MilestoneStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
      [MilestoneStatus.COMPLETED]: 'bg-green-100 text-green-700',
      [MilestoneStatus.BLOCKED]: 'bg-red-100 text-red-700',
      [MilestoneStatus.OVERDUE]: 'bg-orange-100 text-orange-700'
    };
    return colors[status];
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    if (status === MilestoneStatus.COMPLETED) return <Check className="h-4 w-4" />;
    if (status === MilestoneStatus.BLOCKED || status === MilestoneStatus.OVERDUE) 
      return <AlertCircle className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== MilestoneStatus.COMPLETED;

  return (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? 'border-orange-300' : ''} ${isSelected ? 'border-blue-500 border-2' : ''}`}>
      <CardContent className="pt-6">
        {showCheckbox && (
          <div className="absolute top-3 left-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.(milestone.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        )}
        <div onClick={() => onEdit(milestone)}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{milestone.name}</h4>
              <div className="text-sm text-gray-600 line-clamp-2">
                <RichTextViewer content={milestone.description} />
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(milestone.status)}`}>
              {getStatusIcon(milestone.status)}
              {milestone.status.replace('_', ' ')}
            </span>
          </div>

        <div className="space-y-2">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{milestone.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${milestone.progress}%` }}
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Due: {formatDate(milestone.dueDate)}</span>
            {isOverdue && (
              <span className="text-orange-600 font-medium">(Overdue)</span>
            )}
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
