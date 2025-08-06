// Now create the reusable SinglePostSkeleton using these components
// components/skeleton/SinglePostSkeleton.tsx
import Section from '@/components/Section/Section';
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonBreadcrumb,
  SkeletonHeader
} from './index';

interface SinglePostSkeletonProps {
  showSuggestedPosts?: boolean;
  showImage?: boolean;
  contentParagraphs?: number;
}

export const SinglePostSkeleton = ({
  showSuggestedPosts = true,
  showImage = true,
  contentParagraphs = 6
}: SinglePostSkeletonProps) => {
  return (
    <main className="bg-tst-cream">
      {/* Article Section */}
      <Section className="pt-12 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <SkeletonBreadcrumb items={3} />

          {/* Post Header */}
          <div className="mb-16">
            {/* Title */}
            <div className="mb-8">
              <Skeleton className="h-12 w-full mb-3 rounded-lg" />
              <Skeleton className="h-12 w-4/5 rounded-lg" />
            </div>

            {/* Author and Stats Row */}
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <SkeletonAvatar size="md" />
                <div>
                  <Skeleton className="h-5 w-12 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Post Stats Skeleton - Views and Likes */}
              <div className="flex items-center gap-6">
                {/* View Count Skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-4 w-8" />
                </div>
                {/* Like Count Skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {showImage && (
            <div className="mb-12">
              <Skeleton className="w-full h-64 md:h-80 lg:h-96 rounded-xl" />
            </div>
          )}

          {/* Post Content */}
          <article className="mb-16">
            <div className="space-y-6">
              {/* First paragraph with drop cap effect */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-16 flex-shrink-0 mt-1" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              {/* Additional paragraphs */}
              {Array.from({ length: contentParagraphs - 1 }, (_, index) => (
                <SkeletonText
                  key={index}
                  lines={3}
                  lastLineWidth={index % 2 === 0 ? '3/4' : '4/5'}
                />
              ))}

              {/* Subheading skeleton */}
              <Skeleton className="h-8 w-2/3 rounded-lg mt-8 mb-4" />

              <SkeletonText lines={4} lastLineWidth="2/3" />

              {/* Tags skeleton at bottom of article */}
              <div className="mt-12 flex flex-wrap gap-2 justify-center">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          </article>

          {/* Article Footer */}
          <div className="border-t border-gray-400 pt-8 mb-8">
            {/* Post Stats at bottom - larger version */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-6 text-lg">
                {/* View Count Skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="h-5 w-10" />
                </div>
                {/* Like Count Skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SkeletonAvatar size="md" />
                <div>
                  <Skeleton className="h-5 w-12 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      </Section>

      {/* Suggested Posts Section */}
      {showSuggestedPosts && (
        <div className="bg-gray-50 border-t border-gray-400">
          <Section className="py-20">
            <div className="max-w-6xl mx-auto px-6">
              {/* Section Header */}
              <div className="text-center mb-16">
                <Skeleton className="h-10 w-80 rounded-lg mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto" />
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {[1, 2, 3].map((index) => (
                  <SkeletonCard
                    key={index}
                    hasImage={true}
                    hasTags={true}
                    hasAuthor={true}
                  />
                ))}
              </div>

              {/* View all button */}
              <div className="mt-12 text-center">
                <SkeletonButton size="lg" width="w-36" className="mx-auto" />
              </div>
            </div>
          </Section>
        </div>
      )}
    </main>
  );
};

export default SinglePostSkeleton;
