// src/components/skeleton/QuestionnaireSkeleton.tsx
import React from 'react';

const QuestionnaireSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-2xl mx-auto px-4">
        {/* Progress Bar Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-12 animate-pulse"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 border border-black overflow-hidden">
            <div className="bg-gray-300 h-full rounded-full w-1/4 animate-pulse"></div>
          </div>
        </div>

        {/* Main Card Skeleton */}
        <div className="bg-white rounded-xl border-2 border-black shadow-brutalistLg overflow-hidden">
          {/* Header Skeleton */}
          <div className="p-8 pb-6">
            <div className="text-center">
              {/* Title Skeleton */}
              <div className="h-8 bg-gray-300 rounded-lg w-3/4 mx-auto mb-4 animate-pulse"></div>
              {/* Subtitle Skeleton */}
              <div className="h-5 bg-gray-200 rounded-lg w-1/2 mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="px-8 pb-8">
            <div className="space-y-4">
              {/* Grid layout skeleton for buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Two buttons in grid */}
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-6 rounded-lg border-2 border-gray-200 min-h-[80px] animate-pulse"
                  >
                    {/* Radio button skeleton */}
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                    {/* Text skeleton */}
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full width button skeleton */}
              <div className="flex items-center gap-3 p-6 rounded-lg border-2 border-gray-200 min-h-[80px] animate-pulse">
                {/* Radio button skeleton */}
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                {/* Text skeleton */}
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Skeleton */}
          <div className="bg-gray-50 px-8 py-6 border-t-2 border-black">
            <div className="flex justify-between items-center gap-4">
              {/* Previous Button Skeleton */}
              <div className="flex items-center gap-2 min-w-fit">
                <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>

              {/* Continue Button Skeleton */}
              <div className="flex items-center gap-2 min-w-fit">
                <div className="w-24 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireSkeleton;
