// components/skeleton/SkeletonBase.tsx
import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility function

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton = ({ className, children, ...props }: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("bg-gray-200 animate-pulse rounded", className)}
      {...props}
    >
      {children}
    </div>
  );
};

