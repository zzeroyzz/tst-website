// components/skeleton/SkeletonHeader.tsx
import { Skeleton } from './SkeletonBase';
import { SkeletonAvatar } from './index';

interface SkeletonHeaderProps {
  hasTags?: boolean;
  hasAuthor?: boolean;
  titleLines?: number;
  className?: string;
}

export const SkeletonHeader = ({
  hasTags = true,
  hasAuthor = true,
  titleLines = 2,
  className = '',
}: SkeletonHeaderProps) => {
  return (
    <header className={`mb-12 ${className}`}>
      {/* Tags skeleton */}
      {hasTags && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      )}

      {/* Title skeleton */}
      <div className="mb-6">
        {Array.from({ length: titleLines }, (_, index) => (
          <Skeleton
            key={index}
            className={`h-12 md:h-14 lg:h-16 rounded-lg mb-3 ${
              index === titleLines - 1 ? 'w-4/5' : 'w-full'
            }`}
          />
        ))}
      </div>

      {/* Author and Date skeleton */}
      {hasAuthor && (
        <div className="flex items-center gap-4 py-4">
          <div className="flex items-center gap-3">
            <SkeletonAvatar size="md" />
            <div>
              <Skeleton className="h-5 w-12 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
