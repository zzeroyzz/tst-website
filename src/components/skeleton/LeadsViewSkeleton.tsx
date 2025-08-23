// components/skeleton/LeadsViewSkeleton.tsx
import { Skeleton } from './SkeletonBase';

interface LeadsViewSkeletonProps {
  rowCount?: number;
}

export const LeadsViewSkeleton = ({ rowCount = 5 }: LeadsViewSkeletonProps) => {
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
