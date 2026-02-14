'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import Link from 'next/link';

interface CookieConsentProps {
  appName?: string;
  privacyLink?: string;
  cookieLink?: string;
}

export function CookieConsentBanner({ 
  appName = 'Allied iMpact', 
  privacyLink = '/privacy',
  cookieLink = '/cookies'
}: CookieConsentProps) {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
    performance: true,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after 1 second delay
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: typeof preferences) => {
    const consentData = {
      timestamp: new Date().toISOString(),
      preferences: prefs,
      version: '1.0',
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    
    // Set analytics cookies based on consent
    if (typeof window !== 'undefined') {
      if (prefs.analytics) {
        // Enable Google Analytics
        window.gtag?.('consent', 'update', {
          analytics_storage: 'granted',
        });
      } else {
        // Disable Google Analytics
        window.gtag?.('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    }
    
    setVisible(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      functional: true,
      analytics: true,
      performance: true,
    });
  };

  const handleRejectNonEssential = () => {
    savePreferences({
      essential: true,
      functional: false,
      analytics: false,
      performance: false,
    });
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      {showCustomize && (
        <div 
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={() => setShowCustomize(false)}
        />
      )}

      {/* Banner */}
      <div className="max-w-6xl w-full mx-4 mb-6 pointer-events-auto">
        <div className="bg-background border-2 border-primary/20 rounded-xl shadow-2xl overflow-hidden">
          {/* Main Banner Content */}
          {!showCustomize ? (
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <Cookie className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">We Value Your Privacy</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We use cookies to enhance your experience on {appName}. Essential cookies keep you logged in and secure. 
                      Optional cookies help us analyze usage and improve our services. You can customize your preferences at any time.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <Link 
                      href={privacyLink} 
                      className="hover:text-primary underline transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <span>•</span>
                    <Link 
                      href={cookieLink} 
                      className="hover:text-primary underline transition-colors"
                    >
                      Cookie Policy
                    </Link>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={handleRejectNonEssential}
                      className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
                    >
                      Reject Non-Essential
                    </button>
                    <button
                      onClick={() => setShowCustomize(true)}
                      className="px-6 py-2.5 border-2 border-muted rounded-lg font-semibold hover:bg-secondary/50 transition-colors flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Customize
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setVisible(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Close banner"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Customize Panel */
            <div className="p-6 md:p-8 relative">
              <button
                onClick={() => setShowCustomize(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close customization"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-2xl font-bold mb-6">Customize Cookie Preferences</h3>

              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-start gap-4 p-4 bg-secondary/20 rounded-lg border border-muted">
                  <input
                    type="checkbox"
                    checked={preferences.essential}
                    disabled
                    className="mt-1 h-5 w-5 rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">Essential Cookies</h4>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Always Active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Required for authentication, security (CSRF protection), and basic functionality. Cannot be disabled.
                    </p>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start gap-4 p-4 border border-muted rounded-lg hover:bg-secondary/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Functional Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Remember your preferences like language, theme (dark/light mode), currency, and timezone settings.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start gap-4 p-4 border border-muted rounded-lg hover:bg-secondary/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Analytics Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Google Analytics (Firebase) to understand how you use our platform. IP addresses are anonymized.
                    </p>
                  </div>
                </div>

                {/* Performance Cookies */}
                <div className="flex items-start gap-4 p-4 border border-muted rounded-lg hover:bg-secondary/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.performance}
                    onChange={(e) => setPreferences({ ...preferences, performance: e.target.checked })}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Performance Cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Sentry error monitoring to identify bugs and improve platform reliability. Sensitive data is filtered.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Buttons */}
              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={handleSaveCustom}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 border-2 border-muted rounded-lg font-semibold hover:bg-secondary/50 transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="px-6 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params: { analytics_storage: 'granted' | 'denied' }
    ) => void;
  }
}
