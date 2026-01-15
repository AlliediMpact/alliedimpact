'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#fff',
          color: '#1f2937',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '16px',
          maxWidth: '400px',
        },
        // Success toast
        success: {
          duration: 3000,
          style: {
            background: '#10b981',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10b981',
          },
        },
        // Error toast
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#ef4444',
          },
        },
        // Loading toast
        loading: {
          style: {
            background: '#3b82f6',
            color: 'white',
          },
        },
      }}
    />
  );
}
