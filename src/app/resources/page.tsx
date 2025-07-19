// src/app/resources/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import Image from "next/image";
import Section from "@/components/Section";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Highlight from "@/components/Highlight";
import ResourceCard from "@/components/ResourceCard";
import WallOfLove from "@/components/WallOfLove";
import LottieAnimation from "@/components/LottieAnimation";
import { Post } from "@/types";
import { toastyTidbitsAnimation } from "@/data/animations";

const ResourcesPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClientComponentClient());

  useEffect(() => {
    const fetchPublishedPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, created_at, sent_at, image_url, tags, slug")
        .eq("status", "published")
        .order("sent_at", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } else {
        setPosts(data as Post[]);
      }
      setLoading(false);
    };

    fetchPublishedPosts();
  }, [supabase]);

  return (
    <>
      <Section>
        <div className="flex flex-col items-center gap-16">

          <div className="grid md:grid-cols-2 gap-16 items-center w-full">
            <div className="flex flex-col items-center justify-center">
              <div className="w-full max-w-sm">
                <LottieAnimation animationData={toastyTidbitsAnimation} />
              </div>
              <div className="w-full max-w-xs -mt-10">
                <Image
                  src="https://pvbdrbaquwivhylsmagn.supabase.co/storage/v1/object/public/tst-assets/logo/toasty-tidbits-logo-letters.svg"
                  alt="Newsletter illustration"
                  width={400}
                  height={400}
                />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                Free Guides & Reflections
              </h1>
              <p className="text-lg">
                Join our free, weekly(ish) newsletter where we share actionable
                tips, practical life advice, and high-quality insights to help you
                on your healing journey, sent directly to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 mt-4">
                <Input
                  type="email"
                  placeholder="Your email"
                  name="email"
                  required
                  wrapperClassName="flex-grow"
                />
                <Button type="submit" className="bg-tst-purple">
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-gray-600 mt-2">
                By submitting this form, you&apos;ll be signed up to my free
                newsletter. You can opt-out at any time. For more information,
                see our{" "}
                <a href="/policy" className="underline">
                  privacy policy
                </a>
                .
              </p>
            </div>
          </div>
         <p className="text-5xl lg:text-6xl font-bold text-center w-full">
            Join over <Highlight color="#FFD666">1,000+</Highlight> friendly readers
          </p>
        </div>
      </Section>

      <WallOfLove />

      <Section className="mt-16 bg-tst-green border-t-2 border-black">
        <div className="mb-12 text-center px-4">
  <h2 className="text-5xl md:text-6xl font-extrabold">Catch up on our latest posts</h2>
  <p className="text-lg mt-2 font-500">
    Explore previous editions of our weekly reflections.
  </p>
</div>
        {loading ? (
          <p className="text-center">Loading posts...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <ResourceCard
                key={post.id}
                card={{
                  title: post.title,
                  date: post.sent_at ? format(new Date(post.sent_at), "PPP") : format(new Date(post.created_at), "PPP"),
                  author: "Kay",
                  authorImageUrl: "/assets/profile-3.svg",
                  imageUrl: post.image_url || "/assets/profile-3.svg",
                  tags: post.tags,
                  href: `/posts/${post.slug}`,
                }}
              />
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link href="/newsletter-archives">
            <Button className="bg-tst-yellow">View All Posts</Button>
          </Link>
        </div>
      </Section>
    </>
  );
};

export default ResourcesPage;
