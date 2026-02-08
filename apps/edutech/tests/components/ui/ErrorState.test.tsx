/**
 * Tests for ErrorState component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from '../../../src/components/ui/ErrorState';

describe('ErrorState', () => {
  describe('rendering', () => {
    it('should render with default title and description', () => {
      render(<ErrorState />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText('We encountered an error. Please try again.')
      ).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<ErrorState title="Custom Error Title" />);

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    });

    it('should render with custom description', () => {
      render(<ErrorState description="Custom error description" />);

      expect(screen.getByText('Custom error description')).toBeInTheDocument();
    });

    it('should render error icon', () => {
      render(<ErrorState />);

      // Check for alert role (should be present on error state)
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<ErrorState className="custom-error-class" />);

      const errorDiv = container.firstChild;
      expect(errorDiv).toHaveClass('custom-error-class');
    });
  });

  describe('with action button', () => {
    it('should render action button when provided', () => {
      const action = <button>Try Again</button>;

      render(<ErrorState action={action} />);

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });

    it('should render action link when provided', () => {
      const action = <a href="/home">Go Home</a>;

      render(<ErrorState action={action} />);

      expect(screen.getByRole('link', { name: 'Go Home' })).toBeInTheDocument();
    });

    it('should handle action button clicks', () => {
      const handleClick = jest.fn();
      const action = <button onClick={handleClick}>Retry</button>;

      render(<ErrorState action={action} />);

      const button = screen.getByRole('button', { name: 'Retry' });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render multiple action buttons', () => {
      const action = (
        <div>
          <button>Try Again</button>
          <button>Go Back</button>
        </div>
      );

      render(<ErrorState action={action} />);

      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
    });

    it('should not render action container when no action provided', () => {
      const { container } = render(<ErrorState />);

      // Should not have the action div
      const actionDiv = container.querySelector('div > div');
      expect(actionDiv).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have centered layout', () => {
      const { container } = render(<ErrorState />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveClass('flex');
      expect(errorDiv).toHaveClass('flex-col');
      expect(errorDiv).toHaveClass('items-center');
      expect(errorDiv).toHaveClass('justify-center');
      expect(errorDiv).toHaveClass('text-center');
    });

    it('should have proper spacing', () => {
      const { container } = render(<ErrorState />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv).toHaveClass('py-12');
      expect(errorDiv).toHaveClass('px-4');
    });

    it('should style error icon with red color', () => {
      const { container } = render(<ErrorState />);

      const iconDiv = container.querySelector('.text-red-500');
      expect(iconDiv).toBeInTheDocument();
    });

    it('should style title with proper typography', () => {
      render(<ErrorState title="Error Title" />);

      const title = screen.getByText('Error Title');
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('mb-2');
    });

    it('should style description with proper typography', () => {
      render(<ErrorState description="Error description" />);

      const description = screen.getByText('Error description');
      expect(description).toHaveClass('text-gray-600');
      expect(description).toHaveClass('max-w-md');
      expect(description).toHaveClass('mb-6');
    });
  });

  describe('accessibility', () => {
    it('should have role="alert" for screen readers', () => {
      render(<ErrorState />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have accessible title', () => {
      render(<ErrorState title="Network Error" />);

      const title = screen.getByRole('heading', { name: 'Network Error' });
      expect(title).toBeInTheDocument();
    });

    it('should have accessible description text', () => {
      render(<ErrorState description="Could not connect to server" />);

      expect(screen.getByText('Could not connect to server')).toBeInTheDocument();
    });
  });

  describe('use cases', () => {
    it('should render network error state', () => {
      render(
        <ErrorState
          title="Network Error"
          description="Unable to connect to the server. Please check your internet connection."
          action={<button>Retry</button>}
        />
      );

      expect(screen.getByText('Network Error')).toBeInTheDocument();
      expect(
        screen.getByText(/Unable to connect to the server/)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('should render authentication error state', () => {
      render(
        <ErrorState
          title="Access Denied"
          description="You don't have permission to view this page."
          action={<a href="/login">Sign In</a>}
        />
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('should render not found error state', () => {
      render(
        <ErrorState
          title="Page Not Found"
          description="The page you're looking for doesn't exist."
          action={<a href="/">Go Home</a>}
        />
      );

      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Go Home' })).toBeInTheDocument();
    });

    it('should render server error state', () => {
      render(
        <ErrorState
          title="Server Error"
          description="Something went wrong on our end. Our team has been notified."
        />
      );

      expect(screen.getByText('Server Error')).toBeInTheDocument();
      expect(
        screen.getByText(/Something went wrong on our end/)
      ).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty title', () => {
      render(<ErrorState title="" />);

      // Should render but title is empty
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle empty description', () => {
      render(<ErrorState description="" />);

      // Should render but description is empty
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<ErrorState title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(500);
      render(<ErrorState description={longDescription} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should handle null action gracefully', () => {
      render(<ErrorState action={null} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle undefined action gracefully', () => {
      render(<ErrorState action={undefined} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('dark mode support', () => {
    it('should have dark mode text colors', () => {
      render(<ErrorState />);

      const title = screen.getByText('Something went wrong');
      expect(title).toHaveClass('dark:text-white');

      const description = screen.getByText(
        'We encountered an error. Please try again.'
      );
      expect(description).toHaveClass('dark:text-gray-400');
    });
  });
});
