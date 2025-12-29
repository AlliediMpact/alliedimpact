/**
 * Accessibility Utilities
 * Helper functions for improving web accessibility (WCAG 2.1 compliance)
 */

/**
 * Check color contrast ratio between two colors
 * Returns ratio and whether it meets WCAG AA/AAA standards
 */
export function checkColorContrast(
  foreground: string,
  background: string
): {
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
} {
  const getLuminance = (hexColor: string): number => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passAA: ratio >= 4.5, // WCAG AA standard for normal text
    passAAA: ratio >= 7, // WCAG AAA standard for normal text
  };
}

/**
 * Generate accessible label from field name
 * Example: "firstName" -> "First Name"
 */
export function generateLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Get ARIA attributes for loading states
 */
export function getLoadingAttributes(isLoading: boolean) {
  return {
    'aria-busy': isLoading,
    'aria-live': 'polite' as const,
  };
}

/**
 * Get ARIA attributes for disabled states
 */
export function getDisabledAttributes(isDisabled: boolean, reason?: string) {
  return {
    'aria-disabled': isDisabled,
    ...(isDisabled && reason ? { 'aria-label': reason } : {}),
  };
}

/**
 * Format number for screen readers
 * Example: 1000000 -> "1 million"
 */
export function formatNumberForScreenReader(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} thousand`;
  }
  return num.toString();
}

/**
 * Format currency for screen readers
 * Example: 1500 -> "1 thousand 5 hundred rand"
 */
export function formatCurrencyForScreenReader(amount: number, currency = 'ZAR'): string {
  const currencyNames: Record<string, string> = {
    ZAR: 'rand',
    USD: 'dollars',
    EUR: 'euros',
    GBP: 'pounds',
  };

  const currencyName = currencyNames[currency] || currency;
  const formatted = formatNumberForScreenReader(amount);

  return `${formatted} ${currencyName}`;
}

/**
 * Format date for screen readers
 * Example: 2024-01-15 -> "January fifteenth, twenty twenty-four"
 */
export function formatDateForScreenReader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get ARIA attributes for required fields
 */
export function getRequiredFieldAttributes(isRequired: boolean) {
  return {
    'aria-required': isRequired,
    required: isRequired,
  };
}

/**
 * Get ARIA attributes for form validation errors
 */
export function getErrorAttributes(error?: string, errorId?: string) {
  if (!error) return {};

  return {
    'aria-invalid': true,
    'aria-describedby': errorId || 'error-message',
  };
}

/**
 * Get ARIA attributes for expandable sections
 */
export function getExpandableAttributes(isExpanded: boolean, controlsId: string) {
  return {
    'aria-expanded': isExpanded,
    'aria-controls': controlsId,
  };
}

/**
 * Get ARIA attributes for selected items
 */
export function getSelectedAttributes(isSelected: boolean) {
  return {
    'aria-selected': isSelected,
    'aria-current': isSelected ? ('true' as const) : undefined,
  };
}

/**
 * Validate if element has sufficient interactive area (touch target)
 * Minimum recommended: 44x44 pixels (WCAG 2.5.5)
 */
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const MIN_SIZE = 44; // pixels

  return rect.width >= MIN_SIZE && rect.height >= MIN_SIZE;
}

/**
 * Add keyboard navigation to a list of elements
 */
export function setupListNavigation(
  container: HTMLElement,
  itemSelector: string
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    const items = Array.from(container.querySelectorAll(itemSelector));
    const currentIndex = items.findIndex((item) => item === document.activeElement);

    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    (items[nextIndex] as HTMLElement)?.focus();
  };

  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
}

/**
 * Create accessible description for complex data
 */
export function createDataDescription(data: {
  label: string;
  value: string | number;
  unit?: string;
}): string {
  const { label, value, unit } = data;
  return `${label}: ${value}${unit ? ` ${unit}` : ''}`;
}
