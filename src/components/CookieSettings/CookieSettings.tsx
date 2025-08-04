//src/components/CookieSettings/CookieSettings.tsx
"use client";

import React, { useState } from 'react';
import CookiePreferences from '@/components/CookiePreferences/CookiePreferences';

const CookieSettings: React.FC = () => {
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPreferences(true)}
        className="text-sm font-bold underline bg-transparent border-none cursor-pointer"
      >
        Cookie Settings
      </button>

      <CookiePreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </>
  );
};

export default CookieSettings;
