import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['cookie'];
      delete event.request.headers['authorization'];
    }
    
    // Remove Firebase private keys from error messages
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map(value => ({
        ...value,
        value: value.value?.replace(/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g, '[PRIVATE_KEY_REDACTED]'),
      }));
    }
    
    return event;
  },
});
