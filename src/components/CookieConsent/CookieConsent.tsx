// src/components/CookieConsent/CookieConsent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button/Button';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = Cookies.get('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'accepted') {
      // User has already accepted, enable analytics
      enableAnalytics();
    }
  }, []);

  const enableAnalytics = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
      });
    }
  };

  const disableAnalytics = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
      });
    }
  };

  const handleAcceptAll = () => {
    Cookies.set('cookieConsent', 'accepted', { expires: 365 });
    enableAnalytics();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    Cookies.set('cookieConsent', 'rejected', { expires: 365 });
    disableAnalytics();
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Shadow */}
            <div className="absolute inset-0 bg-black rounded-lg transform translate-x-2 translate-y-2"></div>

            {/* Main banner */}
            <div className="relative bg-white border-2 border-black rounded-lg p-6 shadow-brutalistLg">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    🍪
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                      We use cookies to enhance your browsing experience, serve personalized content,
                      and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                    </p>

                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-200 pt-4 mt-4"
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm">Essential Cookies</h4>
                            <p className="text-xs text-gray-600">
                              Required for basic site functionality. Always enabled.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Analytics Cookies</h4>
                            <p className="text-xs text-gray-600">
                              Help us understand how visitors interact with our website by collecting
                              and reporting information anonymously.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">Marketing Cookies</h4>
                            <p className="text-xs text-gray-600">
                              Used to track visitors across websites to display relevant ads.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={handleCustomize}
                    className="text-sm font-medium text-gray-600 hover:text-gray-800 underline"
                  >
                    {showDetails ? 'Hide Details' : 'Customize'}
                  </button>
                  <Button
                    onClick={handleRejectAll}
                    className="bg-gray-200 text-black"
                  >
                    Reject All
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-tst-purple text-black"
                  >
                    Accept All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
