'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastCount = 0;
const listeners = new Set<(toast: Toast) => void>();

export function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  const id = `toast-${++toastCount}`;
  const newToast: Toast = { id, title, description, variant };
  
  listeners.forEach((listener) => listener(newToast));
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    listeners.forEach((listener) => listener({ ...newToast, id: `dismiss-${id}` }));
  }, 5000);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useState(() => {
    const listener = (toast: Toast) => {
      if (toast.id.startsWith('dismiss-')) {
        const originalId = toast.id.replace('dismiss-', '');
        setToasts((prev) => prev.filter((t) => t.id !== originalId));
      } else {
        setToasts((prev) => [...prev, toast]);
      }
    };
    
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  });

  return {
    toast,
    toasts,
    dismiss: (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
  };
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg border p-4 shadow-lg min-w-[300px] animate-in slide-in-from-right ${\n            toast.variant === 'destructive'\n              ? 'bg-destructive text-destructive-foreground border-destructive'\n              : 'bg-background border-border'\n          }`}
        >
          <div className="flex-1">
            <p className="font-semibold">{toast.title}</p>
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="rounded-md p-1 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
