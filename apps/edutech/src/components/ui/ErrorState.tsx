/**
 * Error State Component
 * Shows when an error occurs
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error. Please try again.',
  action,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="alert"
    >
      <div className="mb-4 text-red-500">
        <AlertCircle size={64} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {description}
      </p>
      
      {action && <div>{action}</div>}
    </div>
  );
}
