// components/skeleton/SkeletonBreadcrumb.tsx
import React from 'react';
import { Skeleton } from './SkeletonBase';
interface SkeletonBreadcrumbProps {
  items?: number;
  className?: string;
}

export const SkeletonBreadcrumb = ({ items = 3, className = "" }: SkeletonBreadcrumbProps) => {
  return (
    <nav className={`mb-8 ${className}`}>
      <div className="flex items-center gap-3">
        {Array.from({ length: items }, (_, index) => (
          <React.Fragment key={index}>
            <Skeleton className="h-4 w-16" />
            {index < items - 1 && <span className="text-gray-300">›</span>}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};
