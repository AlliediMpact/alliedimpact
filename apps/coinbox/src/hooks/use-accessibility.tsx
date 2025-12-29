'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Accessibility Hook
 * Manages keyboard navigation, focus management, and announces route changes
 */
export function useAccessibility() {
  const pathname = usePathname();

  // Announce route changes to screen readers
  useEffect(() => {
    const pageTitle = document.title;
    const announcement = `Navigated to ${pageTitle}`;
    
    // Create or update live region for announcements
    let liveRegion = document.getElementById('route-announcer');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'route-announcer';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    // Announce after a short delay to ensure screen readers catch it
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }, 100);

    // Move focus to main content
    const mainContent = document.querySelector('main');
    if (mainContent && mainContent instanceof HTMLElement) {
      mainContent.focus({ preventScroll: true });
    }
  }, [pathname]);

  // Handle skip to main content
  useEffect(() => {
    const handleSkipLink = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        const skipLink = document.querySelector('[href="#main-content"]');
        if (skipLink && document.activeElement === document.body) {
          (skipLink as HTMLElement).focus();
        }
      }
    };

    document.addEventListener('keydown', handleSkipLink);
    return () => document.removeEventListener('keydown', handleSkipLink);
  }, []);
}

/**
 * Skip to Main Content Link Component
 * Provides keyboard users quick access to main content
 */
export function SkipToMainContent(): JSX.Element {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    // @ts-ignore - JSX return in .ts file
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      onClick={handleClick}
    >
      Skip to main content
    </a>
  );
}

/**
 * Keyboard Navigation Hook
 * Enhances keyboard navigation for complex UI components
 */
export function useKeyboardNavigation(options: {
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
} = {}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          options.onEscape?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          options.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          options.onArrowDown?.();
          break;
        case 'ArrowLeft':
          options.onArrowLeft?.();
          break;
        case 'ArrowRight':
          options.onArrowRight?.();
          break;
        case 'Enter':
          options.onEnter?.();
          break;
        case ' ':
          e.preventDefault();
          options.onSpace?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [options]);
}

/**
 * Focus Trap Hook
 * Traps focus within a container (useful for modals, dropdowns)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when trap activates
    firstElement?.focus();

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [containerRef, isActive]);
}

/**
 * Announces messages to screen readers
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;
  
  document.body.appendChild(liveRegion);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
}

/**
 * Get accessible label for form validation
 */
export function getAriaInvalid(error?: string): {
  'aria-invalid': boolean;
  'aria-describedby'?: string;
} {
  if (!error) return { 'aria-invalid': false };
  
  return {
    'aria-invalid': true,
    'aria-describedby': 'error-message',
  };
}
