/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/newsletter-archives/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import Section from "@/components/Section";
import ResourceCard from "@/components/ResourceCard";
import { Post } from "@/types";
import { coreTags } from "@/data/tagData";
import SubscribeModal from '@/components/SubscribeModal';
import { useSubscribeModalTrigger } from '@/hooks/useSubscribeModalTrigger';

const NewsletterArchivePage = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"new-to-old" | "old-to-new">("new-to-old");
  const supabase = createClientComponentClient();
  const { isModalOpen, setIsModalOpen } = useSubscribeModalTrigger();

  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, created_at, sent_at, image_url, tags")
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
        <div
          className="bg-white p-6 rounded-lg border-2 border-black shadow-brutalistLg mb-12">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="font-bold mb-2">Filter by Tag:</h3>
              <div className="flex flex-wrap gap-2">
                {coreTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-sm font-bold rounded-full border-2 border-black transition-colors ${
                      selectedTags.includes(tag) ? 'bg-tst-purple' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Sort by Date:</h3>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full p-2 rounded-lg border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-tst-purple"
              >
                <option value="new-to-old">Newest to Oldest</option>
                <option value="old-to-new">Oldest to Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Post Grid */}
        {loading ? (
          <p className="text-center">Loading posts...</p>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredAndSortedPosts.map((post) => (
              <div key={post.id}>
                <ResourceCard
                  card={{
                    title: post.title,
                    date: post.sent_at ? format(new Date(post.sent_at), "PPP") : format(new Date(post.created_at), "PPP"),
                    author: "Kay Hernandez",
                    authorImageUrl: "/assets/profile-3.svg",
                    imageUrl: post.image_url || "/assets/profile-3.svg",
                    tags: post.tags,
                    href: `/posts/${post.id}`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {filteredAndSortedPosts.length === 0 && !loading && (
          <p
            className="text-center text-lg col-span-full"
          >
            No posts match the selected filters.
          </p>
        )}
      </Section>
    </>
  );
};

export default NewsletterArchivePage;
