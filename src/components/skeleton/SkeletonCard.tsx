// components/skeleton/SkeletonCard.tsx
import React from 'react';
import { Skeleton } from './SkeletonBase';

interface SkeletonCardProps {
  hasImage?: boolean;
  hasTags?: boolean;
  hasAuthor?: boolean;
  className?: string;
}

export const SkeletonCard = ({
  hasImage = true,
  hasTags = true,
  hasAuthor = true,
  className = '',
}: SkeletonCardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Image skeleton */}
      {hasImage && <Skeleton className="h-48 w-full rounded-none" />}

      {/* Content skeleton */}
      <div className="p-6">
        {/* Tags skeleton */}
        {hasTags && (
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        )}

        {/* Title skeleton */}
        <div className="mb-3">
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-4/5" />
        </div>

        {/* Author info skeleton */}
        {hasAuthor && (
          <div className="flex items-center gap-3 mt-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-12 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
