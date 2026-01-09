'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import { Milestone, Deliverable, DeliverableStatus } from '@allied-impact/projects';
import { Button } from '@allied-impact/ui';

interface MilestoneWithDeliverablesProps {
  milestone: Milestone;
  deliverables: Deliverable[];
  onDeliverableClick?: (deliverable: Deliverable) => void;
}

export default function MilestoneWithDeliverables({
  milestone,
  deliverables,
  onDeliverableClick
}: MilestoneWithDeliverablesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter deliverables for this milestone
  const linkedDeliverables = deliverables.filter(d => d.milestoneId === milestone.id);
  
  // Calculate progress from deliverables
  const calculateProgress = () => {
    if (linkedDeliverables.length === 0) {
      return milestone.progress || 0;
    }

    const statusWeights: Record<DeliverableStatus, number> = {
      'Pending': 0,
      'In Progress': 25,
      'Delivered': 75,
      'Approved': 100,
      'Revision Requested': 50
    };

    const totalProgress = linkedDeliverables.reduce(
      (sum, d) => sum + (statusWeights[d.status] || 0),
      0
    );

    return Math.round(totalProgress / linkedDeliverables.length);
  };

  const progress = calculateProgress();

  // Count deliverables by status
  const statusCounts = {
    approved: linkedDeliverables.filter(d => d.status === 'Approved').length,
    delivered: linkedDeliverables.filter(d => d.status === 'Delivered').length,
    inProgress: linkedDeliverables.filter(d => d.status === 'In Progress').length,
    pending: linkedDeliverables.filter(d => d.status === 'Pending').length,
    revision: linkedDeliverables.filter(d => d.status === 'Revision Requested').length
  };

  const getStatusIcon = (status: DeliverableStatus) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Delivered':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'Revision Requested':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: DeliverableStatus) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Delivered':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Revision Requested':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Milestone Header */}
      <div className="p-4 bg-accent/5 border-b">
        <div className="flex items-start justify-between mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 flex-1 text-left group"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {milestone.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {milestone.description}
              </p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded border ${
              milestone.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
              milestone.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
              {milestone.status}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Deliverable Summary */}
        {linkedDeliverables.length > 0 && (
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{linkedDeliverables.length}</span>
              <span className="text-muted-foreground">deliverable{linkedDeliverables.length !== 1 ? 's' : ''}</span>
            </div>
            {statusCounts.approved > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">{statusCounts.approved}</span>
                <span>approved</span>
              </div>
            )}
            {statusCounts.inProgress > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{statusCounts.inProgress}</span>
                <span>in progress</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deliverables List */}
      {isExpanded && linkedDeliverables.length > 0 && (
        <div className="divide-y">
          {linkedDeliverables.map((deliverable) => (
            <div
              key={deliverable.id}
              className="p-4 hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => onDeliverableClick?.(deliverable)}
            >
              <div className="flex items-start gap-3">
                {/* Connection Line */}
                <div className="flex flex-col items-center pt-1">
                  <div className="h-2 w-0.5 bg-border"></div>
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <div className="flex-1 w-0.5 bg-border min-h-[20px]"></div>
                </div>

                {/* Deliverable Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(deliverable.status)}
                      <h4 className="font-medium truncate">{deliverable.title}</h4>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded border whitespace-nowrap ${getStatusColor(deliverable.status)}`}>
                      {deliverable.status}
                    </span>
                  </div>

                  {deliverable.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {deliverable.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>Type:</span>
                      <span className="font-medium">{deliverable.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Due:</span>
                      <span className="font-medium">
                        {deliverable.dueDate.toLocaleDateString()}
                      </span>
                    </div>
                    {deliverable.files && deliverable.files.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{deliverable.files.length} file{deliverable.files.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Deliverables */}
      {isExpanded && linkedDeliverables.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No deliverables linked to this milestone</p>
          <p className="text-xs mt-1">Add deliverables to track milestone progress</p>
        </div>
      )}
    </div>
  );
}

// Helper component for showing milestone dependencies
export function MilestoneDependencyView({
  milestones,
  deliverables
}: {
  milestones: Milestone[];
  deliverables: Deliverable[];
}) {
  return (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <MilestoneWithDeliverables
          key={milestone.id}
          milestone={milestone}
          deliverables={deliverables}
        />
      ))}
    </div>
  );
}
