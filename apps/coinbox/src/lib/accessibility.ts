/**
 * Accessibility Utilities
 * Ensures the application is accessible to all users
 */

// Focus Management
export class FocusManager {
  private static focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(this.focusableSelectors)
    ) as HTMLElement[];
  }

  static trapFocus(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => container.removeEventListener('keydown', handleKeyDown);
  }

  static restoreFocus(previousElement: HTMLElement | null) {
    if (previousElement && previousElement.focus) {
      previousElement.focus();
    }
  }
}

// Keyboard Navigation
export const keyboardShortcuts = {
  // Navigation
  goToHome: { key: 'h', ctrlKey: true, description: 'Go to home' },
  goToLoans: { key: 'l', ctrlKey: true, description: 'Go to loans' },
  goToInvestments: { key: 'i', ctrlKey: true, description: 'Go to investments' },
  goToWallet: { key: 'w', ctrlKey: true, description: 'Go to wallet' },
  
  // Actions
  createNew: { key: 'n', ctrlKey: true, description: 'Create new' },
  search: { key: 'k', ctrlKey: true, description: 'Search' },
  help: { key: '?', description: 'Show help' },
  
  // UI
  toggleTheme: { key: 't', ctrlKey: true, description: 'Toggle theme' },
  closeModal: { key: 'Escape', description: 'Close modal/dialog' },
};

export function registerKeyboardShortcut(
  shortcut: typeof keyboardShortcuts[keyof typeof keyboardShortcuts],
  handler: () => void
) {
  const handleKeyPress = (e: KeyboardEvent) => {
    const matchesKey = e.key === shortcut.key;
    const matchesCtrl = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : true;
    
    if (matchesKey && matchesCtrl) {
      e.preventDefault();
      handler();
    }
  };

  document.addEventListener('keydown', handleKeyPress);
  
  return () => document.removeEventListener('keydown', handleKeyPress);
}

// Screen Reader Utilities
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Skip Links
export function createSkipLink(targetId: string, label: string) {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'skip-link';
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  
  return skipLink;
}

// ARIA Utilities
export const ariaHelpers = {
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  },
  
  setPressed: (element: HTMLElement, pressed: boolean) => {
    element.setAttribute('aria-pressed', pressed.toString());
  },
  
  setHidden: (element: HTMLElement, hidden: boolean) => {
    if (hidden) {
      element.setAttribute('aria-hidden', 'true');
      element.style.display = 'none';
    } else {
      element.removeAttribute('aria-hidden');
      element.style.display = '';
    }
  },
  
  setLive: (element: HTMLElement, mode: 'off' | 'polite' | 'assertive') => {
    element.setAttribute('aria-live', mode);
  },
  
  setLabel: (element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label);
  },
  
  setDescribedBy: (element: HTMLElement, ids: string[]) => {
    element.setAttribute('aria-describedby', ids.join(' '));
  },
};

// Color Contrast Checker
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  // Simplified implementation - in production use a proper color contrast library
  const getLuminance = (color: string): number => {
    // Parse hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const [rs, gs, bs] = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio,
    wcagAA: ratio >= 4.5, // Normal text
    wcagAAA: ratio >= 7,
  };
}

// Form Accessibility
export const formAccessibility = {
  associateLabel: (input: HTMLInputElement, label: HTMLLabelElement) => {
    const id = input.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    input.id = id;
    label.htmlFor = id;
  },
  
  addErrorMessage: (input: HTMLInputElement, errorId: string, message: string) => {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorId);
    
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.setAttribute('role', 'alert');
    }
  },
  
  clearError: (input: HTMLInputElement, errorId: string) => {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.removeAttribute('role');
    }
  },
  
  addRequiredIndicator: (label: HTMLLabelElement) => {
    const required = document.createElement('span');
    required.textContent = '*';
    required.className = 'text-destructive';
    required.setAttribute('aria-label', 'required');
    label.appendChild(required);
  },
};
