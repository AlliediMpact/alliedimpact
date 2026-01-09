'use client';

import { useEffect } from 'react';
import { a11yChecker } from '@/lib/accessibility';

/**
 * Accessibility Monitor Component
 * Runs accessibility checks in development mode
 */
export function AccessibilityMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Run checks after page load
      const timeoutId = setTimeout(() => {
        const issues = a11yChecker.runAllChecks();
        const summary = a11yChecker.getSummary();

        if (summary.total > 0) {
          console.info(
            `♿ Accessibility Summary: ${summary.errors} errors, ${summary.warnings} warnings, ${summary.info} info`
          );
        } else {
          console.info('♿ No accessibility issues found!');
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  return null;
}
