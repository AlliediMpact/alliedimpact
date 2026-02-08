/**
 * Tests for Skeleton loading components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonCourseCard,
} from '../../src/components/ui/Skeleton';

describe('Skeleton', () => {
  describe('basic rendering', () => {
    it('should render skeleton element', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toBeInTheDocument();
    });

    it('should have animate-pulse class', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should have bg-muted class', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('bg-muted');
    });

    it('should have rounded-md class', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('rounded-md');
    });

    it('should have role="status"', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveAttribute('role', 'status');
    });

    it('should have aria-label', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveAttribute('aria-label', 'Loading...');
    });

    it('should have sr-only text', () => {
      render(<Skeleton />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
  });

  describe('custom className', () => {
    it('should accept custom className', () => {
      const { container } = render(<Skeleton className="h-10 w-full" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('h-10', 'w-full');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<Skeleton className="custom-class" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('animate-pulse', 'bg-muted', 'rounded-md', 'custom-class');
    });

    it('should handle multiple custom classes', () => {
      const { container } = render(
        <Skeleton className="h-20 w-20 rounded-full" />
      );

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('h-20', 'w-20', 'rounded-full');
    });
  });
});

describe('SkeletonText', () => {
  describe('rendering', () => {
    it('should render 3 lines by default', () => {
      const { container } = render(<SkeletonText />);

      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(3);
    });

    it('should render custom number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />);

      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(5);
    });

    it('should render single line', () => {
      const { container } = render(<SkeletonText lines={1} />);

      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(1);
    });

    it('should render zero lines', () => {
      const { container } = render(<SkeletonText lines={0} />);

      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(0);
    });
  });

  describe('styling', () => {
    it('should have space-y-2 class on container', () => {
      const { container } = render(<SkeletonText />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('space-y-2');
    });

    it('should have h-4 class on all lines', () => {
      const { container } = render(<SkeletonText lines={3} />);

      const skeletons = container.querySelectorAll('[role="status"]');
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass('h-4');
      });
    });

    it('should have w-full on non-last lines', () => {
      const { container } = render(<SkeletonText lines={3} />);

      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons[0]).toHaveClass('w-full');
      expect(skeletons[1]).toHaveClass('w-full');
    });

    it('should have w-2/3 on last line', () => {
      const { container } = render(<SkeletonText lines={3} />);

      const skeletons = container.querySelectorAll('[role="status"]');
      const lastSkeleton = skeletons[skeletons.length - 1];
      expect(lastSkeleton).toHaveClass('w-2/3');
    });
  });
});

describe('SkeletonCard', () => {
  describe('rendering', () => {
    it('should render card container', () => {
      const { container } = render(<SkeletonCard />);

      const card = container.querySelector('.border.rounded-lg.p-4');
      expect(card).toBeInTheDocument();
    });

    it('should render image placeholder', () => {
      const { container } = render(<SkeletonCard />);

      const image = container.querySelector('.h-48.w-full');
      expect(image).toBeInTheDocument();
    });

    it('should render title placeholder', () => {
      const { container } = render(<SkeletonCard />);

      const title = container.querySelector('.h-6.w-3\\/4');
      expect(title).toBeInTheDocument();
    });

    it('should render text lines', () => {
      const { container } = render(<SkeletonCard />);

      // SkeletonText with 2 lines
      const textLines = container.querySelectorAll('.h-4');
      expect(textLines.length).toBeGreaterThanOrEqual(2);
    });

    it('should render action buttons', () => {
      const { container } = render(<SkeletonCard />);

      const buttons = container.querySelectorAll('.h-8.w-20');
      expect(buttons).toHaveLength(2);
    });
  });

  describe('styling', () => {
    it('should have border and rounded corners', () => {
      const { container } = render(<SkeletonCard />);

      const card = container.firstChild;
      expect(card).toHaveClass('border', 'rounded-lg');
    });

    it('should have padding', () => {
      const { container } = render(<SkeletonCard />);

      const card = container.firstChild;
      expect(card).toHaveClass('p-4');
    });

    it('should have space-y-4 for vertical spacing', () => {
      const { container } = render(<SkeletonCard />);

      const card = container.firstChild;
      expect(card).toHaveClass('space-y-4');
    });

    it('should have flex gap-2 for buttons', () => {
      const { container } = render(<SkeletonCard />);

      const buttonContainer = container.querySelector('.flex.gap-2');
      expect(buttonContainer).toBeInTheDocument();
    });
  });
});

describe('SkeletonCourseCard', () => {
  describe('rendering', () => {
    it('should render course card container', () => {
      const { container } = render(<SkeletonCourseCard />);

      const card = container.querySelector('.border.rounded-lg.overflow-hidden');
      expect(card).toBeInTheDocument();
    });

    it('should render thumbnail placeholder', () => {
      const { container } = render(<SkeletonCourseCard />);

      const thumbnail = container.querySelector('.h-48.w-full');
      expect(thumbnail).toBeInTheDocument();
    });

    it('should render track badge placeholder', () => {
      const { container } = render(<SkeletonCourseCard />);

      const badge = container.querySelector('.h-5.w-24');
      expect(badge).toBeInTheDocument();
    });

    it('should render title placeholder', () => {
      const { container } = render(<SkeletonCourseCard />);

      const title = container.querySelector('.h-6.w-full');
      expect(title).toBeInTheDocument();
    });

    it('should render description lines', () => {
      const { container } = render(<SkeletonCourseCard />);

      // SkeletonText with 2 lines
      const textLines = container.querySelectorAll('.space-y-2');
      expect(textLines.length).toBeGreaterThan(0);
    });

    it('should render meta info placeholders', () => {
      const { container } = render(<SkeletonCourseCard />);

      const metaContainer = container.querySelector('.flex.items-center.gap-4');
      expect(metaContainer).toBeInTheDocument();

      const metaItems = metaContainer?.querySelectorAll('.h-4');
      expect(metaItems?.length).toBeGreaterThanOrEqual(3);
    });

    it('should render button placeholder', () => {
      const { container } = render(<SkeletonCourseCard />);

      const button = container.querySelector('.h-10.w-full');
      expect(button).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have border and rounded corners', () => {
      const { container } = render(<SkeletonCourseCard />);

      const card = container.firstChild;
      expect(card).toHaveClass('border', 'rounded-lg', 'overflow-hidden');
    });

    it('should have content padding', () => {
      const { container } = render(<SkeletonCourseCard />);

      const content = container.querySelector('.p-4');
      expect(content).toBeInTheDocument();
    });

    it('should have space-y-3 for vertical spacing', () => {
      const { container } = render(<SkeletonCourseCard />);

      const content = container.querySelector('.space-y-3');
      expect(content).toBeInTheDocument();
    });
  });

  describe('meta info', () => {
    it('should render duration placeholder', () => {
      const { container } = render(<SkeletonCourseCard />);

      const metaItems = container.querySelectorAll('.flex.items-center.gap-4 .h-4');
      expect(metaItems[0]).toHaveClass('w-16');
    });

    it('should render level placeholder', () => {
      const { container } = render(<SkeletonCourseCard />);

      const metaItems = container.querySelectorAll('.flex.items-center.gap-4 .h-4');
      expect(metaItems[1]).toHaveClass('w-16');
    });

    it('should render students placeholder', () => {
      const { container } = render(<SkeletonCourseCard />);

      const metaItems = container.querySelectorAll('.flex.items-center.gap-4 .h-4');
      expect(metaItems[2]).toHaveClass('w-20');
    });
  });
});

describe('Accessibility', () => {
  it('should have proper ARIA attributes on Skeleton', () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.firstChild;
    expect(skeleton).toHaveAttribute('role', 'status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading...');
  });

  it('should have screen reader text', () => {
    render(<Skeleton />);

    const srText = screen.getByText('Loading...');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });

  it('should have proper ARIA on all skeleton variants', () => {
    const { container } = render(
      <>
        <SkeletonText lines={2} />
        <SkeletonCard />
        <SkeletonCourseCard />
      </>
    );

    const skeletons = container.querySelectorAll('[role="status"]');
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveAttribute('aria-label', 'Loading...');
    });
  });
});

describe('Integration', () => {
  it('should render multiple skeleton types together', () => {
    const { container } = render(
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <SkeletonText lines={2} />
        <SkeletonCard />
        <SkeletonCourseCard />
      </div>
    );

    const skeletons = container.querySelectorAll('[role="status"]');
    expect(skeletons.length).toBeGreaterThan(5);
  });

  it('should render grid of skeleton course cards', () => {
    const { container } = render(
      <div className="grid grid-cols-3 gap-4">
        <SkeletonCourseCard />
        <SkeletonCourseCard />
        <SkeletonCourseCard />
      </div>
    );

    const cards = container.querySelectorAll('.border.rounded-lg.overflow-hidden');
    expect(cards).toHaveLength(3);
  });
});
