/**
 * Accessibility utilities for CareerBox
 * Provides helpers for ARIA attributes, keyboard navigation, and screen reader support
 */

// Screen reader only text (visually hidden but accessible)
export const srOnly = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

// Focus visible ring styles (consistent across app)
export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';

// Keyboard navigation helpers
export function handleEnterKey(callback: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };
}

export function handleEscapeKey(callback: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      callback();
    }
  };
}

export function handleArrowKeys(
  onUp?: () => void,
  onDown?: () => void,
  onLeft?: () => void,
  onRight?: () => void
) {
  return (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        onUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onDown?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onRight?.();
        break;
    }
  };
}

// ARIA helpers
export function getAriaLabel(label: string, description?: string): string {
  return description ? `${label}. ${description}` : label;
}

export function getLiveRegionProps(type: 'polite' | 'assertive' = 'polite') {
  return {
    role: 'status',
    'aria-live': type,
    'aria-atomic': 'true',
  };
}

export function getDialogProps(labelId: string, descriptionId?: string) {
  return {
    role: 'dialog',
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
    'aria-modal': 'true',
  };
}

export function getMenuProps() {
  return {
    role: 'menu',
    'aria-orientation': 'vertical' as const,
  };
}

export function getMenuItemProps(disabled = false) {
  return {
    role: 'menuitem',
    tabIndex: disabled ? -1 : 0,
    'aria-disabled': disabled,
  };
}

export function getTabProps(selected: boolean, controls: string) {
  return {
    role: 'tab',
    'aria-selected': selected,
    'aria-controls': controls,
    tabIndex: selected ? 0 : -1,
  };
}

export function getTabPanelProps(labelledby: string, hidden: boolean) {
  return {
    role: 'tabpanel',
    'aria-labelledby': labelledby,
    hidden,
    tabIndex: 0,
  };
}

export function getProgressBarProps(value: number, max: number, label?: string) {
  return {
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-label': label,
  };
}

export function getAlertProps(type: 'error' | 'warning' | 'info' | 'success') {
  const roleMap = {
    error: 'alert',
    warning: 'alert',
    info: 'status',
    success: 'status',
  };

  return {
    role: roleMap[type],
    'aria-live': type === 'error' || type === 'warning' ? 'assertive' : 'polite',
  };
}

// Form field helpers
export function getFieldProps(id: string, label: string, error?: string, required = false) {
  return {
    id,
    'aria-label': label,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
    'aria-required': required,
  };
}

export function getErrorMessageProps(id: string) {
  return {
    id: `${id}-error`,
    role: 'alert',
    'aria-live': 'polite',
  };
}

// Landmark helpers
export function getMainProps() {
  return {
    role: 'main',
    'aria-label': 'Main content',
  };
}

export function getNavigationProps(label: string) {
  return {
    role: 'navigation',
    'aria-label': label,
  };
}

export function getComplementaryProps(label: string) {
  return {
    role: 'complementary',
    'aria-label': label,
  };
}

// Skip link helper
export function getSkipLinkProps(targetId: string) {
  return {
    href: `#${targetId}`,
    className: `${srOnly} focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md`,
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
  };
}

// Focus trap helper (for modals/dialogs)
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
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

    container.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [isActive, containerRef]);
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = srOnly;
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
