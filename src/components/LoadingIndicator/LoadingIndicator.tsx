'use client';

import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg p-6 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-bold text-black">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;