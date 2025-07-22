// components/skeleton/NewsletterViewSkeleton.tsx
import { Skeleton } from './SkeletonBase';

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
