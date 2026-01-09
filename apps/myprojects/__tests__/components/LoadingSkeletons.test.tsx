import { render } from '@testing-library/react';
import { LoadingSkeletons } from '../../components/LoadingSkeletons';

describe('LoadingSkeletons', () => {
  it('should render CardSkeleton without crashing', () => {
    const { container } = render(<LoadingSkeletons.CardSkeleton />);
    expect(container).toBeTruthy();
  });

  it('should render MilestoneCardSkeleton without crashing', () => {
    const { container } = render(<LoadingSkeletons.MilestoneCardSkeleton />);
    expect(container).toBeTruthy();
  });

  it('should render DeliverableCardSkeleton without crashing', () => {
    const { container } = render(<LoadingSkeletons.DeliverableCardSkeleton />);
    expect(container).toBeTruthy();
  });

  it('should render TicketCardSkeleton without crashing', () => {
    const { container } = render(<LoadingSkeletons.TicketCardSkeleton />);
    expect(container).toBeTruthy();
  });

  it('should render TableRowSkeleton without crashing', () => {
    const { container } = render(<LoadingSkeletons.TableRowSkeleton />);
    expect(container).toBeTruthy();
  });

  it('should render StatCardSkeleton without crashing', () => {
    const { container } = render(<LoadingSkeletons.StatCardSkeleton />);
    expect(container).toBeTruthy();
  });

  it('should render DashboardSkeleton without crashing', () => {
    const { container } = render(<LoadingSkeletons.DashboardSkeleton />);
    expect(container).toBeTruthy();
  });

  it('should render ListSkeleton with default count', () => {
    const { container } = render(<LoadingSkeletons.ListSkeleton />);
    expect(container).toBeTruthy();
  });

  it('should render ListSkeleton with custom count', () => {
    const { container } = render(<LoadingSkeletons.ListSkeleton count={5} />);
    expect(container).toBeTruthy();
    // Should have 5 skeleton items
    const skeletonItems = container.querySelectorAll('[class*="skeleton"]');
    expect(skeletonItems.length).toBeGreaterThanOrEqual(5);
  });
});
