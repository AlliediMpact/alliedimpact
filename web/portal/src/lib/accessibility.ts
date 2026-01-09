/**
 * Accessibility Testing Utilities
 * Provides helpers for WCAG 2.1 compliance testing
 */

import { logger } from './logger';

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  element?: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export class AccessibilityChecker {
  private issues: AccessibilityIssue[] = [];

  /**
   * Check for missing alt text on images
   */
  checkImageAltText(): AccessibilityIssue[] {
    if (typeof document === 'undefined') return [];

    const issues: AccessibilityIssue[] = [];
    const images = document.querySelectorAll('img');

    images.forEach((img, index) => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          type: 'error',
          rule: 'WCAG 1.1.1 - Non-text Content',
          message: `Image missing alt text at index ${index}`,
          element: img.outerHTML.substring(0, 100),
          wcagLevel: 'A',
        });
      }
    });

    return issues;
  }

  /**
   * Check for proper heading hierarchy
   */
  checkHeadingHierarchy(): AccessibilityIssue[] {
    if (typeof document === 'undefined') return [];

    const issues: AccessibilityIssue[] = [];
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));

    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName[1]);

      // Check if we skip levels
      if (currentLevel - previousLevel > 1) {
        issues.push({
          type: 'warning',
          rule: 'WCAG 1.3.1 - Info and Relationships',
          message: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
          element: heading.outerHTML.substring(0, 100),
          wcagLevel: 'A',
        });
      }

      previousLevel = currentLevel;
    });

    // Check for multiple h1 elements
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count > 1) {
      issues.push({
        type: 'warning',
        rule: 'Best Practice - Single H1',
        message: `Page has ${h1Count} h1 elements. Recommended to have only one.`,
        wcagLevel: 'AAA',
      });
    }

    return issues;
  }

  /**
   * Check for form labels
   */
  checkFormLabels(): AccessibilityIssue[] {
    if (typeof document === 'undefined') return [];

    const issues: AccessibilityIssue[] = [];
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);

      if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
        issues.push({
          type: 'error',
          rule: 'WCAG 1.3.1 - Info and Relationships',
          message: 'Form input missing label or aria-label',
          element: input.outerHTML.substring(0, 100),
          wcagLevel: 'A',
        });
      }
    });

    return issues;
  }

  /**
   * Check for sufficient color contrast
   * Note: This is a simplified check. Use axe-core for comprehensive testing
   */
  checkColorContrast(): AccessibilityIssue[] {
    if (typeof document === 'undefined') return [];

    const issues: AccessibilityIssue[] = [];
    // This would require complex color contrast calculations
    // Recommend using axe-core or Lighthouse for comprehensive checks

    logger.info('Color contrast check requires browser tools or axe-core', {
      action: 'accessibility_check',
    });

    return issues;
  }

  /**
   * Check for keyboard accessibility
   */
  checkKeyboardAccessibility(): AccessibilityIssue[] {
    if (typeof document === 'undefined') return [];

    const issues: AccessibilityIssue[] = [];
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');

    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      
      // Check for negative tabindex (removes from tab order)
      if (tabIndex && parseInt(tabIndex) < 0) {
        issues.push({
          type: 'warning',
          rule: 'WCAG 2.1.1 - Keyboard',
          message: 'Interactive element has negative tabindex',
          element: element.outerHTML.substring(0, 100),
          wcagLevel: 'A',
        });
      }

      // Check buttons for accessible names
      if (element.tagName === 'BUTTON') {
        const hasText = element.textContent?.trim();
        const hasAriaLabel = element.hasAttribute('aria-label');
        const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');

        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push({
            type: 'error',
            rule: 'WCAG 4.1.2 - Name, Role, Value',
            message: 'Button missing accessible name',
            element: element.outerHTML.substring(0, 100),
            wcagLevel: 'A',
          });
        }
      }
    });

    return issues;
  }

  /**
   * Check for ARIA attributes
   */
  checkAriaAttributes(): AccessibilityIssue[] {
    if (typeof document === 'undefined') return [];

    const issues: AccessibilityIssue[] = [];
    const elementsWithAria = document.querySelectorAll('[role], [aria-label], [aria-labelledby]');

    elementsWithAria.forEach((element) => {
      const role = element.getAttribute('role');
      
      // Check for invalid roles
      const validRoles = [
        'alert', 'button', 'checkbox', 'dialog', 'link', 'menu', 'menuitem',
        'navigation', 'region', 'tab', 'tabpanel', 'textbox', 'img', 'search',
      ];

      if (role && !validRoles.includes(role)) {
        issues.push({
          type: 'error',
          rule: 'WCAG 4.1.2 - Name, Role, Value',
          message: `Invalid ARIA role: ${role}`,
          element: element.outerHTML.substring(0, 100),
          wcagLevel: 'A',
        });
      }
    });

    return issues;
  }

  /**
   * Run all accessibility checks
   */
  runAllChecks(): AccessibilityIssue[] {
    const allIssues = [
      ...this.checkImageAltText(),
      ...this.checkHeadingHierarchy(),
      ...this.checkFormLabels(),
      ...this.checkKeyboardAccessibility(),
      ...this.checkAriaAttributes(),
    ];

    // Log issues
    const errors = allIssues.filter(i => i.type === 'error');
    const warnings = allIssues.filter(i => i.type === 'warning');

    if (errors.length > 0) {
      logger.error(`Found ${errors.length} accessibility errors`, {
        action: 'accessibility_check',
        metadata: { errorCount: errors.length, warningCount: warnings.length },
      });
    }

    if (process.env.NODE_ENV === 'development' && allIssues.length > 0) {
      console.group('♿ Accessibility Issues');
      allIssues.forEach(issue => {
        const logFn = issue.type === 'error' ? console.error : console.warn;
        logFn(`[${issue.wcagLevel}] ${issue.rule}: ${issue.message}`);
        if (issue.element) {
          console.log('Element:', issue.element);
        }
      });
      console.groupEnd();
    }

    this.issues = allIssues;
    return allIssues;
  }

  /**
   * Get issues summary
   */
  getSummary() {
    const errors = this.issues.filter(i => i.type === 'error').length;
    const warnings = this.issues.filter(i => i.type === 'warning').length;
    const info = this.issues.filter(i => i.type === 'info').length;

    return { errors, warnings, info, total: this.issues.length };
  }
}

// Export singleton instance
export const a11yChecker = new AccessibilityChecker();

// Hook for React components
export function useAccessibilityCheck() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Run check after component mount
    setTimeout(() => {
      a11yChecker.runAllChecks();
    }, 1000);
  }
}
