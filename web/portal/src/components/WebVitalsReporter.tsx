'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { logger } from '@/lib/logger';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Log Web Vitals metrics
    const { name, value, rating, id } = metric;

    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        metric_id: id,
        metric_value: value,
        metric_rating: rating,
      });
    }

    // Log poor performance metrics
    if (rating === 'poor') {
      logger.warn(`Poor Web Vital: ${name}`, {
        action: 'web_vitals',
        metadata: {
          name,
          value,
          rating,
          id,
        },
      });
    }

    // Log all metrics in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Web Vital: ${name}`, {
        action: 'web_vitals',
        metadata: { name, value, rating },
      });
    }
  });

  return null;
}
