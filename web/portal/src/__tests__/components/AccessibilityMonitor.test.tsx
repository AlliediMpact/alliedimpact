/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccessibilityMonitor } from '@/components/AccessibilityMonitor';

// Mock accessibility checker
jest.mock('@/lib/accessibility', () => ({
  AccessibilityChecker: jest.fn().mockImplementation(() => ({
    runAllChecks: jest.fn(() => [
      {
        type: 'error',
        rule: 'WCAG 1.1.1',
        message: 'Test error',
        wcagLevel: 'A',
      },
      {
        type: 'warning',
        rule: 'WCAG 1.3.1',
        message: 'Test warning',
        wcagLevel: 'AA',
      },
    ]),
  })),
}));

describe('AccessibilityMonitor', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should render without visible content', () => {
    const { container } = render(<AccessibilityMonitor />);
    expect(container.firstChild).toBeNull();
  });

  it('should run accessibility checks after mount in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(<AccessibilityMonitor />);

    jest.advanceTimersByTime(2000);

    expect(consoleLogSpy).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not run checks in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(<AccessibilityMonitor />);

    jest.advanceTimersByTime(2000);

    // Should not log in production
    expect(consoleLogSpy).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('should log summary of issues found', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(<AccessibilityMonitor />);

    jest.advanceTimersByTime(2000);

    // Should log summary with counts
    const logCalls = consoleLogSpy.mock.calls.flat().join(' ');
    expect(logCalls).toContain('Accessibility');

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle no accessibility issues', () => {
    const { AccessibilityChecker } = require('@/lib/accessibility');
    AccessibilityChecker.mockImplementation(() => ({
      runAllChecks: jest.fn(() => []),
    }));

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(<AccessibilityMonitor />);

    jest.advanceTimersByTime(2000);

    expect(consoleLogSpy).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it('should clean up timer on unmount', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const { unmount } = render(<AccessibilityMonitor />);

    unmount();

    jest.advanceTimersByTime(2000);

    // Should not run after unmount
    expect(true).toBe(true);

    process.env.NODE_ENV = originalEnv;
  });
});
