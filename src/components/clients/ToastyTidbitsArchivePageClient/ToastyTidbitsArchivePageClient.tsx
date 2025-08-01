// src/app/toasty-tidbits-archives/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import Section from "@/components/Section/Section";
import ResourceCard from "@/components/ResourceCard/ResourceCard";
import { Post } from "@/types";
import { coreTags } from "@/data/tagData";
import SubscribeModal from '@/components/SubscribeModal/SubscribeModal';
import { useSubscribeModalTrigger } from '@/hooks/useSubscribeModalTrigger';
import { NewsletterArchiveSkeleton } from '@/components/skeleton';

const ToastyTidbitsArchivePageClient = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"new-to-old" | "old-to-new">("new-to-old");
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const supabase = createClientComponentClient();
  const { isModalOpen, setIsModalOpen } = useSubscribeModalTrigger();

  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, created_at, sent_at, image_url, tags, slug")
        .eq("status", "published")
        .order("sent_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
        setAllPosts([]);
      } else {
        setAllPosts(data as Post[]);
      }
      setLoading(false);
    };
    fetchAllPosts();
  }, [supabase]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = allPosts;

    if (selectedTags.length > 0) {
      filtered = allPosts.filter(post =>
        selectedTags.every(tag => post.tags?.includes(tag))
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.sent_at || a.created_at).getTime();
      const dateB = new Date(b.sent_at || b.created_at).getTime();
      return sortOrder === "new-to-old" ? dateB - dateA : dateA - dateB;
    });
  }, [allPosts, selectedTags, sortOrder]);

  // Show skeleton while loading
  if (loading) {
    return (
      <>
        <SubscribeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <NewsletterArchiveSkeleton cardCount={9} />
      </>
    );
  }

  return (
    <>
      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <Section>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold">Newsletter Archive</h1>
          <p className="text-lg mt-4">Browse all of our past publications.</p>
        </div>

        {/* Filtering and Sorting Controls */}
        <div className="bg-white p-6 rounded-lg border-2 border-black shadow-brutalistLg mb-12">
          <div className="grid md:grid-cols-2 gap-6 items-start">

            {/* Tag Filter Dropdown */}
            <div className="relative">
              <h3 className="font-bold mb-2">Filter by Tag:</h3>

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-tst-purple text-white px-3 py-1 text-sm font-bold rounded-full border-2 border-black"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="ml-1 text-white hover:text-gray-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearAllTags}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Dropdown Button */}
              <button
                onClick={() => {
                  setIsTagDropdownOpen(!isTagDropdownOpen);
                  setIsSortDropdownOpen(false); // Close sort dropdown
                }}
                className="w-full p-3 text-left bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-tst-purple flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {selectedTags.length > 0
                    ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`
                    : 'Select tags to filter...'
                  }
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isTagDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black rounded-lg max-h-60 overflow-y-auto" style={{ boxShadow: '4px 4px 0 0 black' }}>
                  {coreTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors ${
                        selectedTags.includes(tag) ? 'bg-tst-purple text-white' : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tag}</span>
                        {selectedTags.includes(tag) && (
                          <span className="text-sm">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <h3 className="font-bold mb-2">Sort by Date:</h3>

              {/* Sort Dropdown Button */}
              <button
                onClick={() => {
                  setIsSortDropdownOpen(!isSortDropdownOpen);
                  setIsTagDropdownOpen(false); // Close tag dropdown
                }}
                className="w-full p-3 text-left bg-white border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-tst-purple flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {sortOrder === "new-to-old" ? "Newest to Oldest" : "Oldest to Newest"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sort Dropdown Menu */}
              {isSortDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black rounded-lg overflow-hidden" style={{ boxShadow: '4px 4px 0 0 black' }}>
                  <button
                    onClick={() => {
                      setSortOrder("new-to-old");
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 transition-colors ${
                      sortOrder === "new-to-old" ? 'bg-tst-purple text-white' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Newest to Oldest</span>
                      {sortOrder === "new-to-old" && (
                        <span className="text-sm">✓</span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder("old-to-new");
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      sortOrder === "old-to-new" ? 'bg-tst-purple text-white' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Oldest to Newest</span>
                      {sortOrder === "old-to-new" && (
                        <span className="text-sm">✓</span>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Showing {filteredAndSortedPosts.length} of {allPosts.length} posts
            {selectedTags.length > 0 && (
              <span> filtered by: {selectedTags.join(', ')}</span>
            )}
          </p>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedPosts.map((post) => (
            <div key={post.id}>
              <ResourceCard
                card={{
                  title: post.title,
                  date: post.sent_at ? format(new Date(post.sent_at), "PPP") : format(new Date(post.created_at), "PPP"),
                  author: "Kay",
                  authorImageUrl: "https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg",
                  imageUrl: post.image_url || "https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg",
                  tags: post.tags,
                  href: `/posts/${post.slug}`,
                }}
              />
            </div>
          ))}
        </div>

        {filteredAndSortedPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">
              No posts match the selected filters.
            </p>
            {selectedTags.length > 0 && (
              <button
                onClick={clearAllTags}
                className="bg-tst-yellow text-black px-6 py-3 rounded-lg font-bold border-2 border-black hover:bg-yellow-400 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </Section>
    </>
  );
};

export default ToastyTidbitsArchivePageClient;
