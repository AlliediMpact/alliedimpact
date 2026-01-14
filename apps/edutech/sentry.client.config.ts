/**
 * Sentry Client Configuration
 * Error monitoring for browser/client-side code
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Environment
  environment: SENTRY_ENVIRONMENT,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this in production
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Capture console errors
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/edutech\.alliedimpact\.co\.za/,
      ],
    }),
  ],
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events in development unless explicitly enabled
    if (SENTRY_ENVIRONMENT === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
      return null;
    }
    
    // Filter out sensitive information
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
    }
    
    return event;
  },
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors
    'Network request failed',
    'NetworkError',
    'Failed to fetch',
    // Firebase auth errors (expected)
    'auth/user-not-found',
    'auth/wrong-password',
  ],
});
