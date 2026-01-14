/**
 * Analytics & Event Tracking Service
 * 
 * Provides unified analytics tracking across the platform.
 * Integrates with Google Analytics 4, Sentry, and custom metrics.
 */

// Event names
export enum AnalyticsEvent {
  // Authentication
  USER_SIGNUP = 'user_signup',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  
  // Courses
  COURSE_VIEW = 'course_view',
  COURSE_ENROLL = 'course_enroll',
  COURSE_START = 'course_start',
  COURSE_COMPLETE = 'course_complete',
  
  // Lessons
  LESSON_START = 'lesson_start',
  LESSON_COMPLETE = 'lesson_complete',
  LESSON_VIDEO_PLAY = 'lesson_video_play',
  LESSON_VIDEO_PAUSE = 'lesson_video_pause',
  LESSON_VIDEO_COMPLETE = 'lesson_video_complete',
  
  // Quiz
  QUIZ_START = 'quiz_start',
  QUIZ_SUBMIT = 'quiz_submit',
  QUIZ_PASS = 'quiz_pass',
  QUIZ_FAIL = 'quiz_fail',
  
  // Subscriptions
  TRIAL_START = 'trial_start',
  TRIAL_END = 'trial_end',
  SUBSCRIPTION_ACTIVATE = 'subscription_activate',
  SUBSCRIPTION_CANCEL = 'subscription_cancel',
  SUBSCRIPTION_RENEW = 'subscription_renew',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAIL = 'payment_fail',
  
  // Forum
  FORUM_POST_CREATE = 'forum_post_create',
  FORUM_POST_VIEW = 'forum_post_view',
  FORUM_POST_UPVOTE = 'forum_post_upvote',
  FORUM_POST_REPLY = 'forum_post_reply',
  
  // Class Management
  CLASS_CREATE = 'class_create',
  CLASS_JOIN = 'class_join',
  ATTENDANCE_MARK = 'attendance_mark',
  PERFORMANCE_NOTE_ADD = 'performance_note_add',
  
  // Search & Discovery
  SEARCH_QUERY = 'search_query',
  FILTER_APPLY = 'filter_apply',
  
  // Engagement
  PAGE_VIEW = 'page_view',
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
}

export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track an analytics event
 */
export function trackEvent(
  eventName: AnalyticsEvent | string,
  properties?: EventProperties
) {
  if (typeof window === 'undefined') return;

  // Google Analytics 4
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, properties);
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, properties);
  }

  // Custom analytics endpoint (if needed)
  // sendToCustomAnalytics(eventName, properties);
}

/**
 * Track page view
 */
export function trackPageView(
  path: string,
  title?: string,
  properties?: EventProperties
) {
  trackEvent(AnalyticsEvent.PAGE_VIEW, {
    page_path: path,
    page_title: title || document.title,
    ...properties,
  });
}

/**
 * Track user properties
 */
export function setUserProperties(properties: EventProperties) {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag !== 'undefined') {
    window.gtag('set', 'user_properties', properties);
  }
}

/**
 * Identify user (after login)
 */
export function identifyUser(
  userId: string,
  properties?: {
    userType?: string;
    track?: string;
    subscriptionStatus?: string;
  }
) {
  if (typeof window === 'undefined') return;

  // Set user ID in GA4
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      user_id: userId,
    });
  }

  // Set user properties
  if (properties) {
    setUserProperties(properties);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('👤 User Identified:', userId, properties);
  }
}

/**
 * Track timing (performance metrics)
 */
export function trackTiming(
  category: string,
  variable: string,
  value: number,
  label?: string
) {
  trackEvent('timing_complete', {
    event_category: category,
    name: variable,
    value: Math.round(value),
    event_label: label,
  });
}

/**
 * Track error
 */
export function trackError(
  error: Error | string,
  context?: EventProperties
) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  trackEvent('error', {
    error_message: errorMessage,
    ...context,
  });

  // TODO: Send to Sentry
  if (process.env.NODE_ENV === 'production' && typeof error !== 'string') {
    // Sentry.captureException(error);
  }
}

/**
 * Track conversion (key business metrics)
 */
export function trackConversion(
  conversionType: string,
  value?: number,
  currency: string = 'ZAR'
) {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value: value,
    currency: currency,
  });
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: EventProperties
    ) => void;
  }
}
