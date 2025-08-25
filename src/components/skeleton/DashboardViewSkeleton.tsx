// components/skeleton/DashboardViewSkeleton.tsx
import { Skeleton } from './SkeletonBase';

export const DashboardViewSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Statistics Section */}
      <div>
        <Skeleton className="h-9 w-24 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border-2 border-black shadow-brutalistSm"
            >
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <div className="flex items-baseline gap-4">
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Section */}
      <div>
        <Skeleton className="h-9 w-24 mb-4" />
        <div className="bg-white p-4 rounded-lg border-2 border-black shadow-brutalistLg">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Weekday headers */}
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton
                key={`weekday-${index}`}
                className="h-4 w-6 mx-auto mb-2"
              />
            ))}
            {/* Calendar days */}
            {Array.from({ length: 35 }, (_, index) => (
              <div
                key={`day-${index}`}
                className="p-2 border border-gray-200 rounded-md min-h-[100px] bg-white"
              >
                <Skeleton className="h-4 w-4 mb-2" />
                <div className="space-y-1">
                  {Math.random() > 0.7 && (
                    <Skeleton className="h-4 w-full rounded" />
                  )}
                  {Math.random() > 0.8 && (
                    <Skeleton className="h-4 w-3/4 rounded" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
