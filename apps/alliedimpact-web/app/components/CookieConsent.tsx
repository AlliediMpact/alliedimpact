'use client';

import { useEffect, useState } from 'react';
import { initializeAnalytics } from '../lib/analytics';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    } else if (consent === 'accepted') {
      // Initialize analytics if consent was given
      initializeAnalytics();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
    initializeAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Cookie Consent</h3>
          <p className="text-sm text-muted-foreground">
            We use cookies to provide authentication, analyze site usage, and improve your experience. 
            By clicking "Accept", you consent to our use of cookies.{' '}
            <a href="/privacy-policy" className="underline hover:text-primary">
              Learn more
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-6 py-2 border rounded-lg hover:bg-accent transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
