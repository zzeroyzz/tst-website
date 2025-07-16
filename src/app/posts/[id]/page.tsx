// src/app/posts/[id]/page.tsx
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
import SubscribeModal from '@/components/SubscribeModal'; // Import the modal
import { useSubscribeModalTrigger } from '@/hooks/useSubscribeModalTrigger';

const SinglePostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClientComponentClient());
  const { isModalOpen, setIsModalOpen } = useSubscribeModalTrigger();

  useEffect(() => {
    const fetchPostAndSuggestions = async () => {
      if (!id) return;
      setLoading(true);

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('id, title, created_at, sent_at, image_url, tags, body, subject, toasty_take, archive_posts, status')
        .eq('id', id)
        .single();

      if (postError) {
        console.error('Error fetching post:', postError);
        setPost(null);
      } else {
        setPost(postData);

        const { data: suggestionsData, error: suggestionsError } = await supabase
          .from('posts')
          .select('id, title, created_at, sent_at, image_url, tags, subject, toasty_take, archive_posts, status, body')
          .eq('status', 'published')
          .neq('id', id)
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
  }, [id, supabase]);

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

              {/* Social Share Icons */}
               {post.tags && post.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="bg-tst-yellow text-xs font-bold px-3 py-1 rounded-full border-2 border-black">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {/* TODO */}
              {/* <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div> */}
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

          {/* Tags */}


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
                    author: "Kay Hernandez",
                    authorImageUrl: "/assets/profile-3.svg",
                    imageUrl: suggestion.image_url || "/assets/profile-3.svg",
                    tags: suggestion.tags,
                    href: `/posts/${suggestion.id}`,
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
