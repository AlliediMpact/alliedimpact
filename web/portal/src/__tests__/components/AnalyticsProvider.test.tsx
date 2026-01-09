/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

// Mock Google Analytics
const mockGtag = jest.fn();
(global as any).gtag = mockGtag;

// Mock environment variable
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    mockGtag.mockClear();
  });

  it('should render children', () => {
    render(
      <AnalyticsProvider>
        <div>Test Child</div>
      </AnalyticsProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it('should not render GA script in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const { container } = render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>
    );

    const scripts = container.querySelectorAll('script');
    const hasGAScript = Array.from(scripts).some(script =>
      script.src.includes('googletagmanager')
    );

    expect(hasGAScript).toBe(false);

    process.env.NODE_ENV = originalEnv;
  });

  it('should handle missing GA measurement ID', () => {
    const originalId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    const { container } = render(
      <AnalyticsProvider>
        <div>Content</div>
      </AnalyticsProvider>
    );

    expect(container).toBeInTheDocument();

    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalId;
  });
});
