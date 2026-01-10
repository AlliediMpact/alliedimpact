import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div 
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
      role="status"
      aria-label="Empty state"
    >
      <div className="rounded-full bg-gradient-to-br from-gray-100 to-gray-200 p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 max-w-md mb-6">
        {description}
      </p>
      
      {action && (
        <Button onClick={action.onClick} className="bg-gradient-to-r from-blue-600 to-indigo-600">
          {action.label}
        </Button>
      )}
    </div>
  );
}
