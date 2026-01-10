import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/ui/empty-state';
import { TrendingUp } from 'lucide-react';

describe('EmptyState Component', () => {
  it('should render with title and description', () => {
    render(
      <EmptyState
        icon={TrendingUp}
        title="No matches yet"
        description="Complete your profile to start matching"
      />
    );

    expect(screen.getByText(/no matches yet/i)).toBeInTheDocument();
    expect(screen.getByText(/complete your profile/i)).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    const handleAction = jest.fn();
    render(
      <EmptyState
        icon={TrendingUp}
        title="No matches"
        description="Get started"
        action="Complete Profile"
        onAction={handleAction}
      />
    );

    expect(screen.getByRole('button', { name: /complete profile/i })).toBeInTheDocument();
  });

  it('should call onAction when button is clicked', async () => {
    const handleAction = jest.fn();
    const user = userEvent.setup();
    
    render(
      <EmptyState
        icon={TrendingUp}
        title="No matches"
        description="Get started"
        action="Complete Profile"
        onAction={handleAction}
      />
    );

    await user.click(screen.getByRole('button', { name: /complete profile/i }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when action is not provided', () => {
    render(
      <EmptyState
        icon={TrendingUp}
        title="No matches"
        description="Get started"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(
      <EmptyState
        icon={TrendingUp}
        title="No matches"
        description="Get started"
      />
    );

    const emptyState = screen.getByRole('status');
    expect(emptyState).toHaveAttribute('aria-label', 'Empty state');
  });

  it('should render icon', () => {
    const { container } = render(
      <EmptyState
        icon={TrendingUp}
        title="No matches"
        description="Get started"
      />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should apply gradient background to icon container', () => {
    const { container } = render(
      <EmptyState
        icon={TrendingUp}
        title="No matches"
        description="Get started"
      />
    );

    const iconContainer = container.querySelector('.bg-gradient-to-br');
    expect(iconContainer).toBeInTheDocument();
  });
});
