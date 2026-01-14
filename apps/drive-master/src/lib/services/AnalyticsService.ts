/**
 * Analytics Service for DriveMaster
 * Tracks user events with Firebase Analytics
 */

import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { getAnalytics, isSupported } from 'firebase/analytics';

class AnalyticsService {
  private analytics: any = null;
  private isInitialized: boolean = false;

  async init() {
    if (this.isInitialized) return;

    try {
      const supported = await isSupported();
      if (supported && typeof window !== 'undefined') {
        this.analytics = getAnalytics();
        this.isInitialized = true;
        console.log('✅ Firebase Analytics initialized');
      }
    } catch (error) {
      console.warn('Firebase Analytics not available:', error);
    }
  }

  private track(eventName: string, params?: Record<string, any>) {
    if (!this.isInitialized || !this.analytics) {
      console.log('[Analytics - Not Initialized]', eventName, params);
      return;
    }

    try {
      logEvent(this.analytics, eventName, params);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // User Management
  setUser(userId: string) {
    if (this.analytics) {
      setUserId(this.analytics, userId);
    }
  }

  setUserProperties(properties: Record<string, any>) {
    if (this.analytics) {
      setUserProperties(this.analytics, properties);
    }
  }

  // Journey Events
  trackJourneyStarted(journeyId: string, stage: number) {
    this.track('journey_started', {
      journey_id: journeyId,
      stage,
      timestamp: Date.now(),
    });
  }

  trackJourneyCompleted(journeyId: string, score: number, duration: number, passed: boolean) {
    this.track('journey_completed', {
      journey_id: journeyId,
      score,
      duration,
      passed,
      timestamp: Date.now(),
    });
  }

  trackJourneyAbandoned(journeyId: string, questionsAnswered: number) {
    this.track('journey_abandoned', {
      journey_id: journeyId,
      questions_answered: questionsAnswered,
      timestamp: Date.now(),
    });
  }

  // Stage Events
  trackStageMastered(stage: number) {
    this.track('stage_mastered', {
      stage,
      timestamp: Date.now(),
    });
  }

  trackStageUnlocked(stage: number) {
    this.track('stage_unlocked', {
      stage,
      timestamp: Date.now(),
    });
  }

  // Certificate Events
  trackCertificateEarned(certificateId: string, stage: number) {
    this.track('certificate_earned', {
      certificate_id: certificateId,
      stage,
      timestamp: Date.now(),
    });
  }

  trackCertificateDownloaded(certificateId: string) {
    this.track('certificate_downloaded', {
      certificate_id: certificateId,
      timestamp: Date.now(),
    });
  }

  trackCertificateShared(certificateId: string, platform: string) {
    this.track('certificate_shared', {
      certificate_id: certificateId,
      platform, // 'linkedin', 'twitter', etc.
      timestamp: Date.now(),
    });
  }

  // Achievement Events
  trackBadgeEarned(badgeId: string, badgeName: string) {
    this.track('badge_earned', {
      badge_id: badgeId,
      badge_name: badgeName,
      timestamp: Date.now(),
    });
  }

  trackStreakMilestone(days: number) {
    this.track('streak_milestone', {
      days,
      timestamp: Date.now(),
    });
  }

  trackCreditsEarned(amount: number, source: string) {
    this.track('credits_earned', {
      amount,
      source, // 'daily_bonus', 'purchase', 'achievement'
      timestamp: Date.now(),
    });
  }

  // Subscription Events
  trackSubscriptionStarted(tier: string, amount: number) {
    this.track('subscription_started', {
      tier,
      amount,
      currency: 'ZAR',
      timestamp: Date.now(),
    });
  }

  trackSubscriptionCancelled(tier: string, reason?: string) {
    this.track('subscription_cancelled', {
      tier,
      reason,
      timestamp: Date.now(),
    });
  }

  trackSubscriptionRenewed(tier: string, amount: number) {
    this.track('subscription_renewed', {
      tier,
      amount,
      currency: 'ZAR',
      timestamp: Date.now(),
    });
  }

  trackTrialStarted() {
    this.track('trial_started', {
      timestamp: Date.now(),
    });
  }

  trackTrialEnded(converted: boolean) {
    this.track('trial_ended', {
      converted,
      timestamp: Date.now(),
    });
  }

  // School Events
  trackSchoolViewed(schoolId: string, schoolName: string) {
    this.track('school_viewed', {
      school_id: schoolId,
      school_name: schoolName,
      timestamp: Date.now(),
    });
  }

  trackSchoolContacted(schoolId: string) {
    this.track('school_contacted', {
      school_id: schoolId,
      timestamp: Date.now(),
    });
  }

  // Engagement Events
  trackPageView(pageName: string) {
    this.track('page_view', {
      page_name: pageName,
      timestamp: Date.now(),
    });
  }

  trackFeatureUsed(featureName: string) {
    this.track('feature_used', {
      feature_name: featureName,
      timestamp: Date.now(),
    });
  }

  trackSearch(query: string, resultsCount: number) {
    this.track('search', {
      search_term: query,
      results_count: resultsCount,
      timestamp: Date.now(),
    });
  }

  trackFeedbackSubmitted(type: string) {
    this.track('feedback_submitted', {
      feedback_type: type, // 'bug', 'feature', 'general'
      timestamp: Date.now(),
    });
  }

  // Error Events
  trackError(errorType: string, errorMessage: string) {
    this.track('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      timestamp: Date.now(),
    });
  }

  // Performance Events
  trackPerformance(metricName: string, value: number) {
    this.track('performance_metric', {
      metric_name: metricName,
      value,
      timestamp: Date.now(),
    });
  }
}

// Singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;

// Initialize on import
if (typeof window !== 'undefined') {
  analyticsService.init();
}
