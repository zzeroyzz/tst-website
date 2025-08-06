/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/PostPageClient.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Post } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { marked } from 'marked';
import Section from '@/components/Section/Section';
import ResourceCard from '@/components/ResourceCard/ResourceCard';
import Link from 'next/link';
import CircleIcon from "@/components/CircleIcon/CircleIcon";
import SubscribeModal from '@/components/SubscribeModal/SubscribeModal';
import { useSubscribeModalTrigger } from '@/hooks/useSubscribeModalTrigger';
import Button from "@/components/Button/Button";
import { SinglePostSkeleton } from '@/components/skeleton';
import PostStats from '@/components/PostStats/PostStats';
import styles from './PostPageClient.module.css'
// Configure marked with proper options for better parsing
marked.setOptions({
  breaks: true,
  gfm: true,
});

const PostPageClient: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [parsedBody, setParsedBody] = useState<string>('');
  const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClientComponentClient());
  const { isModalOpen, setIsModalOpen } = useSubscribeModalTrigger();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchPostAndSuggestions = async () => {
      if (!slug) return;
      setLoading(true);

      // Fetch post by slug - now including view_count and like_count
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('id, title, created_at, sent_at, image_url, tags, body, subject, toasty_take, archive_posts, status, slug, view_count, like_count')
        .eq('slug', slug as string)
        .single();

      if (postError) {
        console.error('Error fetching post:', postError);
        setPost(null);
      } else {
        setPost(postData);

        // Parse the markdown body
        if (postData.body && typeof postData.body === 'string') {
          try {
            let bodyToProcess = postData.body.trim();
            const paragraphs = bodyToProcess.split('\n').filter(line => line.trim() !== '');
            bodyToProcess = paragraphs.join('\n\n');

            const parsed = await marked.parse(bodyToProcess);
            setParsedBody(parsed);
          } catch (error) {
            console.error('Error parsing markdown:', error);
            setParsedBody(postData.body);
          }
        }

        // Fetch suggestions, excluding the current post by its ID
        const { data: suggestionsData, error: suggestionsError } = await supabase
          .from('posts')
          .select('id, title, created_at, sent_at, image_url, tags, subject, toasty_take, archive_posts, status, body, slug')
          .eq('status', 'published')
          .neq('id', postData.id)
          .order('sent_at', { ascending: false })
          .limit(3);

        if (suggestionsError) {
          console.error('Error fetching suggestions:', suggestionsError);
        } else {
          setSuggestedPosts(suggestionsData);
        }
      }
      setLoading(false);
    };

    fetchPostAndSuggestions();
  }, [slug, supabase]);

  // Show skeleton while loading
  if (loading) {
    return (
      <SinglePostSkeleton
        showSuggestedPosts
        showImage
        contentParagraphs={6}
      />
    );
  }

  if (!post) {
    return (
      <Section>
        <p className="text-center">Post not found.</p>
      </Section>
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Resources", "item": "https://toastedsesametherapy.com/guides"},
      {"@type": "ListItem", "position": 2, "name": "Archives", "item": "https://toastedsesametherapy.com/toasty-tidbits-archives"},
      {"@type": "ListItem", "position": 3, "name": post.title, "item": `https://toastedsesametherapy.com/posts/${post.slug}`}
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="bg-tst-cream min-h-screen">
        <SubscribeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        {/* Article Section */}
        <Section className="pt-16 pb-24">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-12 font-medium">
              <Link href="/guides" className="hover:text-gray-700 transition-colors">
                Resources
              </Link>
              <span className="mx-3 text-gray-300">›</span>
              <Link href="/toasty-tidbits-archives" className="hover:text-gray-700 transition-colors">
                Archives
              </Link>
              <span className="mx-3 text-gray-300">›</span>
              <span className="text-gray-900 truncate">{post.title}</span>
            </nav>

            {/* Post Header */}
            <header className="mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight text-gray-900">
                {post.title}
              </h1>

              <div className="border-t-2 border-b-2 border-gray-300 flex items-center justify-between py-6">
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
                      {format(new Date(post.sent_at || post.created_at), 'MMM d, yyyy')} · 5 min read
                    </p>
                  </div>
                </div>

                {/* Post Stats - Views and Likes */}
                <PostStats slug={post.slug} title={post.title} />
              </div>
            </header>

            {/* Featured Image - Fixed for 600x400 aspect ratio with smaller desktop size */}
            {post.image_url && (
              <div className="mb-16">
                <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-brutalist border-2 border-black"
                     style={{ aspectRatio: '3/2' }}>
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 672px"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <article className="mb-20">
               <div className="text-lg leading-relaxed space-y-6 max-w-2xl mx-auto mt-12">
                {post.body.split('\n').filter(line => line.trim() !== '').map((paragraph, index) => (
                  <p key={index} className="mb-6">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
              {post.toasty_take && (
                <div className="mt-16 p-6 bg-white rounded-lg shadow-brutalist border-2 border-black max-w-2xl mx-auto">
                  <h2 className="text-xl font-bold mb-4">Toasty Take</h2>
                  <blockquote className="text-lg leading-relaxed italic">
                    &quot;{post.toasty_take}&quot;
                  </blockquote>
                </div>
              )}

              {/* Tags at bottom of article - smaller size */}
              {post.tags && post.tags.length > 0 && (
                <div className={`${styles.tagsWrapper} mt-12 max-w-2xl mx-auto`}>
                  {post.tags.map(tag => (
                    <div
                      key={tag}
                      className={styles.tagWrapper}
                    >
                      <div className={styles.shadow}></div>
                      <div className={`${styles.tag} text-xs`}>
                        {tag}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            {/* Article Footer */}
            <div className="border-t-2 border-gray-300 pt-12 mb-8">
              {/* Post Stats - Also show at bottom */}
              <div className="flex items-center justify-center mb-8">
                <PostStats slug={post.slug} className="text-lg" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CircleIcon
                    size="md"
                    bgColor="bg-tst-purple"
                    iconUrl="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg"
                    altText="Author Icon"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-base">Kay</p>
                    <p className="text-sm text-gray-500 mt-1">Therapist & Writer</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  Follow
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* Suggested Posts */}
        {suggestedPosts.length > 0 && (
          <div className="bg-gray-50 border-t-2 border-gray-300">
            <Section className="py-24">
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-20">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
                    More stories you might enjoy
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Continue your journey with these thoughtful reflections and insights.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                  {suggestedPosts.map((suggestion) => (
                                            <div key={suggestion.id} className="group">
                      <ResourceCard
                        card={{
                          title: suggestion.title,
                          date: suggestion.sent_at ? format(new Date(suggestion.sent_at), "PPP") : format(new Date(suggestion.created_at), "PPP"),
                          author: "Kay",
                          authorImageUrl: "https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg",
                          imageUrl: suggestion.image_url || "",
                          tags: suggestion.tags,
                          href: `/posts/${suggestion.slug}`
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-16 text-center">
                  <Link href="/toasty-tidbits-archives">
                    <Button className="bg-tst-yellow">View all stories</Button>
                  </Link>
                </div>
              </div>
            </Section>
          </div>
        )}
      </main>
    </>
  );
};

export default PostPageClient;
