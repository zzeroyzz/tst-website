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

// components/skeleton/LeadsViewSkeleton.tsx
interface LeadsViewSkeletonProps {
  rowCount?: number;
}

export const LeadsViewSkeleton = ({
  rowCount = 5
}: LeadsViewSkeletonProps) => {
  return (
    <div>
      {/* Header */}
      <Skeleton className="h-9 w-20 mb-6" />

      {/* Table container */}
      <div className="bg-white border-2 border-black rounded-lg shadow-brutalistLg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {/* Table header */}
            <thead className="border-b-2 border-black bg-gray-50">
              <tr>
                <th className="p-4">
                  <Skeleton className="h-5 w-1" />
                </th>
                <th className="p-4">
                  <Skeleton className="h-5 w-12" />
                </th>
                <th className="p-4">
                  <Skeleton className="h-5 w-16" />
                </th>
                <th className="p-4">
                  <Skeleton className="h-5 w-20" />
                </th>
                <th className="p-4">
                  <Skeleton className="h-5 w-14" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }, (_, index) => (
                <tr key={index} className="border-b border-gray-200">
                  {/* Status indicator */}
                  <td className="p-4">
                    <Skeleton className="w-3 h-3 rounded-full" />
                  </td>
                  {/* Name column */}
                  <td className="p-4">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  {/* Contact column */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </td>
                  {/* Date column */}
                  <td className="p-4">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  {/* Status column */}
                  <td className="p-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// components/skeleton/DashboardViewSkeleton.tsx
export const DashboardViewSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Statistics Section */}
      <div>
        <Skeleton className="h-9 w-24 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border-2 border-black shadow-brutalistSm">
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
              <Skeleton key={`weekday-${index}`} className="h-4 w-6 mx-auto mb-2" />
            ))}
            {/* Calendar days */}
            {Array.from({ length: 35 }, (_, index) => (
              <div key={`day-${index}`} className="p-2 border border-gray-200 rounded-md min-h-[100px] bg-white">
                <Skeleton className="h-4 w-4 mb-2" />
                <div className="space-y-1">
                  {Math.random() > 0.7 && <Skeleton className="h-4 w-full rounded" />}
                  {Math.random() > 0.8 && <Skeleton className="h-4 w-3/4 rounded" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// components/skeleton/KanbanBoardSkeleton.tsx
export const KanbanBoardSkeleton = () => {
  const columnNames = ['To-do', 'In Progress', 'Complete'];

  return (
    <div>
      {/* Header */}
      <Skeleton className="h-9 w-16 mb-6" />

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columnNames.map((columnName, columnIndex) => (
          <div key={columnIndex} className="flex flex-col p-4 rounded-lg bg-gray-100">
            {/* Column Header */}
            <div className="flex justify-between mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            {/* Column Tasks */}
            <div className="space-y-4 flex-grow min-h-[100px]">
              {Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, taskIndex) => (
                <div key={taskIndex} className="relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-black rounded-lg transform translate-x-1 translate-y-1"></div>
                  <div className="relative bg-white p-4 rounded-lg border-2 border-black">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    {Math.random() > 0.5 && <Skeleton className="h-3 w-full" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Task Button */}
            <Skeleton className="h-10 w-full rounded-lg mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

// components/skeleton/SkeletonText.tsx
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: 'full' | '3/4' | '1/2' | '1/3' | '2/3' | '4/5' | '5/6';
}

export const SkeletonText = ({
  lines = 3,
  className = "",
  lastLineWidth = '3/4'
}: SkeletonTextProps) => {
  const widthClasses = {
    'full': 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '2/3': 'w-2/3',
    '4/5': 'w-4/5',
    '5/6': 'w-5/6'
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${
            index === lines - 1 ? widthClasses[lastLineWidth] : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

// components/skeleton/SkeletonCard.tsx
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
  className = ""
}: SkeletonCardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Image skeleton */}
      {hasImage && (
        <Skeleton className="h-48 w-full rounded-none" />
      )}

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

// components/skeleton/SkeletonAvatar.tsx
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SkeletonAvatar = ({ size = 'md', className = "" }: SkeletonAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Skeleton
      className={`${sizeClasses[size]} rounded-full ${className}`}
    />
  );
};

// components/skeleton/SkeletonButton.tsx
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

// components/skeleton/SkeletonBreadcrumb.tsx
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

// components/skeleton/SkeletonHeader.tsx
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
  className = ""
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

// Now create the reusable SinglePostSkeleton using these components
// components/skeleton/SinglePostSkeleton.tsx
import Section from '@/components/Section';
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
          <SkeletonHeader
            hasTags={true}
            hasAuthor={true}
            titleLines={2}
          />

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
            </div>
          </article>

          {/* Article Footer */}
          <div className="border-t border-gray-400 pt-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SkeletonAvatar size="md" />
                <div>
                  <Skeleton className="h-5 w-12 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" />
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

// components/skeleton/NewsletterArchiveSkeleton.tsx
interface NewsletterArchiveSkeletonProps {
  cardCount?: number;
}

export const NewsletterArchiveSkeleton = ({
  cardCount = 9
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

// components/skeleton/NewsletterViewSkeleton.tsx
interface NewsletterViewSkeletonProps {
  rowCount?: number;
}

export const NewsletterViewSkeleton = ({
  rowCount = 5
}: NewsletterViewSkeletonProps) => {
  return (
    <div>
      {/* Header with title and button */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Table container */}
      <div className="bg-white border-2 border-black rounded-lg shadow-brutalistLg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {/* Table header */}
            <thead className="border-b-2 border-black bg-gray-50">
              <tr>
                <th className="p-4">
                  <Skeleton className="h-5 w-12" />
                </th>
                <th className="p-4">
                  <Skeleton className="h-5 w-10" />
                </th>
                <th className="p-4">
                  <Skeleton className="h-5 w-12" />
                </th>
                <th className="p-4">
                  <Skeleton className="h-5 w-14" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }, (_, index) => (
                <tr key={index} className="border-b border-gray-200">
                  {/* Title column */}
                  <td className="p-4">
                    <Skeleton className="h-5 w-48" />
                  </td>
                  {/* Tags column */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                  </td>
                  {/* Date column */}
                  <td className="p-4">
                    <Skeleton className="h-5 w-32" />
                  </td>
                  {/* Status column */}
                  <td className="p-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
