// src/components/PostStats/PostStats.tsx
'use client';

import React, { useState } from 'react';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import toast from 'react-hot-toast';

interface PostStatsProps {
  slug: string;
  title?: string;
  className?: string;
}

const PostStats: React.FC<PostStatsProps> = ({ slug, title, className = '' }) => {
  const { stats, loading, liking, toggleLike } = usePostInteractions(slug);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    const url = `${window.location.origin}/posts/${slug}`;
    const shareText = title ? `Check out this article: ${title}` : 'Check out this article';

    try {
      // Always try clipboard first for better UX
      await navigator.clipboard.writeText(url);

      // Show success toast
      toast.success('Link copied to clipboard!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '500',
        },
        icon: '🔗',
      });

      // Also try native share if available (optional)
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Article',
            text: shareText,
            url: url,
          });
        } catch (shareError) {
          // User probably canceled native share, but clipboard copy already succeeded
          console.log('Native share canceled or failed, but link was copied');
        }
      }

    } catch (error) {
      console.error('Error sharing:', error);

      // Show error toast
      toast.error('Failed to copy link. Please try again.', {
        duration: 4000,
        position: 'bottom-center',
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: '500',
        },
        icon: '❌',
      });
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="w-8 h-4 bg-gray-300 rounded"></div>
        </div>
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="w-8 h-4 bg-gray-300 rounded"></div>
        </div>
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {/* View Count */}
      <div className="flex items-center gap-2 text-gray-600">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-500"
        >
          <path
            d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12.0003 5C7.52166 5 3.73334 7.94288 2.45834 12C3.73334 16.0571 7.52166 19 12.0003 19C16.479 19 20.2673 16.0571 21.5423 12C20.2673 7.94288 16.479 5 12.0003 5Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <span className="text-sm font-medium">
          {stats.view_count.toLocaleString()}
        </span>
      </div>

      {/* Like Button */}
      <button
        onClick={toggleLike}
        disabled={liking}
        className={`flex items-center gap-2 transition-colors duration-200 hover:scale-105 transform ${
          stats.liked
            ? 'text-red-600'
            : 'text-gray-600 hover:text-red-600'
        } ${liking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={stats.liked ? "currentColor" : "none"}
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-200"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        <span className="text-sm font-medium">
          {stats.like_count.toLocaleString()}
        </span>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={sharing}
        className={`flex items-center gap-2 transition-colors duration-200 hover:scale-105 transform text-gray-600 hover:text-blue-600 ${
          sharing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        title="Copy link to clipboard"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-200"
        >
          <path
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-medium">
          {sharing ? 'Copying...' : 'Share'}
        </span>
      </button>
    </div>
  );
};

export default PostStats;
