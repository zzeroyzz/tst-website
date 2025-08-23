import { Skeleton } from './SkeletonBase';

// components/skeleton/SkeletonAvatar.tsx
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SkeletonAvatar = ({
  size = 'md',
  className = '',
}: SkeletonAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <Skeleton className={`${sizeClasses[size]} rounded-full ${className}`} />
  );
};
