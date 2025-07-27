// src/app/posts/[slug]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Post } from '@/types';
import { format } from 'date-fns';
import Image from 'next/image';
import { marked } from 'marked';
import Section from '@/components/Section';
import ResourceCard from '@/components/ResourceCard';
import Link from 'next/link';
import CircleIcon from "@/components/CircleIcon";
import SubscribeModal from '@/components/SubscribeModal';
import { useSubscribeModalTrigger } from '@/hooks/useSubscribeModalTrigger';
import Button from "@/components/Button";
import { SinglePostSkeleton } from '@/components/skeleton';

const PostPageClient = () => {
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

      // Fetch post by slug
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('id, title, created_at, sent_at, image_url, tags, body, subject, toasty_take, archive_posts, status, slug')
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
            const parsed = await marked.parse(postData.body);
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
        showSuggestedPosts={true}
        showImage={true}
        contentParagraphs={6}
      />
    );
  }

  if (!post) {
    return <Section><p className="text-center">Post not found.</p></Section>;
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Resources",
        "item": "https://toastedsesametherapy.com/guides"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Archives",
        "item": "https://toastedsesametherapy.com/toasty-tidbits-archives"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://toastedsesametherapy.com/posts/${post.slug}`
      }
    ]
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <main className="bg-tst-cream">
      <SubscribeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Article Section */}
      <Section className="pt-12 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-8 font-medium">
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
          <header className="mb-12">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-tst-yellow text-xs font-bold px-3 py-2 rounded-full border-2 border-black shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
              {post.title}
            </h1>

            {/* Author and Date Info */}
            <div className="flex items-center gap-4 py-4">
              <div className="flex items-center gap-3">
                <CircleIcon
                  size="md"
                  bgColor="bg-tst-purple"
                  iconUrl="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg"
                  altText="Author Icon"
                />
                <div>
                  <p className="font-semibold text-gray-900">Kay</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(post.sent_at || post.created_at), 'MMM d, yyyy')} · 5 min read
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.image_url && (
            <div className="mb-12">
              <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 768px"
                />
              </div>
            </div>
          )}

          {/* Post Content */}
          <article className="mb-16">
            <div
              className="prose prose-lg prose-gray max-w-none
                prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mb-4 prose-headings:mt-8
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:pl-6 prose-blockquote:italic
                prose-ul:mb-6 prose-ol:mb-6 prose-li:mb-2
                prose-strong:font-semibold prose-strong:text-gray-900
                first-letter:text-6xl first-letter:font-bold first-letter:text-gray-900 first-letter:float-left first-letter:mr-3 first-letter:mt-1"
              dangerouslySetInnerHTML={{ __html: parsedBody }}
            />
          </article>

          {/* Article Footer */}
          <div className="border-t border-gray-400 pt-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CircleIcon
                  size="md"
                  bgColor="bg-tst-purple"
                  iconUrl="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg"
                  altText="Author Icon"
                />
                <div>
                  <p className="font-semibold text-gray-900">Kay</p>
                  <p className="text-sm text-gray-500">Therapist & Writer</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Follow
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Suggested Posts Section */}
      {suggestedPosts.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-400">
          <Section className="py-20">
            <div className="max-w-6xl mx-auto px-6">
              {/* Section Header */}
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                  More stories you might enjoy
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Continue your journey with these thoughtful reflections and insights.
                </p>
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {suggestedPosts.map((suggestion) => (
                  <div key={suggestion.id} className="group">
                    <ResourceCard
                      card={{
                        title: suggestion.title,
                        date: suggestion.sent_at ? format(new Date(suggestion.sent_at), "PPP") : format(new Date(suggestion.created_at), "PPP"),
                        author: "Kay",
                        authorImageUrl: "https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg",
                        imageUrl: suggestion.image_url || "https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/website%20assets/author-kay-icon.svg",
                        tags: suggestion.tags,
                        href: `/posts/${suggestion.slug}`,
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
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
