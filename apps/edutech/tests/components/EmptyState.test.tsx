/**
 * Tests for EmptyState and ErrorState components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../../src/components/ui/EmptyState';

// Note: ErrorState is also exported from EmptyState.tsx
const { ErrorState } = require('../../src/components/ui/EmptyState');

describe('EmptyState', () => {
  describe('rendering', () => {
    it('should render with required title', () => {
      render(<EmptyState title="No data found" />);

      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('should render with title and description', () => {
      render(
        <EmptyState
          title="No courses"
          description="You haven't enrolled in any courses yet"
        />
      );

      expect(screen.getByText('No courses')).toBeInTheDocument();
      expect(
        screen.getByText("You haven't enrolled in any courses yet")
      ).toBeInTheDocument();
    });

    it('should render custom icon', () => {
      const CustomIcon = () => <span data-testid="custom-icon">📚</span>;

      render(
        <EmptyState title="No books" icon={<CustomIcon />} />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should not render icon when not provided', () => {
      const { container } = render(<EmptyState title="No data" />);

      const iconContainer = container.querySelector('.mb-4');
      expect(iconContainer).toBeNull();
    });

    it('should not render description when not provided', () => {
      render(<EmptyState title="Empty" />);

      const description = document.querySelector('.text-sm.text-gray-600');
      expect(description).not.toBeInTheDocument();
    });
  });

  describe('action button', () => {
    it('should render action button when provided', () => {
      const handleClick = jest.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Add New',
            onClick: handleClick,
          }}
        />
      );

      expect(screen.getByText('Add New')).toBeInTheDocument();
    });

    it('should call onClick when action button is clicked', () => {
      const handleClick = jest.fn();

      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Create',
            onClick: handleClick,
          }}
        />
      );

      const button = screen.getByText('Create');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not render action button when not provided', () => {
      render(<EmptyState title="No data" />);

      const button = document.querySelector('button');
      expect(button).not.toBeInTheDocument();
    });

    it('should have correct button styles', () => {
      render(
        <EmptyState
          title="No data"
          action={{
            label: 'Action',
            onClick: jest.fn(),
          }}
        />
      );

      const button = screen.getByText('Action');
      expect(button).toHaveClass(
        'px-4',
        'py-2',
        'bg-primary-blue',
        'text-white',
        'rounded-lg',
        'hover:bg-blue-700',
        'transition-colors'
      );
    });
  });

  describe('styling', () => {
    it('should have correct container styles', () => {
      const { container } = render(<EmptyState title="Empty" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'py-12',
        'px-4',
        'text-center'
      );
    });

    it('should have correct title styles', () => {
      render(<EmptyState title="Empty State" />);

      const title = screen.getByText('Empty State');
      expect(title).toHaveClass(
        'text-lg',
        'font-semibold',
        'text-gray-900',
        'mb-2'
      );
    });

    it('should have correct description styles', () => {
      render(
        <EmptyState
          title="Empty"
          description="No data available"
        />
      );

      const description = screen.getByText('No data available');
      expect(description).toHaveClass(
        'text-sm',
        'text-gray-600',
        'max-w-sm',
        'mb-6'
      );
    });
  });

  describe('full component integration', () => {
    it('should render complete empty state with all props', () => {
      const handleAction = jest.fn();
      const Icon = () => <span data-testid="icon">🎓</span>;

      render(
        <EmptyState
          title="No enrollments"
          description="Start your learning journey today"
          icon={<Icon />}
          action={{
            label: 'Browse Courses',
            onClick: handleAction,
          }}
        />
      );

      expect(screen.getByText('No enrollments')).toBeInTheDocument();
      expect(screen.getByText('Start your learning journey today')).toBeInTheDocument();
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Browse Courses')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Browse Courses'));
      expect(handleAction).toHaveBeenCalled();
    });
  });
});

describe('ErrorState', () => {
  describe('rendering', () => {
    it('should render with required title', () => {
      render(<ErrorState title="Error occurred" />);

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('should render with title and description', () => {
      render(
        <ErrorState
          title="Failed to load"
          description="Please check your connection"
        />
      );

      expect(screen.getByText('Failed to load')).toBeInTheDocument();
      expect(screen.getByText('Please check your connection')).toBeInTheDocument();
    });

    it('should render error icon', () => {
      const { container } = render(<ErrorState title="Error" />);

      const iconContainer = container.querySelector('.w-16.h-16.bg-red-100');
      expect(iconContainer).toBeInTheDocument();

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-8', 'h-8', 'text-red-600');
    });

    it('should not render description when not provided', () => {
      render(<ErrorState title="Error" />);

      const description = document.querySelector('.text-sm.text-gray-600');
      expect(description).not.toBeInTheDocument();
    });
  });

  describe('action button', () => {
    it('should render action button when provided', () => {
      const handleRetry = jest.fn();

      render(
        <ErrorState
          title="Error"
          action={{
            label: 'Retry',
            onClick: handleRetry,
          }}
        />
      );

      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should call onClick when action button is clicked', () => {
      const handleRetry = jest.fn();

      render(
        <ErrorState
          title="Error"
          action={{
            label: 'Try Again',
            onClick: handleRetry,
          }}
        />
      );

      fireEvent.click(screen.getByText('Try Again'));

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should call onClick multiple times', () => {
      const handleRetry = jest.fn();

      render(
        <ErrorState
          title="Error"
          action={{
            label: 'Retry',
            onClick: handleRetry,
          }}
        />
      );

      const button = screen.getByText('Retry');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('styling', () => {
    it('should have correct container styles', () => {
      const { container } = render(<ErrorState title="Error" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'py-12',
        'px-4',
        'text-center'
      );
    });

    it('should have correct title styles', () => {
      render(<ErrorState title="Error Message" />);

      const title = screen.getByText('Error Message');
      expect(title).toHaveClass(
        'text-lg',
        'font-semibold',
        'text-gray-900',
        'mb-2'
      );
    });

    it('should have correct icon container styles', () => {
      const { container } = render(<ErrorState title="Error" />);

      const iconContainer = container.querySelector('.w-16.h-16');
      expect(iconContainer).toHaveClass(
        'w-16',
        'h-16',
        'bg-red-100',
        'rounded-full',
        'flex',
        'items-center',
        'justify-center',
        'mb-4'
      );
    });
  });

  describe('full component integration', () => {
    it('should render complete error state with all props', () => {
      const handleRetry = jest.fn();

      render(
        <ErrorState
          title="Connection Failed"
          description="Unable to connect to server"
          action={{
            label: 'Retry Connection',
            onClick: handleRetry,
          }}
        />
      );

      expect(screen.getByText('Connection Failed')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to server')).toBeInTheDocument();
      expect(screen.getByText('Retry Connection')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Retry Connection'));
      expect(handleRetry).toHaveBeenCalled();
    });
  });
});
