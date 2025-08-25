'use client';

import React from 'react';
import styles from './FocusAreaBanner.module.css';

export interface FocusAreaBannerProps {
  focusAreas: string[];
  className?: string;
}

const FocusAreaBanner: React.FC<FocusAreaBannerProps> = ({
  focusAreas,
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden py-6 ${className}`}>
      {/* Centered heading */}
      <h2 className="font-extrabold text-3xl md:text-4xl text-center mb-6">
        Our Specialities:
      </h2>

      <div className={`flex whitespace-nowrap ${styles.marquee}`}>
        {/* First set of items */}
        <div className="flex items-center space-x-4">
          {focusAreas.map((area, index) => (
            <div
              key={`first-${index}`}
              className="inline-flex justify-center items-center bg-tst-purple text-black font-medium text-sm px-4 py-2 rounded-lg border-2 border-black shadow-brutalistXs min-w-[200px] text-center"
            >
              {area.trim()}
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="w-8" />

        {/* Duplicate set */}
        <div className="flex items-center space-x-4">
          {focusAreas.map((area, index) => (
            <div
              key={`second-${index}`}
              className="inline-flex justify-center items-center bg-tst-teal text-black font-medium text-sm px-4 py-2 rounded-lg border-2 border-black shadow-brutalistXs min-w-[200px] text-center"
            >
              {area.trim()}
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="w-8" />

        {/* Third set */}
        <div className="flex items-center space-x-4">
          {focusAreas.map((area, index) => (
            <div
              key={`third-${index}`}
              className="inline-flex justify-center items-center bg-tst-yellow text-black font-medium text-sm px-4 py-2 rounded-lg border-2 border-black shadow-brutalistXs min-w-[200px] text-center"
            >
              {area.trim()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusAreaBanner;
