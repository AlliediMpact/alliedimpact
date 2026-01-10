import { render, screen } from '@testing-library/react';
import { LoadingSkeleton, MatchCardSkeleton, MessageListSkeleton } from '@/components/ui/loading-skeleton';

describe('LoadingSkeleton Component', () => {
  it('should render text skeleton', () => {
    const { container } = render(<LoadingSkeleton variant="text" />);
    expect(container.firstChild).toHaveClass('animate-shimmer');
    expect(container.firstChild).toHaveClass('h-4');
  });

  it('should render circular skeleton', () => {
    const { container } = render(<LoadingSkeleton variant="circular" />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('should render rectangular skeleton', () => {
    const { container } = render(<LoadingSkeleton variant="rectangular" />);
    expect(container.firstChild).toHaveClass('rounded-md');
  });

  it('should support custom width', () => {
    const { container } = render(<LoadingSkeleton width="200px" />);
    expect(container.firstChild).toHaveStyle({ width: '200px' });
  });

  it('should support custom height', () => {
    const { container } = render(<LoadingSkeleton height="50px" />);
    expect(container.firstChild).toHaveStyle({ height: '50px' });
  });

  it('should render multiple skeletons with count prop', () => {
    const { container } = render(<LoadingSkeleton count={3} />);
    expect(container.querySelectorAll('.animate-shimmer')).toHaveLength(3);
  });

  it('should apply shimmer animation', () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.firstChild).toHaveClass('animate-shimmer');
  });
});

describe('MatchCardSkeleton Component', () => {
  it('should render match card skeleton structure', () => {
    const { container } = render(<MatchCardSkeleton />);
    expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-shimmer').length).toBeGreaterThan(5);
  });

  it('should render multiple cards with count prop', () => {
    const { container } = render(<MatchCardSkeleton count={3} />);
    expect(container.querySelectorAll('.rounded-lg')).toHaveLength(3);
  });
});

describe('MessageListSkeleton Component', () => {
  it('should render message list skeleton structure', () => {
    const { container } = render(<MessageListSkeleton />);
    expect(container.querySelectorAll('.animate-shimmer').length).toBeGreaterThan(3);
  });

  it('should render multiple messages with count prop', () => {
    const { container } = render(<MessageListSkeleton count={5} />);
    expect(container.querySelectorAll('.flex').length).toBe(5);
  });
});
