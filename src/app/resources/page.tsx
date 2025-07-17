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
import SubscribeModal from '@/components/SubscribeModal';
import { useSubscribeModalTrigger } from '@/hooks/useSubscribeModalTrigger';

const SinglePostPage = () => {
  const { slug } = useParams(); // Changed from id to slug
  const [post, setPost] = useState<Post | null>(null);
  const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClientComponentClient());
  const { isModalOpen, setIsModalOpen } = useSubscribeModalTrigger();

  useEffect(() => {
    const fetchPostAndSuggestions = async () => {
      if (!slug) return;
      setLoading(true);

      // Fetch post by slug
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('id, title, created_at, sent_at, image_url, tags, body, subject, toasty_take, archive_posts, status, slug')
        .eq('slug', slug as string) // Changed from 'id' to 'slug'
        .single();

      if (postError) {
        console.error('Error fetching post:', postError);
        setPost(null);
      } else {
        setPost(postData);

        // Fetch suggestions, excluding the current post by its ID and ensuring they have an image
        const { data: suggestionsData, error: suggestionsError } = await supabase
          .from('posts')
          .select('id, title, created_at, sent_at, image_url, tags, subject, toasty_take, archive_posts, status, body, slug')
          .eq('status', 'published')
          .neq('id', postData.id) // Exclude current post by ID
          .not('image_url', 'is', null) // FIX: Ensure image_url exists
          .neq('image_url', '',) // FIX: Ensure image_url is not an empty string
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
  }, [slug, supabase]); // Dependency array updated to slug

  if (loading) {
    return <Section><p className="text-center">Loading post...</p></Section>;
  }

  if (!post) {
    return <Section><p className="text-center">Post not found.</p></Section>;
  }

  const parsedBody = typeof post.body === 'string' ? marked.parse(post.body) : '';

  return (
    <main>
            <SubscribeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <Section className="pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 mb-6">
            <Link href="/resources" className="hover:underline">Resources</Link>
            <span className="mx-2">›</span>
            <Link href="/newsletter-archives" className="hover:underline">Archives</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium truncate">{post.title}</span>
          </nav>

          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Published on {format(new Date(post.sent_at || post.created_at), 'PPP')}
            </p>

            {/* Author Info */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                  <Image
                    src="/assets/profile-3.svg"
                    alt="Kay"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="font-semibold">Kay</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(post.sent_at || post.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

               {post.tags && post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="bg-tst-yellow text-xs font-bold px-3 py-1 rounded-full border-2 border-black">
                  {tag}
                </span>
              ))}
            </div>
          )}
            </div>
          </header>

          {post.image_url && (
            <div className="mb-8 flex justify-center">
              <div className="w-full max-w-4xl h-80 md:h-96 relative overflow-hidden rounded-lg">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  width={500}
                  height={600}
                  className="mx-auto"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                />
              </div>
            </div>
          )}

          {/* Post Content */}
          <article>
            <div
              className="prose prose-lg max-w-none font-sans prose-headings:font-bold prose-headings:text-black prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: parsedBody }}
            />
          </article>
        </div>
      </Section>

      {/* Suggested Posts Section */}
      {suggestedPosts.length > 0 && (
        <Section className="bg-tst-green border-t-2 border-black">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-8">You might also like...</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {suggestedPosts.map((suggestion) => (
                <ResourceCard
                  key={suggestion.id}
                  card={{
                    title: suggestion.title,
                    date: suggestion.sent_at ? format(new Date(suggestion.sent_at), "PPP") : format(new Date(suggestion.created_at), "PPP"),
                    author: "Kay",
                    authorImageUrl: "/assets/profile-3.svg",
                    imageUrl: suggestion.image_url || "/assets/profile-3.svg",
                    tags: suggestion.tags,
                    href: `/posts/${suggestion.slug}`,
                  }}
                />
              ))}
            </div>
          </div>
        </Section>
      )}
    </main>
  );
};

export default SinglePostPage;
