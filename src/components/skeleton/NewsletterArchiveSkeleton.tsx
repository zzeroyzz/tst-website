// components/skeleton/NewsletterArchiveSkeleton.tsx
import Section from '@/components/Section/Section';
import { Skeleton } from './SkeletonBase';
import { SkeletonCard } from './index';

interface NewsletterArchiveSkeletonProps {
  cardCount?: number;
}

export const NewsletterArchiveSkeleton = ({
  cardCount = 9,
}: NewsletterArchiveSkeletonProps) => {
  return (
    <Section>
      {/* Header skeleton */}
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-80 mx-auto mb-4" />
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>

      {/* Filtering and Sorting Controls skeleton */}
      <div className="bg-white p-6 rounded-lg border-2 border-black shadow-brutalistLg mb-12">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Tag Filter skeleton */}
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          {/* Sort Filter skeleton */}
          <div>
            <Skeleton className="h-6 w-28 mb-2" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Results Count skeleton */}
      <div className="mb-6 text-center">
        <Skeleton className="h-5 w-48 mx-auto" />
      </div>

      {/* Post Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: cardCount }, (_, index) => (
          <SkeletonCard
            key={index}
            hasImage={true}
            hasTags={true}
            hasAuthor={true}
          />
        ))}
      </div>
    </Section>
  );
};
