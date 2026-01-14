import { PackageX, FileText, Lightbulb } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'package' | 'file' | 'lightbulb';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const icons = {
  package: PackageX,
  file: FileText,
  lightbulb: Lightbulb,
};

export function EmptyState({
  icon = 'package',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-600 mb-8 max-w-md">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// Specific empty states for common use cases

export function NoBadgesEmpty({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon="lightbulb"
      title="No badges earned yet"
      description="Complete journeys, maintain streaks, and master stages to earn achievement badges!"
      actionLabel="Start Learning"
      onAction={onExplore}
    />
  );
}

export function NoJourneysCompletedEmpty({ onStartJourney }: { onStartJourney?: () => void }) {
  return (
    <EmptyState
      icon="package"
      title="No journeys completed yet"
      description="Start your first journey to begin mastering the K53 test. Progress through 5 stages from beginner to expert!"
      actionLabel="Start First Journey"
      onAction={onStartJourney}
    />
  );
}

export function NoCertificatesEmpty({ onViewJourneys }: { onViewJourneys?: () => void }) {
  return (
    <EmptyState
      icon="file"
      title="No certificates earned yet"
      description="Master stages to earn official certificates. Achieve 95%+ mastery to unlock your first certificate!"
      actionLabel="View Journeys"
      onAction={onViewJourneys}
    />
  );
}

export function NoSchoolsFoundEmpty() {
  return (
    <EmptyState
      icon="package"
      title="No driving schools found"
      description="Try adjusting your search or filter criteria to find driving schools in your area."
    />
  );
}

export function NoAttemptsEmpty() {
  return (
    <EmptyState
      icon="file"
      title="No journey attempts yet"
      description="Your journey history will appear here once you complete your first attempt."
    />
  );
}

export function NoSearchResultsEmpty() {
  return (
    <EmptyState
      icon="package"
      title="No results found"
      description="We couldn't find anything matching your search. Try different keywords."
    />
  );
}
