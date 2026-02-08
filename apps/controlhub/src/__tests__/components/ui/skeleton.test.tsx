import { render, screen } from '@testing-library/react';

// Mock skeleton component since it's likely a simple UI component
import { Skeleton } from '../../components/ui/skeleton';

describe('Skeleton Component', () => {
  it('should render with default styles', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;
    
    expect(skeleton).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should render multiple skeletons', () => {
    render(
      <div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );

    const skeletons = document.querySelectorAll('[class*="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it('should be accessible', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    // Skeleton should not have interactive elements
    expect(skeleton).not.toHaveAttribute('tabindex');
  });

  it('should handle different sizes through className', () => {
    const { container } = render(
      <>
        <Skeleton className="h-4 w-4" data-testid="small" />
        <Skeleton className="h-8 w-8" data-testid="medium" />
        <Skeleton className="h-12 w-12" data-testid="large" />
      </>
    );

    const small = screen.getByTestId('small');
    const medium = screen.getByTestId('medium');
    const large = screen.getByTestId('large');

    expect(small).toBeInTheDocument();
    expect(medium).toBeInTheDocument();
    expect(large).toBeInTheDocument();
  });
});
