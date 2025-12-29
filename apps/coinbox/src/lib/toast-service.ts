/**
 * Enhanced Toast Notification System
 * Provides beautiful, accessible toast notifications with animations
 */

import { toast as sonnerToast } from 'sonner';
import { UserFeedbackService, successMessages, loadingMessages } from './user-feedback';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export class ToastService {
  private static defaultDuration = {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
    loading: Infinity,
  };

  static success(message: string, options?: ToastOptions) {
    return sonnerToast.success(options?.title || 'Success', {
      description: options?.description || message,
      duration: options?.duration || this.defaultDuration.success,
      action: options?.action,
      onDismiss: options?.onDismiss,
    });
  }

  static error(error: any, options?: ToastOptions) {
    const enhancedError = UserFeedbackService.formatApiError(error);
    
    return sonnerToast.error(enhancedError.title, {
      description: enhancedError.message,
      duration: options?.duration || this.defaultDuration.error,
      action: enhancedError.action ? {
        label: enhancedError.action.label,
        onClick: enhancedError.action.handler,
      } : options?.action,
      onDismiss: options?.onDismiss,
    });
  }

  static warning(message: string, options?: ToastOptions) {
    return sonnerToast.warning(options?.title || 'Warning', {
      description: options?.description || message,
      duration: options?.duration || this.defaultDuration.warning,
      action: options?.action,
      onDismiss: options?.onDismiss,
    });
  }

  static info(message: string, options?: ToastOptions) {
    return sonnerToast.info(options?.title || 'Info', {
      description: options?.description || message,
      duration: options?.duration || this.defaultDuration.info,
      action: options?.action,
      onDismiss: options?.onDismiss,
    });
  }

  static loading(message: string, options?: ToastOptions) {
    return sonnerToast.loading(options?.title || 'Loading', {
      description: options?.description || message,
      duration: options?.duration || this.defaultDuration.loading,
    });
  }

  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: (data) => 
        typeof messages.success === 'function' 
          ? messages.success(data) 
          : messages.success,
      error: (error) => {
        const enhancedError = UserFeedbackService.formatApiError(error);
        return enhancedError.message;
      },
    });
  }

  static dismiss(toastId?: string | number) {
    sonnerToast.dismiss(toastId);
  }

  // Convenience methods for common operations
  static loanCreated(loanId: string) {
    this.success(successMessages.LOAN_CREATED.message, {
      title: successMessages.LOAN_CREATED.title,
      action: {
        label: 'View Loan',
        onClick: () => window.location.href = `/loans/${loanId}`,
      },
    });
  }

  static investmentSuccess(amount: number) {
    this.success(successMessages.INVESTMENT_MADE.message, {
      title: successMessages.INVESTMENT_MADE.title,
      description: `You invested R${amount.toFixed(2)}`,
    });
  }

  static apiKeyCreated(key: string) {
    this.success(successMessages.API_KEY_CREATED.message, {
      title: successMessages.API_KEY_CREATED.title,
      duration: 8000,
      action: {
        label: 'Copy Key',
        onClick: () => {
          navigator.clipboard.writeText(key);
          this.info('API key copied to clipboard');
        },
      },
    });
  }

  static bulkOperationStatus(successful: number, failed: number) {
    if (failed === 0) {
      this.success(successMessages.BULK_COMPLETED.message, {
        title: successMessages.BULK_COMPLETED.title,
        description: `${successful} items processed successfully`,
      });
    } else {
      this.warning('Batch completed with errors', {
        description: `${successful} succeeded, ${failed} failed`,
        action: {
          label: 'View Details',
          onClick: () => {}, // Navigate to batch details
        },
      });
    }
  }

  static rateLimitWarning(resetAt: number) {
    const resetTime = new Date(resetAt);
    const minutes = Math.ceil((resetAt - Date.now()) / 60000);
    
    this.warning('Rate limit approaching', {
      description: `You're approaching your rate limit. Resets in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      duration: 5000,
    });
  }

  static maintenanceMode(until?: Date) {
    this.warning('System Maintenance', {
      description: until 
        ? `Service will be restored at ${until.toLocaleTimeString()}`
        : 'Service will be restored shortly',
      duration: 10000,
    });
  }
}
