// components/skeleton/KanbanBoardSkeleton.tsx

import { Skeleton } from './SkeletonBase';

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
