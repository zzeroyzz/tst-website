/* eslint-disable @typescript-eslint/no-explicit-any */

// Add a utility to check if gtag is ready
const waitForGtag = (timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.gtag) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkGtag = () => {
      if (window.gtag) {
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        resolve(false);
      } else {
        setTimeout(checkGtag, 100);
      }
    };
    checkGtag();
  });
};

// Track custom events with better error handling
export const trackEvent = async (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  const gtagReady = await waitForGtag();
  if (!gtagReady) {
    console.warn('⚠️ gtag not ready, event not sent:', eventName);
    return;
  }

  try {
    window.gtag('event', eventName, {
      debug_mode: process.env.NODE_ENV === 'development',
      ...parameters
    });
  } catch (error) {
    console.error('❌ GA4 event failed:', eventName, error);
  }
};

// Ultra-simplified contact form conversion tracking
export const trackContactFormConversion = async (
  source: 'homepage' | 'contact',
  additionalData?: Record<string, any>
) => {
  const eventParams = {
    value: 1,
    currency: 'USD',
    source: source,
    ...additionalData,
  };

  await trackEvent('tst_contact_lead', eventParams);
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
