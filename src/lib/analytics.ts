/* eslint-disable @typescript-eslint/no-explicit-any */

// Add a utility to check if gtag is ready
const waitForGtag = (timeout = 5000): Promise<boolean> => {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkGtag = () => {
      if (typeof window.gtag === 'function') {
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
export const trackEvent = async (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window === 'undefined') return;

  const gtagReady = await waitForGtag();
  if (!gtagReady) {
    console.warn('⚠️ gtag not ready, event not sent:', eventName);
    return;
  }

  try {
    window.gtag('event', eventName, {
      debug_mode: process.env.NODE_ENV === 'development',
      ...parameters,
    });
  } catch (error) {
    console.error('❌ GA4 event failed:', eventName, error);
  }
};

