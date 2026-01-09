'use client';

import { ReactNode } from 'react';
import { FileText, Folder, Users, MessageSquare, Plus, Rocket, BookOpen, Video } from 'lucide-react';
import { Button } from '@allied-impact/ui';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  showGettingStarted?: boolean;
  videoUrl?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  showGettingStarted = false,
  videoUrl
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <div className="mb-4 text-muted-foreground opacity-50">
        {icon || <FileText className="h-16 w-16" />}
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="outline" size="lg">
            {secondaryActionLabel}
          </Button>
        )}
      </div>

      {/* Getting Started Guide */}
      {showGettingStarted && (
        <div className="w-full max-w-2xl mt-8 p-6 border rounded-lg bg-accent/5">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Getting Started</h4>
          </div>
          
          <div className="space-y-4 text-left">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium mb-1">Create Your First Item</p>
                <p className="text-sm text-muted-foreground">
                  Click the button above to add your first item and start tracking progress
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium mb-1">Organize & Collaborate</p>
                <p className="text-sm text-muted-foreground">
                  Add team members, set deadlines, and track status updates in real-time
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium mb-1">Monitor Progress</p>
                <p className="text-sm text-muted-foreground">
                  Use the dashboard to track completion rates and identify blockers
                </p>
              </div>
            </div>
          </div>

          {/* Video Tutorial */}
          {videoUrl && (
            <div className="mt-6 pt-6 border-t">
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Video className="h-4 w-4" />
                <span className="font-medium">Watch Video Tutorial</span>
              </a>
            </div>
          )}

          {/* Documentation Link */}
          <div className="mt-4">
            <a
              href="/help"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>View Documentation</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoProjectsEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={<Folder className="h-16 w-16" />}
      title="No Projects Yet"
      description="Get started by creating your first project. Projects help you organize work into milestones, deliverables, and track progress."
      actionLabel="Create First Project"
      onAction={onCreate}
      showGettingStarted
    />
  );
}

export function NoMilestonesEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={<Rocket className="h-16 w-16" />}
      title="No Milestones Yet"
      description="Break down your project into milestones to track progress and meet deadlines. Each milestone can have multiple deliverables."
      actionLabel="Create Milestone"
      onAction={onCreate}
      secondaryActionLabel="Learn About Milestones"
      onSecondaryAction={() => window.open('/help/milestones', '_blank')}
    />
  );
}

export function NoDeliverablesEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="h-16 w-16" />}
      title="No Deliverables Yet"
      description="Add deliverables to track specific outputs and file submissions. Link them to milestones to automatically calculate progress."
      actionLabel="Create Deliverable"
      onAction={onCreate}
      secondaryActionLabel="View Examples"
      onSecondaryAction={() => window.open('/help/deliverables', '_blank')}
    />
  );
}

export function NoTicketsEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-16 w-16" />}
      title="No Support Tickets"
      description="Create tickets to report issues, request features, or ask questions. Track responses and resolution status in one place."
      actionLabel="Create Ticket"
      onAction={onCreate}
      secondaryActionLabel="Browse FAQ"
      onSecondaryAction={() => window.open('/help/faq', '_blank')}
    />
  );
}

export function NoTeamMembersEmpty({ onInvite }: { onInvite: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-16 w-16" />}
      title="No Team Members"
      description="Invite team members to collaborate on projects. Assign tasks, share updates, and work together more effectively."
      actionLabel="Invite Team Member"
      onAction={onInvite}
      showGettingStarted
    />
  );
}

export function NoSearchResultsEmpty({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="h-16 w-16" />}
      title="No Results Found"
      description="We couldn't find anything matching your search. Try different keywords or clear filters to see all items."
      actionLabel="Clear Filters"
      onAction={onClear}
    />
  );
}
