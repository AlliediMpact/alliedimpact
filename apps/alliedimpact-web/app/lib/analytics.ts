/**
 * Analytics utility using Mixpanel
 */

import mixpanel from 'mixpanel-browser';
import { createLogger } from '@allied-impact/shared';

const logger = createLogger('analytics');

let initialized = false;

export function initializeAnalytics() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  
  if (!token) {
    logger.warn('Mixpanel token not configured - analytics disabled');
    return;
  }

  if (initialized) return;

  mixpanel.init(token, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  });

  initialized = true;
  logger.info('Analytics initialized');
}

export const analytics = {
  /**
   * Track an event
   */
  track: (event: string, properties?: Record<string, any>) => {
    if (!initialized) return;
    
    try {
      mixpanel.track(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: 'web',
      });
    } catch (error) {
      logger.error('Analytics track failed', error as Error, { event });
    }
  },

  /**
   * Identify a user
   */
  identify: (userId: string, traits?: Record<string, any>) => {
    if (!initialized) return;
    
    try {
      mixpanel.identify(userId);
      if (traits) {
        mixpanel.people.set(traits);
      }
    } catch (error) {
      logger.error('Analytics identify failed', error as Error, { userId });
    }
  },

  /**
   * Track page view
   */
  page: (pageName: string, properties?: Record<string, any>) => {
    if (!initialized) return;
    
    try {
      mixpanel.track('Page Viewed', {
        page: pageName,
        ...properties,
      });
    } catch (error) {
      logger.error('Analytics page track failed', error as Error, { pageName });
    }
  },

  /**
   * Reset user (on logout)
   */
  reset: () => {
    if (!initialized) return;
    
    try {
      mixpanel.reset();
    } catch (error) {
      logger.error('Analytics reset failed', error as Error);
    }
  },
};

// Pre-defined events for type safety
export const AnalyticsEvents = {
  // Auth events
  SIGNUP_STARTED: 'Signup Started',
  SIGNUP_COMPLETED: 'Signup Completed',
  LOGIN_COMPLETED: 'Login Completed',
  LOGOUT_COMPLETED: 'Logout Completed',
  PASSWORD_RESET_REQUESTED: 'Password Reset Requested',

  // Product events
  PRODUCT_VIEWED: 'Product Viewed',
  PRODUCT_CLICKED: 'Product Clicked',
  
  // Subscription events
  SUBSCRIPTION_STARTED: 'Subscription Started',
  SUBSCRIPTION_COMPLETED: 'Subscription Completed',
  SUBSCRIPTION_CANCELLED: 'Subscription Cancelled',
  
  // Payment events
  PAYMENT_INITIATED: 'Payment Initiated',
  PAYMENT_COMPLETED: 'Payment Completed',
  PAYMENT_FAILED: 'Payment Failed',
  
  // Dashboard events
  DASHBOARD_VIEWED: 'Dashboard Viewed',
  PROFILE_UPDATED: 'Profile Updated',
  
  // Admin events
  ADMIN_DASHBOARD_VIEWED: 'Admin Dashboard Viewed',
  USER_MANAGED: 'User Managed',
};
