/**
 * Analytics utility using Mixpanel (Dashboard)
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
  track: (event: string, properties?: Record<string, any>) => {
    if (!initialized) return;
    
    try {
      mixpanel.track(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: 'dashboard',
      });
    } catch (error) {
      logger.error('Analytics track failed', error as Error, { event });
    }
  },

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

  reset: () => {
    if (!initialized) return;
    
    try {
      mixpanel.reset();
    } catch (error) {
      logger.error('Analytics reset failed', error as Error);
    }
  },
};

export const AnalyticsEvents = {
  DASHBOARD_VIEWED: 'Dashboard Viewed',
  PRODUCT_CLICKED: 'Product Clicked',
  SUBSCRIPTION_PAGE_VIEWED: 'Subscription Page Viewed',
  PROFILE_PAGE_VIEWED: 'Profile Page Viewed',
  PROFILE_UPDATED: 'Profile Updated',
  PASSWORD_CHANGED: 'Password Changed',
  ADMIN_DASHBOARD_VIEWED: 'Admin Dashboard Viewed',
  LOGOUT_CLICKED: 'Logout Clicked',
};
