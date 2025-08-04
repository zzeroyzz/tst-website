//src/components/CookiePreferences/CookiePreferences.tsx
"use client";

import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import Button from '@/components/Button/Button';

interface CookiePreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

const CookiePreferences: React.FC<CookiePreferencesProps> = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    essential: true, // Always enabled
    analytics: Cookies.get('cookieConsent') === 'accepted',
    marketing: Cookies.get('cookieConsent') === 'accepted',
  });

  const handleSave = () => {
    const consentValue = preferences.analytics || preferences.marketing ? 'accepted' : 'rejected';
    Cookies.set('cookieConsent', consentValue, { expires: 365 });

    // Update Google Analytics consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
        'ad_storage': preferences.marketing ? 'granted' : 'denied',
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-brutalistLg border-2 border-black max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Cookie Preferences</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Essential Cookies</h3>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Always On</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-left">
                These cookies are necessary for the website to function <br/>and cannot be disabled.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Analytics Cookies</h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    preferences.analytics ? 'bg-tst-purple justify-end' : 'bg-gray-300 justify-start'
                  }`}>
                    <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-600 text-left">
                Help us understand how visitors interact with our website.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Marketing Cookies</h3>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    preferences.marketing ? 'bg-tst-purple justify-end' : 'bg-gray-300 justify-start'
                  }`}>
                    <div className="w-4 h-4 bg-white rounded-full transition-transform"></div>
                  </div>
                </label>
              </div>
              <p className="text-sm text-gray-600 text-left">
                Used to track visitors across websites to display relevant ads.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={onClose} className="bg-gray-200">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-tst-purple">
              Save Preferences
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CookiePreferences;
