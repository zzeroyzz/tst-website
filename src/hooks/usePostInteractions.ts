// src/hooks/usePostInteractions.ts
import { useState, useEffect, useCallback } from 'react';

interface PostStats {
  view_count: number;
  like_count: number;
  liked: boolean;
}

export const usePostInteractions = (slug: string) => {
  const [stats, setStats] = useState<PostStats>({
    view_count: 0,
    like_count: 0,
    liked: false
  });
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  // Track view when component mounts
  useEffect(() => {
    if (!slug) return;

    const trackView = async () => {
      try {
        // Track the view
        await fetch(`/api/posts/${slug}/view`, {
          method: 'POST',
        });

        // Get current stats including like status
        const response = await fetch(`/api/posts/${slug}/like`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      } finally {
        setLoading(false);
      }
    };

    trackView();
  }, [slug]);

  // Toggle like function
  const toggleLike = useCallback(async () => {
    if (!slug || liking) return;

    setLiking(true);
    try {
      const response = await fetch(`/api/posts/${slug}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          like_count: data.like_count,
          liked: data.liked
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLiking(false);
    }
  }, [slug, liking]);

  return {
    stats,
    loading,
    liking,
    toggleLike
  };
};
