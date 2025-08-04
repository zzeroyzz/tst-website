/* eslint-disable @typescript-eslint/no-explicit-any */

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track page views (for client-side navigation)
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    });
  }
};

// NEW: Enhanced contact form conversion tracking
export const trackContactFormConversion = (source: 'homepage' | 'contact', additionalData?: Record<string, any>) => {
  // Track the main conversion event that Google Ads can use
  trackEvent('contact_form_conversion', {
    event_category: 'conversion',
    event_label: `contact_form_${source}`,
    source: source,
    value: 1, // Assign a value for conversion optimization
    currency: 'USD',
    ...additionalData
  });

  // Also track as a 'generate_lead' event (Google Ads recommended event)
  trackEvent('generate_lead', {
    event_category: 'conversion',
    event_label: source,
    value: 1,
    currency: 'USD',
    ...additionalData
  });

  // Debug log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 Conversion tracked:', { source, additionalData });
  }
};

// Track form submissions
export const trackFormSubmission = (formName: string, success: boolean = true) => {
  trackEvent('form_submit', {
    form_name: formName,
    success: success,
  });
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location,
  });
};

// Track newsletter signup
export const trackNewsletterSignup = (method: string = 'form') => {
  trackEvent('newsletter_signup', {
    method: method,
  });
};

// Track consultation booking
export const trackConsultationBooking = (source: string = 'contact_form') => {
  trackEvent('consultation_booking', {
    source: source,
  });
};
