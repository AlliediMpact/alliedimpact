'use client';

/**
 * Toast Hook - Stub Implementation
 */

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useToast() {
  return {
    toast: (props: Toast) => {
      console.log('Toast:', props);
      return { id: props.id || `toast_${Date.now()}` };
    },
    dismiss: (toastId?: string) => {},
    toasts: [] as Toast[],
  };
}
