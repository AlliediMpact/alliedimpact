/**
 * Keyboard Navigation Hook
 * Provides accessible keyboard navigation for interactive elements
 */

import { useEffect, useRef } from 'react';
import { handleArrowNavigation, trapFocus } from '@/lib/accessibility';

interface UseKeyboardNavigationOptions {
  orientation?: 'horizontal' | 'vertical' | 'grid';
  trapFocus?: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    orientation = 'vertical',
    trapFocus: shouldTrapFocus = false,
    onEscape,
    onEnter,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle enter key
      if (event.key === 'Enter' && onEnter) {
        event.preventDefault();
        onEnter();
        return;
      }

      // Handle arrow navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        handleArrowNavigation(event, container, orientation);
        return;
      }

      // Handle focus trap
      if (shouldTrapFocus && event.key === 'Tab') {
        trapFocus(container, event);
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [orientation, shouldTrapFocus, onEscape, onEnter]);

  return containerRef;
}
