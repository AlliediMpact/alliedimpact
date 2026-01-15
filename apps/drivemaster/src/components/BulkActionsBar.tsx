'use client';

import { useState } from 'react';
import { Button } from '@allied-impact/ui';
import { CheckCircle, XCircle, Trash2, Eye, EyeOff } from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  requireConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  onAction: (actionId: string) => void | Promise<void>;
  onClearSelection: () => void;
}

/**
 * BulkActionsBar Component
 * 
 * Provides a floating action bar for performing bulk operations on selected items.
 * Commonly used in admin panels for approving, rejecting, or deleting multiple items at once.
 * 
 * @example
 * ```tsx
 * <BulkActionsBar
 *   selectedCount={selectedSchools.length}
 *   totalCount={schools.length}
 *   actions={[
 *     { id: 'approve', label: 'Approve', icon: <CheckCircle />, variant: 'success' },
 *     { id: 'reject', label: 'Reject', icon: <XCircle />, variant: 'danger' },
 *   ]}
 *   onAction={handleBulkAction}
 *   onClearSelection={clearSelection}
 * />
 * ```
 */
export function BulkActionsBar({
  selectedCount,
  totalCount,
  actions,
  onAction,
  onClearSelection,
}: BulkActionsBarProps) {
  const [processing, setProcessing] = useState(false);

  if (selectedCount === 0) return null;

  const handleAction = async (action: BulkAction) => {
    // Show confirmation dialog if required
    if (action.requireConfirmation) {
      const message = action.confirmationMessage || 
        `Are you sure you want to perform this action on ${selectedCount} item(s)?`;
      
      if (!confirm(message)) {
        return;
      }
    }

    setProcessing(true);
    try {
      await onAction(action.id);
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-4">
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-300">
          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {selectedCount} selected
            </div>
            <div className="text-xs text-gray-500">
              of {totalCount} items
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={processing}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm 
                flex items-center gap-2 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                ${getVariantClasses(action.variant)}
              `}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          disabled={processing}
          className="ml-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Clear selection"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Predefined bulk actions for common use cases
 */
export const commonBulkActions = {
  approve: {
    id: 'approve',
    label: 'Approve',
    icon: <CheckCircle className="w-4 h-4" />,
    variant: 'success' as const,
    requireConfirmation: true,
    confirmationMessage: 'Are you sure you want to approve the selected items?',
  },
  reject: {
    id: 'reject',
    label: 'Reject',
    icon: <XCircle className="w-4 h-4" />,
    variant: 'danger' as const,
    requireConfirmation: true,
    confirmationMessage: 'Are you sure you want to reject the selected items?',
  },
  delete: {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="w-4 h-4" />,
    variant: 'danger' as const,
    requireConfirmation: true,
    confirmationMessage: 'Are you sure you want to permanently delete the selected items? This action cannot be undone.',
  },
  hide: {
    id: 'hide',
    label: 'Hide',
    icon: <EyeOff className="w-4 h-4" />,
    variant: 'warning' as const,
  },
  show: {
    id: 'show',
    label: 'Show',
    icon: <Eye className="w-4 h-4" />,
    variant: 'default' as const,
  },
};

/**
 * useSelection Hook
 * 
 * Manages selection state for bulk actions
 */
export function useSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isSelected = (id: string) => selectedIds.has(id);

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;

  const getSelectedItems = () => items.filter((item) => selectedIds.has(item.id));

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    getSelectedItems,
  };
}
