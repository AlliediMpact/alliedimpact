/**
 * Accessibility Utilities
 * Helpers for WCAG 2.1 AA compliance
 */

/**
 * Generate unique ID for accessibility labels
 */
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;
  if (element.hasAttribute('disabled')) return false;
  
  const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  return focusableTags.includes(element.tagName);
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Trap focus within a container (for modals, dropdowns)
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent) {
  if (event.key !== 'Tab') return;
  
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

/**
 * Check color contrast ratio (for WCAG AA: 4.5:1 for normal text, 3:1 for large text)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const luminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Calculate relative luminance
    const [rs, gs, bs] = [r, g, b].map((c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Handle keyboard navigation for lists/grids
 */
export function handleArrowNavigation(
  event: KeyboardEvent,
  container: HTMLElement,
  orientation: 'horizontal' | 'vertical' | 'grid' = 'vertical'
) {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
  
  if (currentIndex === -1) return;
  
  let nextIndex = currentIndex;
  
  switch (event.key) {
    case 'ArrowDown':
      if (orientation === 'vertical' || orientation === 'grid') {
        event.preventDefault();
        nextIndex = Math.min(currentIndex + 1, focusableElements.length - 1);
      }
      break;
    case 'ArrowUp':
      if (orientation === 'vertical' || orientation === 'grid') {
        event.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
      }
      break;
    case 'ArrowRight':
      if (orientation === 'horizontal' || orientation === 'grid') {
        event.preventDefault();
        nextIndex = Math.min(currentIndex + 1, focusableElements.length - 1);
      }
      break;
    case 'ArrowLeft':
      if (orientation === 'horizontal' || orientation === 'grid') {
        event.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
      }
      break;
    case 'Home':
      event.preventDefault();
      nextIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      nextIndex = focusableElements.length - 1;
      break;
  }
  
  if (nextIndex !== currentIndex) {
    focusableElements[nextIndex]?.focus();
  }
}

/**
 * Format bytes for screen readers
 */
export function formatBytesAccessible(bytes: number): string {
  if (bytes === 0) return '0 bytes';
  
  const k = 1024;
  const sizes = ['bytes', 'kilobytes', 'megabytes', 'gigabytes'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  
  return `${value} ${sizes[i]}`;
}

/**
 * Format time duration for screen readers
 */
export function formatDurationAccessible(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
}
