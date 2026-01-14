/**
 * Sentry Server Configuration
 * Error monitoring for server-side code and API routes
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV;

Sentry.init({
  dsn: SENTRY_DSN,
  
  environment: SENTRY_ENVIRONMENT,
  
  // Lower sample rate for server to reduce costs
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.05 : 1.0,
  
  // Filter sensitive data
  beforeSend(event) {
    if (SENTRY_ENVIRONMENT === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
      return null;
    }
    
    // Remove sensitive server data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
      delete event.request.env;
    }
    
    return event;
  },
});
