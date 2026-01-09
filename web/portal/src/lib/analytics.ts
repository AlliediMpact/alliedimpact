/**
 * Google Analytics 4 Integration
 * Track page views and custom events
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Initialize GA
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Load gtag.js script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
    });
  }
};

// Track page view
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom event
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Predefined event trackers
export const analytics = {
  // Auth events
  signUp: (method: string = 'email') => {
    trackEvent('sign_up', 'engagement', method);
  },

  login: (method: string = 'email') => {
    trackEvent('login', 'engagement', method);
  },

  logout: () => {
    trackEvent('logout', 'engagement');
  },

  // Product events
  viewProduct: (productId: string, productName: string) => {
    trackEvent('view_item', 'ecommerce', productName);
  },

  selectProduct: (productId: string, productName: string) => {
    trackEvent('select_item', 'ecommerce', productName);
  },

  // User actions
  contactFormSubmit: () => {
    trackEvent('form_submit', 'engagement', 'contact_form');
  },

  searchProducts: (searchTerm: string) => {
    trackEvent('search', 'engagement', searchTerm);
  },

  // Settings
  updateProfile: () => {
    trackEvent('update_profile', 'engagement');
  },

  changePassword: () => {
    trackEvent('change_password', 'engagement');
  },

  updatePreferences: (preferenceType: string) => {
    trackEvent('update_preferences', 'engagement', preferenceType);
  },
};

// Type declaration for window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
