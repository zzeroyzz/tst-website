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
