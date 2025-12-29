'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileQuestion, 
  Inbox, 
  Search, 
  TrendingUp, 
  Wallet, 
  Users,
  AlertCircle,
  Coins,
  type LucideIcon
} from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
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
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center p-8"
    >
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-full bg-muted p-6"
            >
              <Icon className="h-12 w-12 text-muted-foreground" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {(action || secondaryAction) && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {action && (
                  <Button onClick={action.onClick} className="w-full sm:w-auto">
                    {action.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button 
                    onClick={secondaryAction.onClick} 
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Predefined Empty States
export function EmptyTransactions({ onCreateTransaction }: { onCreateTransaction?: () => void }) {
  return (
    <EmptyState
      icon={Wallet}
      title="No transactions yet"
      description="You haven't made any transactions. Start trading to see your transaction history here."
      action={onCreateTransaction ? {
        label: 'Start Trading',
        onClick: onCreateTransaction,
      } : undefined}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={Inbox}
      title="No notifications"
      description="You're all caught up! We'll notify you when there's something new."
    />
  );
}

export function EmptySearchResults({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="We couldn't find anything matching your search. Try different keywords or filters."
      action={onClearSearch ? {
        label: 'Clear Search',
        onClick: onClearSearch,
      } : undefined}
    />
  );
}

export function EmptyTickets({ onCreateTicket }: { onCreateTicket?: () => void }) {
  return (
    <EmptyState
      icon={Coins}
      title="No trading tickets"
      description="Create your first ticket to start investing or borrowing coins."
      action={onCreateTicket ? {
        label: 'Create Ticket',
        onClick: onCreateTicket,
      } : undefined}
    />
  );
}

export function EmptyReferrals({ onShareReferral }: { onShareReferral?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No referrals yet"
      description="Start earning commissions by referring friends to CoinBox."
      action={onShareReferral ? {
        label: 'Share Referral Link',
        onClick: onShareReferral,
      } : undefined}
    />
  );
}

export function EmptyAnalytics() {
  return (
    <EmptyState
      icon={TrendingUp}
      title="Not enough data"
      description="Start trading to see your analytics and performance metrics."
    />
  );
}

export function ErrorState({ 
  onRetry, 
  message = "Something went wrong while loading your data." 
}: { 
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Oops! Something went wrong"
      description={message}
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
      } : undefined}
    />
  );
}

export function EmptyGeneric({ 
  title, 
  description 
}: { 
  title: string; 
  description: string;
}) {
  return (
    <EmptyState
      icon={FileQuestion}
      title={title}
      description={description}
    />
  );
}
