// src/components/DashboardSkeleton/DashboardSkeleton.tsx
import React from 'react';

export const DashboardSkeleton = () => {
  return (
    <div className="flex h-screen bg-gray-50 border-2 border-black relative">
      {/* Mobile Header Skeleton */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-50">
        <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Desktop Sidebar Skeleton */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-white border-r p-4 flex-col">
        <div className="flex items-center justify-between mb-10">
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        <nav className="flex-grow">
          {/* Admin Panel Menu Items */}
          <div className="space-y-2 mb-6">
            {[1, 2, 3, 4, 5, 6].map(item => (
              <div key={item} className="flex items-center p-3 rounded-lg">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mr-3"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Main Site Section */}
          <div className="mb-4">
            <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className="flex items-center p-3 rounded-lg">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mr-3"></div>
                  <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="flex items-center p-3 rounded-lg">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mr-3"></div>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-10 pt-20 md:pt-10">
          {/* Dashboard Title */}
          <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-8"></div>

          {/* Statistics Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(card => (
              <div
                key={card}
                className="bg-white border-2 border-black rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Reminders Section */}
          <div className="bg-white border-2 border-black rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Calendar Skeleton */}
            <div className="border border-gray-200 rounded-lg p-4">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center">
                    <div className="w-8 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => (
                  <div
                    key={i}
                    className="aspect-square flex items-center justify-center"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border-2 border-black rounded-lg p-6">
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(item => (
                <div
                  key={item}
                  className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
