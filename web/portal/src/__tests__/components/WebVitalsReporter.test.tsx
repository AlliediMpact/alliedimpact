/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WebVitalsReporter } from '@/components/WebVitalsReporter';

// Mock Next.js web vitals
jest.mock('next/web-vitals', () => ({
  useReportWebVitals: jest.fn(),
}));

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  sendWebVitals: jest.fn(),
}));

describe('WebVitalsReporter', () => {
  it('should render without crashing', () => {
    const { container } = render(<WebVitalsReporter />);
    expect(container).toBeInTheDocument();
  });

  it('should not render any visible content', () => {
    const { container } = render(<WebVitalsReporter />);
    expect(container.firstChild).toBeNull();
  });

  it('should call useReportWebVitals hook', () => {
    const { useReportWebVitals } = require('next/web-vitals');
    
    render(<WebVitalsReporter />);
    
    expect(useReportWebVitals).toHaveBeenCalled();
  });

  it('should handle web vitals metrics', () => {
    const { useReportWebVitals } = require('next/web-vitals');
    const { sendWebVitals } = require('@/lib/analytics');

    // Get the callback function passed to useReportWebVitals
    useReportWebVitals.mockImplementation((callback) => {
      // Simulate web vital metric
      callback({
        id: 'test-id',
        name: 'CLS',
        value: 0.1,
        rating: 'good',
      });
    });

    render(<WebVitalsReporter />);

    expect(sendWebVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'CLS',
        value: 0.1,
      })
    );
  });

  it('should handle FCP metric', () => {
    const { useReportWebVitals } = require('next/web-vitals');
    const { sendWebVitals } = require('@/lib/analytics');

    useReportWebVitals.mockImplementation((callback) => {
      callback({
        id: 'fcp-id',
        name: 'FCP',
        value: 1500,
        rating: 'good',
      });
    });

    render(<WebVitalsReporter />);

    expect(sendWebVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'FCP',
      })
    );
  });

  it('should handle LCP metric', () => {
    const { useReportWebVitals } = require('next/web-vitals');
    const { sendWebVitals } = require('@/lib/analytics');

    useReportWebVitals.mockImplementation((callback) => {
      callback({
        id: 'lcp-id',
        name: 'LCP',
        value: 2500,
        rating: 'good',
      });
    });

    render(<WebVitalsReporter />);

    expect(sendWebVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'LCP',
      })
    );
  });

  it('should handle FID metric', () => {
    const { useReportWebVitals } = require('next/web-vitals');
    const { sendWebVitals } = require('@/lib/analytics');

    useReportWebVitals.mockImplementation((callback) => {
      callback({
        id: 'fid-id',
        name: 'FID',
        value: 100,
        rating: 'good',
      });
    });

    render(<WebVitalsReporter />);

    expect(sendWebVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'FID',
      })
    );
  });

  it('should handle TTFB metric', () => {
    const { useReportWebVitals } = require('next/web-vitals');
    const { sendWebVitals } = require('@/lib/analytics');

    useReportWebVitals.mockImplementation((callback) => {
      callback({
        id: 'ttfb-id',
        name: 'TTFB',
        value: 600,
        rating: 'good',
      });
    });

    render(<WebVitalsReporter />);

    expect(sendWebVitals).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'TTFB',
      })
    );
  });
});
