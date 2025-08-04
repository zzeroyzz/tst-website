/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';
import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  measurementId: string;
}

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ measurementId }) => {
  useEffect(() => {
    // Initialize gtag with consent mode
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];

      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }

      window.gtag = gtag;

      // Set default consent mode
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'wait_for_update': 500,
      });

      gtag('js', new Date());
      gtag('config', measurementId, {
        page_path: window.location.pathname,
      });
    }
  }, [measurementId]);

  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    return null;
  }

  return <NextGoogleAnalytics gaId={measurementId} />;
};

export default GoogleAnalytics;

