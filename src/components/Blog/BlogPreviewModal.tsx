// src/components/BlogPreviewModal.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import Button from '@/components/Button/Button';
import CircleIcon from '@/components/CircleIcon/CircleIcon';

interface BlogPreviewModalProps {
  title: string;
  body: string;
  imageUrl?: string;
  toastyTake?: string;
  tags: string[];
  onClose: () => void;
  onPublish: () => void;
  isPublishing: boolean;
}

const BlogPreviewModal: React.FC<BlogPreviewModalProps> = ({
  title,
  body,
  imageUrl,
  toastyTake,
  tags,
  onClose,
  onPublish,
  isPublishing,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-brutalistLg w-full max-w-6xl h-full flex flex-col border-2 border-black">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-black flex-shrink-0">
          <h2 className="text-2xl font-bold">Blog Post Preview</h2>
          <Button
            onClick={onClose}
            className="text-white bg-tst-red  transition-colors p-2"
            disabled={isPublishing}
          >
            <X size={24} />
          </Button>
        </div>

        {/* Preview Content - Scrollable */}
        <div className="flex-grow overflow-y-auto bg-tst-cream">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
            {/* Post Header */}
            <header className="mb-16">
              {/* Content Type Badge */}
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 text-sm font-bold rounded-full border-2 border-black bg-tst-teal text-white">
                  📝 Blog Post
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight text-gray-900">
                {title}
              </h1>

              <div className="border-t-2 border-b-2 border-gray-300 flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <CircleIcon
                    size="md"
                    bgColor="bg-tst-purple"
                    iconUrl="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg"
                    altText="Author Icon"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-base">Kay</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(), 'MMM d, yyyy')} · 5 min read
                    </p>
                  </div>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {imageUrl && (
              <div className="mb-16">
                <div
                  className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-brutalist border-2 border-black"
                  style={{ aspectRatio: '3/2' }}
                >
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 672px"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <article className="mb-20">
              <div className="text-lg leading-relaxed space-y-6 max-w-2xl mx-auto mt-12">
                {body
                  .split('\n')
                  .filter(line => line.trim() !== '')
                  .map((paragraph, index) => (
                    <p key={index} className="mb-6">
                      {paragraph.trim()}
                    </p>
                  ))}
              </div>

              {toastyTake && (
                <div className="mt-16 p-6 bg-white rounded-lg shadow-brutalist border-2 border-black max-w-2xl mx-auto">
                  <h2 className="text-xl font-bold mb-4">Toasty Take</h2>
                  <blockquote className="text-lg leading-relaxed italic">
                    &quot;{toastyTake}&quot;
                  </blockquote>
                </div>
              )}

              {/* Tags at bottom of article */}
              {tags && tags.length > 0 && (
                <div className="mt-12 max-w-2xl mx-auto">
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-bold rounded-full bg-tst-purple text-white border-2 border-black"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Article Footer */}
            <div className="border-t-2 border-gray-300 pt-12 mb-8">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <CircleIcon
                    size="md"
                    bgColor="bg-tst-purple"
                    iconUrl="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg"
                    altText="Author Icon"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-base">Kay</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Therapist & Writer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-4 border-t-2 border-black gap-4 flex-shrink-0">
          <div className="text-sm text-gray-600">
            Preview how your blog post will appear on the website
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="bg-gray-200"
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              onClick={onPublish}
              className="bg-tst-green text-white"
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Blog Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewModal;
