// Loading skeleton components for better UX

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="h-4 w-1/3 bg-muted rounded mb-4"></div>
      <div className="h-3 w-full bg-muted rounded mb-2"></div>
      <div className="h-3 w-2/3 bg-muted rounded"></div>
    </div>
  );
}

export function MilestoneCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 animate-pulse space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-5 w-3/4 bg-muted rounded mb-2"></div>
          <div className="h-3 w-1/2 bg-muted rounded"></div>
        </div>
        <div className="h-6 w-16 bg-muted rounded"></div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-muted rounded"></div>
          <div className="h-3 w-8 bg-muted rounded"></div>
        </div>
        <div className="h-2 w-full bg-muted rounded"></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 bg-muted rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted rounded"></div>
          <div className="h-8 w-8 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function DeliverableCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 animate-pulse space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-5 w-2/3 bg-muted rounded mb-2"></div>
          <div className="h-3 w-1/3 bg-muted rounded"></div>
        </div>
        <div className="h-6 w-20 bg-muted rounded"></div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded"></div>
        <div className="h-3 w-4/5 bg-muted rounded"></div>
      </div>

      {/* Files */}
      <div className="flex items-center gap-2 pt-2">
        <div className="h-4 w-4 bg-muted rounded"></div>
        <div className="h-3 w-20 bg-muted rounded"></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="h-3 w-24 bg-muted rounded"></div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted rounded"></div>
          <div className="h-8 w-24 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function TicketCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 animate-pulse space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted rounded"></div>
          <div>
            <div className="h-5 w-48 bg-muted rounded mb-2"></div>
            <div className="h-3 w-24 bg-muted rounded"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted rounded"></div>
          <div className="h-6 w-16 bg-muted rounded"></div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded"></div>
        <div className="h-3 w-5/6 bg-muted rounded"></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-3 w-32 bg-muted rounded"></div>
        <div className="h-3 w-20 bg-muted rounded"></div>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-full bg-muted rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-full bg-muted rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 bg-muted rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-muted rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted rounded"></div>
          <div className="h-8 w-8 bg-muted rounded"></div>
        </div>
      </td>
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-muted rounded"></div>
        <div className="h-8 w-8 bg-muted rounded-full"></div>
      </div>
      <div className="h-8 w-16 bg-muted rounded mb-2"></div>
      <div className="h-3 w-32 bg-muted rounded"></div>
    </div>
  );
}

export function ProjectStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>

      {/* Stats Grid */}
      <ProjectStatsSkeleton />

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones Section */}
        <div className="space-y-4">
          <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4"></div>
          <MilestoneCardSkeleton />
          <MilestoneCardSkeleton />
          <MilestoneCardSkeleton />
        </div>

        {/* Deliverables Section */}
        <div className="space-y-4">
          <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4"></div>
          <DeliverableCardSkeleton />
          <DeliverableCardSkeleton />
        </div>
      </div>

      {/* Tickets Section */}
      <div className="space-y-4 mt-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4"></div>
        <TicketCardSkeleton />
        <TicketCardSkeleton />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-5 w-3/4 bg-muted rounded mb-3"></div>
          <div className="h-3 w-full bg-muted rounded mb-2"></div>
          <div className="h-3 w-2/3 bg-muted rounded"></div>
        </div>
      ))}
    </div>
  );
}
