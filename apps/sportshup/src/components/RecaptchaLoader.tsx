'use client';

import { useEffect } from 'react';

export default function RecaptchaLoader() {
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      return;
    }

    // Check if script already loaded
    if (document.getElementById('recaptcha-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount to avoid re-loading
    };
  }, []);

  return null;
}
