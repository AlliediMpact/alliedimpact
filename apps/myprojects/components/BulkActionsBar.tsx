'use client';

import { useState } from 'react';
import { Button } from '@allied-impact/ui';
import { Card } from '@allied-impact/ui';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit, 
  Download, 
  UserPlus,
  X
} from 'lucide-react';
import { Milestone, Deliverable, Ticket, MilestoneStatus, DeliverableStatus, TicketStatus } from '@allied-impact/projects';
import { downloadMilestonesCSV, downloadMilestonesJSON, downloadDeliverablesCSV, downloadDeliverablesJSON, downloadTicketsCSV, downloadTicketsJSON } from '@/lib/export-utils';

interface BulkActionsBarProps<T> {
  selectedItems: Set<string>;
  allItems: T[];
  entityType: 'milestones' | 'deliverables' | 'tickets';
  projectName: string;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkStatusUpdate?: (itemIds: string[], newStatus: string) => Promise<void>;
  onBulkDelete?: (itemIds: string[]) => Promise<void>;
  onBulkAssign?: (itemIds: string[], userId: string) => Promise<void>;
  teamMembers?: { id: string; name: string }[];
}

export default function BulkActionsBar<T extends { id: string }>({
  selectedItems,
  allItems,
  entityType,
  projectName,
  onSelectAll,
  onDeselectAll,
  onBulkStatusUpdate,
  onBulkDelete,
  onBulkAssign,
  teamMembers = []
}: BulkActionsBarProps<T>) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCount = selectedItems.size;
  const allSelected = selectedCount === allItems.length && allItems.length > 0;

  // Get status options based on entity type
  const getStatusOptions = () => {
    switch (entityType) {
      case 'milestones':
        return [
          { value: MilestoneStatus.PENDING, label: 'Pending' },
          { value: MilestoneStatus.IN_PROGRESS, label: 'In Progress' },
          { value: MilestoneStatus.COMPLETED, label: 'Completed' },
          { value: MilestoneStatus.BLOCKED, label: 'Blocked' },
          { value: MilestoneStatus.OVERDUE, label: 'Overdue' }
        ];
      case 'deliverables':
        return [
          { value: DeliverableStatus.PENDING, label: 'Pending' },
          { value: DeliverableStatus.IN_PROGRESS, label: 'In Progress' },
          { value: DeliverableStatus.DELIVERED, label: 'Delivered' },
          { value: DeliverableStatus.IN_REVIEW, label: 'In Review' },
          { value: DeliverableStatus.APPROVED, label: 'Approved' },
          { value: DeliverableStatus.REJECTED, label: 'Rejected' }
        ];
      case 'tickets':
        return [
          { value: TicketStatus.OPEN, label: 'Open' },
          { value: TicketStatus.IN_PROGRESS, label: 'In Progress' },
          { value: TicketStatus.WAITING, label: 'Waiting' },
          { value: TicketStatus.RESOLVED, label: 'Resolved' },
          { value: TicketStatus.CLOSED, label: 'Closed' }
        ];
      default:
        return [];
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (!onBulkStatusUpdate || selectedCount === 0) return;

    const confirm = window.confirm(
      `Update status to "${newStatus}" for ${selectedCount} ${entityType}?`
    );

    if (!confirm) return;

    setIsProcessing(true);
    try {
      await onBulkStatusUpdate(Array.from(selectedItems), newStatus);
      setShowStatusMenu(false);
      onDeselectAll();
    } catch (error) {
      console.error('Bulk status update failed:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedCount === 0) return;

    const confirm = window.confirm(
      `Are you sure you want to delete ${selectedCount} ${entityType}? This action cannot be undone.`
    );

    if (!confirm) return;

    setIsProcessing(true);
    try {
      await onBulkDelete(Array.from(selectedItems));
      onDeselectAll();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Failed to delete items. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle bulk assign
  const handleBulkAssign = async (userId: string) => {
    if (!onBulkAssign || selectedCount === 0) return;

    const member = teamMembers.find(m => m.id === userId);
    const confirm = window.confirm(
      `Assign ${selectedCount} ${entityType} to ${member?.name || 'this user'}?`
    );

    if (!confirm) return;

    setIsProcessing(true);
    try {
      await onBulkAssign(Array.from(selectedItems), userId);
      setShowAssignMenu(false);
      onDeselectAll();
    } catch (error) {
      console.error('Bulk assign failed:', error);
      alert('Failed to assign items. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    const selectedItemsArray = allItems.filter(item => selectedItems.has(item.id));

    if (selectedItemsArray.length === 0) {
      alert('No items selected for export');
      return;
    }

    switch (entityType) {
      case 'milestones':
        if (format === 'csv') {
          downloadMilestonesCSV(selectedItemsArray as any, projectName);
        } else {
          downloadMilestonesJSON(selectedItemsArray as any, projectName);
        }
        break;
      case 'deliverables':
        if (format === 'csv') {
          downloadDeliverablesCSV(selectedItemsArray as any, projectName);
        } else {
          downloadDeliverablesJSON(selectedItemsArray as any, projectName);
        }
        break;
      case 'tickets':
        if (format === 'csv') {
          downloadTicketsCSV(selectedItemsArray as any, projectName);
        } else {
          downloadTicketsJSON(selectedItemsArray as any, projectName);
        }
        break;
    }

    setShowExportMenu(false);
  };

  if (selectedCount === 0) return null;

  return (
    <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-lg border-2 border-blue-500">
      <div className="p-4 flex items-center gap-4">
        {/* Selection info */}
        <div className="flex items-center gap-3">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="hover:opacity-70 transition-opacity"
            title={allSelected ? 'Deselect all' : 'Select all'}
          >
            {allSelected ? (
              <CheckSquare className="h-5 w-5 text-blue-600" />
            ) : (
              <Square className="h-5 w-5 text-gray-600" />
            )}
          </button>
          <span className="font-medium text-sm">
            {selectedCount} {entityType} selected
          </span>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Status Update */}
          {onBulkStatusUpdate && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={isProcessing}
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Status
              </Button>

              {showStatusMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-lg py-2 min-w-[180px] z-10">
                  {getStatusOptions().map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleBulkStatusUpdate(option.value)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      disabled={isProcessing}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Assign */}
          {onBulkAssign && teamMembers.length > 0 && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignMenu(!showAssignMenu)}
                disabled={isProcessing}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign To
              </Button>

              {showAssignMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-lg py-2 min-w-[200px] max-h-60 overflow-y-auto z-10">
                  {teamMembers.map(member => (
                    <button
                      key={member.id}
                      onClick={() => handleBulkAssign(member.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      disabled={isProcessing}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            {showExportMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-lg py-2 min-w-[150px] z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  disabled={isProcessing}
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  disabled={isProcessing}
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>

          {/* Delete */}
          {onBulkDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Close */}
        <button
          onClick={onDeselectAll}
          className="hover:opacity-70 transition-opacity"
          title="Clear selection"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </Card>
  );
}
