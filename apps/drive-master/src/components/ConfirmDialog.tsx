'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'danger' | 'warning' | 'default';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    default: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">{description}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${variantStyles[variant]}`}
            >
              {isLoading ? 'Please wait...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Specific confirmation dialogs for common use cases

interface QuitJourneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  creditsLost?: number;
}

export function QuitJourneyDialog({
  open,
  onOpenChange,
  onConfirm,
  creditsLost = 15,
}: QuitJourneyDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Quit Journey?"
      description={`You'll lose ${creditsLost} credits and your progress won't be saved. Are you sure you want to quit?`}
      confirmLabel="Yes, Quit"
      cancelLabel="Keep Learning"
      onConfirm={onConfirm}
      variant="warning"
    />
  );
}

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteAccountDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Account?"
      description="This action cannot be undone. All your progress, certificates, and badges will be permanently deleted."
      confirmLabel="Delete Account"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      variant="danger"
    />
  );
}

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancelSubscriptionDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Subscription?"
      description="You'll lose access to unlimited journeys and credits at the end of your billing period. You can resubscribe anytime."
      confirmLabel="Cancel Subscription"
      cancelLabel="Keep Subscription"
      onConfirm={onConfirm}
      variant="warning"
    />
  );
}

interface ResetProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function ResetProgressDialog({
  open,
  onOpenChange,
  onConfirm,
}: ResetProgressDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reset All Progress?"
      description="This will reset all your journey attempts, mastery levels, and statistics. Certificates and badges will be preserved."
      confirmLabel="Reset Progress"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      variant="danger"
    />
  );
}
