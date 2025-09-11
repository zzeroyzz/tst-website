// components/skeleton/AppointmentsSkeleton.tsx
import React from 'react';
import { Skeleton } from './SkeletonBase';

interface AppointmentSkeletonCardProps {
  className?: string;
}

const AppointmentSkeletonCard = ({ className = '' }: AppointmentSkeletonCardProps) => {
  return (
    <div
      className={`bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm transition-shadow min-h-[200px] flex flex-col ${className}`}
    >
      {/* Header with status and actions */}
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-6 w-20 rounded-full" /> {/* Status badge */}
        <Skeleton className="h-8 w-8 rounded" /> {/* More actions button */}
      </div>

      {/* Contact info */}
      <div className="mb-3 flex-grow">
        <Skeleton className="h-5 w-32 mb-2" /> {/* Name */}
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" /> {/* Mail icon */}
            <Skeleton className="h-4 w-40" /> {/* Email */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" /> {/* Phone icon */}
            <Skeleton className="h-4 w-28" /> {/* Phone */}
          </div>
        </div>
      </div>

      {/* Appointment time */}
      <div className="flex items-center gap-2 bg-gray-50 p-3 rounded border mb-3">
        <Skeleton className="h-4 w-4" /> {/* Clock icon */}
        <Skeleton className="h-4 w-48" /> {/* Date and time */}
      </div>

      {/* Notes section */}
      <div className="mt-auto">
        <Skeleton className="h-3 w-12 mb-1" /> {/* "Notes:" label */}
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
};

interface AppointmentsSkeletonProps {
  count?: number;
  showStats?: boolean;
  showFilters?: boolean;
}

export const AppointmentsSkeleton = ({
  count = 6,
  showStats = true,
  showFilters = true,
}: AppointmentsSkeletonProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" /> {/* Calendar icon */}
          <Skeleton className="h-8 w-32" /> {/* "Appointments" title */}
        </div>
        <Skeleton className="h-10 w-20" /> {/* Refresh button */}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
      )}

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gray-100 border-2 border-gray-200 rounded-lg p-4"
            >
              <Skeleton className="h-8 w-8 mb-2" /> {/* Count */}
              <Skeleton className="h-4 w-16" /> {/* Label */}
            </div>
          ))}
        </div>
      )}

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: count }, (_, i) => (
          <AppointmentSkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
};