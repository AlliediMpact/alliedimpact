/**
 * Empty States Component
 * Beautiful empty states with illustrations and actions
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function NoLoansEmptyState() {
  return (
    <EmptyState
      icon="💰"
      title="No Loan Tickets Yet"
      description="Create your first loan ticket to get started with peer-to-peer lending."
      action={{
        label: 'Create Loan Ticket',
        onClick: () => window.location.href = '/loans/create',
      }}
      secondaryAction={{
        label: 'Learn More',
        onClick: () => window.location.href = '/docs/loans',
      }}
    />
  );
}

export function NoInvestmentsEmptyState() {
  return (
    <EmptyState
      icon="📈"
      title="No Investments Yet"
      description="Browse available loan tickets and start investing to earn returns."
      action={{
        label: 'Browse Tickets',
        onClick: () => window.location.href = '/investments',
      }}
    />
  );
}

export function NoTransactionsEmptyState() {
  return (
    <EmptyState
      icon="📊"
      title="No Transactions"
      description="Your transaction history will appear here once you start using Coin Box."
    />
  );
}

export function NoApiKeysEmptyState() {
  return (
    <EmptyState
      icon="🔑"
      title="No API Keys"
      description="Create an API key to access the Coin Box API programmatically."
      action={{
        label: 'Create API Key',
        onClick: () => window.location.href = '/api-keys/create',
      }}
      secondaryAction={{
        label: 'View Documentation',
        onClick: () => window.location.href = '/docs/api',
      }}
    />
  );
}

export function NoWebhooksEmptyState() {
  return (
    <EmptyState
      icon="🔔"
      title="No Webhooks Configured"
      description="Set up webhooks to receive real-time notifications about events."
      action={{
        label: 'Add Webhook',
        onClick: () => window.location.href = '/webhooks/create',
      }}
      secondaryAction={{
        label: 'View Examples',
        onClick: () => window.location.href = '/docs/webhooks',
      }}
    />
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="🔍"
      title="No Results Found"
      description={`No results found for "${query}". Try adjusting your search terms.`}
    />
  );
}

export function ErrorEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="⚠️"
      title="Something Went Wrong"
      description="We couldn't load this content. Please try again."
      action={onRetry ? {
        label: 'Retry',
        onClick: onRetry,
      } : undefined}
    />
  );
}

export function MaintenanceEmptyState() {
  return (
    <EmptyState
      icon="🔧"
      title="Under Maintenance"
      description="This feature is temporarily unavailable while we perform maintenance. Please check back soon."
    />
  );
}

export function ComingSoonEmptyState() {
  return (
    <EmptyState
      icon="🚀"
      title="Coming Soon"
      description="We're working hard to bring you this feature. Stay tuned!"
    />
  );
}
