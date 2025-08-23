/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/BlogDetailModal/BlogDetailModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Archive, ArchiveRestore, Edit, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import Button from '@/components/Button/Button';
import toast from 'react-hot-toast';
import type { Post } from '@/types';

// Status color helper function
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'published':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface BlogDetailModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: (
    postId: string,
    updatedData: Partial<Post>,
    successMessage?: string
  ) => Promise<boolean>;
  onArchive?: (postId: string) => Promise<boolean>;
  onUnarchive?: (postId: string) => Promise<boolean>;
  onEdit?: (postId: string) => void;
}

const BlogDetailModal: React.FC<BlogDetailModalProps> = ({
  post,
  onClose,
  onUpdate,
  onArchive,
  onUnarchive,
  onEdit,
}) => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [isUnarchiving, setIsUnarchiving] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleUpdatePost = async (
    postId: string,
    updatedData: Partial<Post>
  ) => {
    const success = await onUpdate(postId, updatedData);
    if (success) {
      // Update local post state to reflect changes immediately
      Object.assign(post, updatedData);
    }
  };

  const handleArchive = async () => {
    if (!onArchive) {
      toast.error('Archive functionality not available');
      return;
    }

    setIsArchiving(true);
    try {
      const success = await onArchive(post.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      toast.error('Failed to archive blog post');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    if (!onUnarchive) {
      toast.error('Unarchive functionality not available');
      return;
    }

    setIsUnarchiving(true);
    try {
      const success = await onUnarchive(post.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      toast.error('Failed to unarchive blog post');
    } finally {
      setIsUnarchiving(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post.id);
    }
    onClose();
  };

  const handleViewPublished = () => {
    if (post.status === 'published' && post.slug) {
      window.open(`/posts/${post.slug}`, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 overscroll-none">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain border-2 border-black">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
              {post.title}
              {post.archived && (
                <span className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded-full">
                  Archived
                </span>
              )}
            </h2>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusClasses(post.status)}`}
              >
                {post.status}
              </span>
              <span className="px-3 py-1 text-sm font-bold rounded-full bg-tst-teal text-white">
                📝 Blog Post
              </span>
            </div>
          </div>
          <Button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors bg-tst-red text-white flex-shrink-0"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Blog Content Preview */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Content Preview</h3>

            {/* Featured Image */}
            {post.image_url && (
              <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden border-2 border-gray-300">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
            )}

            {/* Body Content Preview */}
            <div
              className="bg-gray-50 p-4 rounded-lg border overflow-y-auto overscroll-contain"
              style={{ maxHeight: '16rem' }}
            >
              {' '}
              <div className="text-sm leading-relaxed space-y-3">
                {post.body
                  .split('\n')
                  .filter(line => line.trim() !== '')
                  .slice(0, 5)
                  .map((paragraph, index) => (
                    <p key={index} className="text-gray-700">
                      {paragraph.trim()}
                    </p>
                  ))}
                {post.body.split('\n').filter(line => line.trim() !== '')
                  .length > 5 && (
                  <p className="text-gray-500 italic">
                    ... (content continues)
                  </p>
                )}
              </div>
            </div>

            {/* Toasty Take */}
            {post.toasty_take && (
              <div
                className="bg-tst-green p-4 rounded-lg border-2 border-black overflow-y-auto overscroll-contain"
                style={{ maxHeight: '8rem' }}
              >
                <h4 className="font-bold mb-2">Toasty Take</h4>
                <blockquote className="italic text-gray-800">
                  &quot;{post.toasty_take}&quot;
                </blockquote>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div>
                <h4 className="font-bold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-bold rounded-full bg-tst-purple text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Blog Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Blog Information</h3>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-bold text-gray-600">Created</p>
                <p className="text-sm">{formatDate(post.created_at)}</p>
              </div>

              {post.sent_at && (
                <div>
                  <p className="text-sm font-bold text-gray-600">Published</p>
                  <p className="text-sm">{formatDate(post.sent_at)}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-gray-600">Status</p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${getStatusClasses(post.status)}`}
                >
                  {post.status}
                </span>
              </div>

              {post.slug && (
                <div>
                  <p className="text-sm font-bold text-gray-600">URL Slug</p>
                  <p className="text-xs font-mono bg-gray-200 p-1 rounded">
                    /posts/{post.slug}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-gray-600">
                  Public Visibility
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                    post.visible_to_public
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {post.visible_to_public
                    ? '✓ Visible to Public'
                    : '✗ Hidden from Public'}
                </span>
                {!post.visible_to_public && (
                  <p className="text-xs text-gray-500 mt-1">
                    This post won&apos;t appear in archives or be accessible via
                    URL
                  </p>
                )}
              </div>

              {post.view_count !== undefined && (
                <div>
                  <p className="text-sm font-bold text-gray-600">Views</p>
                  <p className="text-sm">{post.view_count || 0}</p>
                </div>
              )}

              {post.like_count !== undefined && (
                <div>
                  <p className="text-sm font-bold text-gray-600">Likes</p>
                  <p className="text-sm">{post.like_count || 0}</p>
                </div>
              )}
            </div>

            {/* Related Posts */}
            {post.archive_posts && post.archive_posts.length > 0 && (
              <div>
                <h4 className="font-bold mb-2">Related Posts</h4>
                <div className="text-sm text-gray-600">
                  {post.archive_posts.length} related post
                  {post.archive_posts.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            {/* Edit Button */}
            {onEdit && (
              <Button
                onClick={handleEdit}
                disabled={isArchiving || isUnarchiving}
                className="flex items-center gap-2 px-4 py-2 bg-tst-yellow text-black font-bold rounded-md border-2 border-black hover:bg-yellow-400 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Edit size={16} />
                Edit Post
              </Button>
            )}

            {/* View Published Button */}
            {post.status === 'published' &&
              post.slug &&
              post.visible_to_public &&
              !post.archived && (
                <Button
                  onClick={handleViewPublished}
                  disabled={isArchiving || isUnarchiving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-md border-2 border-black hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ExternalLink size={16} />
                  View Live
                </Button>
              )}

            {/* Toggle Public Visibility Button */}
            {post.status === 'published' && !post.archived && (
              <Button
                onClick={() =>
                  handleUpdatePost(post.id, {
                    visible_to_public: !post.visible_to_public,
                  })
                }
                disabled={isArchiving || isUnarchiving}
                className={`flex items-center gap-2 px-4 py-2 font-bold rounded-md border-2 border-black transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${
                  post.visible_to_public
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {post.visible_to_public
                  ? '👁️ Hide from Public'
                  : '👁️ Make Public'}
              </Button>
            )}

            {/* Archive/Unarchive Button */}
            {post.archived && onUnarchive ? (
              <Button
                onClick={handleUnarchive}
                disabled={isArchiving || isUnarchiving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-md border-2 border-black hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ArchiveRestore size={16} />
                {isUnarchiving ? 'Unarchiving...' : 'Unarchive Post'}
              </Button>
            ) : (
              !post.archived &&
              onArchive && (
                <Button
                  onClick={handleArchive}
                  disabled={isArchiving || isUnarchiving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white font-bold rounded-md border-2 border-black hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Archive size={16} />
                  {isArchiving ? 'Archiving...' : 'Archive Post'}
                </Button>
              )
            )}
          </div>

          <div className="text-sm text-gray-500">
            {post.archived
              ? 'Archived posts are hidden from public view'
              : 'Active posts are visible to the public'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailModal;
