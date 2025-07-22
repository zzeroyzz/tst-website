// components/skeleton/SkeletonButton.tsx
import { Skeleton } from './SkeletonBase';

interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  width?: string;
  className?: string;
}

export const SkeletonButton = ({
  size = 'md',
  width = 'w-24',
  className = ""
}: SkeletonButtonProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  return (
    <Skeleton
      className={`${sizeClasses[size]} ${width} rounded-lg ${className}`}
    />
  );
};
